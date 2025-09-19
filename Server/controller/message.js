// Import the Message model
const Message = require("../models/message");
// Import the Chat model
const Chat = require("../models/chat");
// Import the FriendRequest model
const FriendRequest = require("../models/friendRequest");
// Import the push notification utility
const { sendNotificationToUser } = require("../utils/pushNotification");
// Import socket helpers and io instance
const { getReceiverSocketId, io } = require("../config/socket");

/**
 * 📌 Get all friends (from accepted requests) to display in the sidebar
 */
module.exports.getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user?._id; // Logged-in user's ID
    if (!loggedInUserId) return res.status(401).json({ error: "Unauthorized, user missing" });

    // Find all accepted friend requests where logged-in user is either sender or receiver
    const requests = await FriendRequest.find({
      status: "accepted",
      $or: [{ sender: loggedInUserId }, { receiver: loggedInUserId }],
    })
      .populate("sender", "fullName username profilePic")   // Populate sender details
      .populate("receiver", "fullName username profilePic"); // Populate receiver details

    // Convert requests into a list of friends with chatIds
    const friends = await Promise.all(requests.map(async req => {
      const friend = req.sender._id.equals(loggedInUserId) ? req.receiver : req.sender;

      // Check if a chat already exists between the logged-in user and friend
      let chat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: [loggedInUserId, friend._id], $size: 2 },
      });

      // If chat does not exist, create a new one
      if (!chat) {
        chat = await Chat.create({ isGroupChat: false, participants: [loggedInUserId, friend._id] });
      }

      // Return friend details along with the chat ID
      return { ...friend.toObject(), chatId: chat._id };
    }));

    // Send the list of friends back to the client
    res.status(200).json({ success: true, users: friends });
  } catch (error) {
    // console.error("Sidebar fetch error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * 📌 Get unread message counts for all chats of the logged-in user
 */
module.exports.getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user ID
    const chats = await Chat.find({ participants: userId }); // Find all chats where user is a participant

    const unreadCounts = {};
    // For each chat, count messages not read by the user and not sent by them
    await Promise.all(chats.map(async chat => {
      unreadCounts[chat._id] = await Message.countDocuments({
        chat: chat._id,
        readBy: { $ne: userId },
        sender: { $ne: userId },
      });
    }));

    res.status(200).json({ success: true, unreadCounts });
  } catch (error) {
    console.error("Unread counts error:", error);
    res.status(500).json({ success: false, error: "Failed to get unread counts" });
  }
};

/**
 * 📌 Get paginated messages for a specific chat
 */
module.exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;                // Chat ID
    const limit = parseInt(req.query.limit) || 20; // Number of messages to fetch (default 20)
    const skip = parseInt(req.query.skip) || 0;    // Number of messages to skip (for pagination)

    // Fetch messages with sorting, pagination, and populate required fields
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 }) // Sort messages oldest → newest
      .skip(skip)             // Skip for pagination
      .limit(limit)           // Limit number of messages
      .populate("sender", "username fullName profilePic") // Populate sender details
      .populate({ path: "replyTo", populate: { path: "sender", select: "username fullName" } }) // Populate reply-to details
      .populate({ path: "forwardedFrom", populate: { path: "sender", select: "username fullName" } }) // Populate forwarded-from details
      .populate("reactions.user", "username profilePic"); // Populate users who reacted

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

/**
 * 📌 Send a message (text or image)
 */
module.exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;                   // ID of logged-in user
    const { chatId, targetUserId } = req.params;     // Either chatId or targetUserId is provided
    const { content, replyTo, forwardedFrom } = req.body; // Message details

    let chat = chatId ? await Chat.findById(chatId) : null; // If chatId exists, fetch chat

    // If no chat found and targetUserId provided, create or fetch one-to-one chat
    if (!chat && targetUserId) {
      chat = await Chat.findOne({ isGroupChat: false, participants: { $all: [senderId, targetUserId], $size: 2 } });
      if (!chat) chat = await Chat.create({ isGroupChat: false, participants: [senderId, targetUserId] });
    }

    // If still no chat found, return error
    if (!chat) return res.status(400).json({ success: false, message: "Chat not found or could not be created." });

    // If no content and no image file, return error
    if (!content && !req.file) return res.status(400).json({ success: false, message: "Message content or image is required." });

    // Validate reply-to message if exists
    if (replyTo) {
      const repliedMessage = await Message.findById(replyTo);
      if (!repliedMessage) return res.status(400).json({ success: false, error: "Reply-to message not found." });
    }

    // Handle media if uploaded
    const mediaUrl = req.file?.path || null;
    const messageType = req.file ? "image" : "text";

    // Create new message
    const newMessage = await Message.create({
      chat: chat._id,
      sender: senderId,
      content,
      messageType,
      media: mediaUrl,
      replyTo,
      forwardedFrom,
      readBy: [senderId], // Mark sender as having read their own message
    });

    // Populate message fields before sending to client
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username fullName profilePic")
      .populate({ path: "replyTo", populate: { path: "sender", select: "username fullName" } })
      .populate({ path: "forwardedFrom", populate: { path: "sender", select: "username fullName" } })
      .populate("reactions.user", "username profilePic");

    // Update chat metadata with latest message
    chat.latestMessage = populatedMessage._id;
    chat.updatedAt = Date.now();
    await chat.save();

    // Respond to sender
    res.status(201).json({ success: true, message: populatedMessage, chatId: chat._id });

    // Broadcast new message + updated chat info to participants
    const populatedChat = await Chat.findById(chat._id).populate("participants").populate({
      path: "latestMessage",
      populate: { path: "sender", select: "username fullName profilePic" },
    });

    for (const user of populatedChat.participants) {
      if (user._id.equals(senderId)) continue; // Skip sender

      // Emit message in chat room
      io.to(chat._id.toString()).emit("newMessage", populatedMessage);

      // Emit to individual socket if user is online
      const receiverSocketId = getReceiverSocketId(user._id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage);
        io.to(receiverSocketId).emit("chatUpdated", populatedChat);
      } else {
        io.to(chat._id.toString()).emit("chatUpdated", populatedChat);
      }

      // Send push notification to user
      await sendNotificationToUser(user._id, {
        title: `New message from ${req.user.username}`,
        body: content || "Sent an image",
      });
    }
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
};

/**
 * 📌 Delete a message
 */
module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params; // Message ID to delete
    const userId = req.user._id;      // Logged-in user ID

    // Find message
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, error: "Message not found" });

    // Check ownership
    if (!message.sender.equals(userId)) return res.status(403).json({ success: false, error: "You can only delete your own messages" });

    // Mark as deleted and update content
    message.deleted = true;
    message.content = "This message was deleted...";
    await message.save();

    // Emit event to chat participants
    io.to(message.chat.toString()).emit("messageDeleted", { messageId: message._id, chatId: message.chat });

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, error: "Failed to delete message" });
  }
};

/**
 * 📌 React to a message with an emoji
 */
module.exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;     // Message ID
    const { emoji } = req.body;           // Emoji to react with
    const userId = req.user._id;          // Logged-in user ID

    if (!emoji || typeof emoji !== "string") return res.status(400).json({ success: false, error: "Valid emoji is required" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, error: "Message not found" });

    // Check if user already reacted
    const index = message.reactions.findIndex(r => r.user.equals(userId));
    if (index !== -1) {
      if (message.reactions[index].emoji === emoji) message.reactions.splice(index, 1); // Remove reaction if same emoji
      else message.reactions[index].emoji = emoji; // Update emoji if different
    } else {
      message.reactions.push({ emoji, user: userId }); // Add new reaction
    }

    await message.save();

    // Populate message with reaction info
    const populatedMessage = await Message.findById(messageId)
      .populate("sender", "username fullName profilePic")
      .populate("replyTo")
      .populate("forwardedFrom")
      .populate("reactions.user", "username profilePic");

    // Emit updated reactions
    io.to(message.chat.toString()).emit("messageReacted", { messageId, reactions: populatedMessage.reactions });

    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error("Reaction error:", error);
    res.status(500).json({ success: false, error: "Failed to react to message" });
  }
};

/**
 * 📌 Forward a message to another chat
 */
module.exports.forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;   // ID of message to forward
    const { targetChatId } = req.body;  // ID of target chat
    const senderId = req.user._id;      // Logged-in user ID

    if (!targetChatId) return res.status(400).json({ success: false, error: "Target chat ID is required" });

    // Find target chat and original message
    const targetChat = await Chat.findById(targetChatId).populate("participants");
    if (!targetChat) return res.status(404).json({ success: false, error: "Target chat not found" });

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) return res.status(404).json({ success: false, error: "Original message not found" });

    // Create forwarded message
    const newMessage = await Message.create({
      chat: targetChatId,
      sender: senderId,
      content: originalMessage.content,
      media: originalMessage.media,
      messageType: originalMessage.messageType,
      forwardedFrom: originalMessage._id,
      readBy: [senderId],
    });

    // Populate forwarded message
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username fullName profilePic")
      .populate({ path: "forwardedFrom", populate: { path: "sender", select: "username fullName" } })
      .populate("replyTo")
      .populate("reactions.user", "username profilePic");

    // Emit forwarded message to participants
    io.to(targetChatId.toString()).emit("messageForwarded", populatedMessage);

    // Notify participants except sender
    for (const user of targetChat.participants) {
      if (user._id.equals(senderId)) continue;

      const receiverSocketId = getReceiverSocketId(user._id);
      if (receiverSocketId) io.to(receiverSocketId).emit("messageForwarded", populatedMessage);

      await sendNotificationToUser(user._id, {
        title: `Message forwarded from ${req.user.username}`,
        body: populatedMessage.content || "Sent an image",
      });
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error("Forward message error:", error);
    res.status(500).json({ success: false, error: "Failed to forward message" });
  }
};

/**
 * 📌 Mark all messages in a chat as read
 */
module.exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params; // Chat ID
    const userId = req.user._id;   // Logged-in user ID

    // Update all unread messages by adding userId to readBy array
    await Message.updateMany({ chat: chatId, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } });

    // Emit event that messages were read
    io.to(chatId.toString()).emit("messagesRead", { chatId, readerId: userId });

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ success: false, error: "Failed to mark messages as read" });
  }
};
