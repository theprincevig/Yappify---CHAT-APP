// =======================
// Imports
// =======================
const Message = require("../models/message.model.js");
const FriendRequest = require("../models/friendRequest.model.js");
const Chat = require("../models/chat.model.js");
const { sendNotificationToUser } = require("../services/pushNotification.service.js");
const { getReceiverSocketId, io } = require("../config/socket.Config.js");

// =======================
// Helpers
// =======================
const ensureParticipant = (chat, userId) => {
  if (!chat.participants.some(p => p.equals(userId))) {
    const err = new Error("Access denied");
    err.status = 403;
    throw err;
  }
}

// =======================
// Get chats for sidebar
// =======================
module.exports.getChats = async (req, res) => {
  try {
    const userId = req.user?._id; // Logged-in user's ID

    // Find all accepted friend requests where logged-in user is either sender or receiver
    const requests = await FriendRequest.find({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "fullName username profilePic") // Populate sender details
      .populate("receiver", "fullName username profilePic"); // Populate receiver details

    // Check if a chat already exists between the logged-in user and friend
    const chats = await Promise.all(requests.map(async fr => {
      const friend = fr.sender._id.equals(userId) ? fr.receiver : fr.sender;

      // Check if a chat already exists between the logged-in user and friend
      const chat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: [userId, friend._id], $size: 2 },
      });

      // Return friend details along with the chat ID
      return { ...friend.toObject(), chatId: chat ? chat._id : null };
    }));

    // Send the list of friends back to the client
    res.status(200).json({ success: true, users: chats.filter(Boolean) });
  } catch (error) {
    console.error("Sidebar fetch error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// =======================
// Get messages (pagination)
// =======================
module.exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params; // Chat ID
    const limit = parseInt(req.query.limit) || 20; // Number of messages to fetch (default 20)
    const skip = parseInt(req.query.skip) || 0; // Number of messages to skip (for pagination)

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, error: "Chat not found." });

    ensureParticipant(chat, req.user._id);

    // Fetch messages with sorting, pagination, and populate required fields
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 }) // Sort messages oldest → newest
      .skip(skip)             // Skip for pagination
      .limit(limit)           // Limit number of messages
      .populate("sender", "username fullName profilePic") // Populate sender details
      .populate({              // Populate reply-to details
        path: "replyTo", 
        populate: { path: "sender", select: "username fullName" }
      })
      .populate({               // Populate forwarded-from details
        path: "forwardedFrom", 
        populate: { path: "sender", select: "username fullName" }
      })
      .populate("reactions.user", "username profilePic"); // Populate users who reacted

    res.status(200).json({ success: true, messages });

  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

// =======================
// Create chat
// =======================
module.exports.createChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: "Target user ID is required" });
    }

    if (userId.equals(targetUserId)) {
      return res.status(400).json({ success: false, error: "Can't create chat with yourself" });
    }

    // Check if they're friends
    const friendship = await FriendRequest.findOne({
      status: "accepted",
      $or: [
        { sender: userId, receiver: targetUserId },
        { sender: targetUserId, receiver: userId }
      ]
    });

    if (!friendship) {
      return res.status(400).json({
        success: false,
        error: "You can chat with friends only"
      });
    }

    // Check if chat already exist
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [userId, targetUserId], $size: 2 }
    });

    // If not exist, create ones
    if (!chat) {
      chat = await Chat.create({
        isGroupChat: false,
        participants: [userId, targetUserId]
      });
    }

    return res.status(200).json({
      success: false,
      chatId: chat._id,
      chat
    });

  } catch (error) {
    console.error("Create chat error:", error);
    return res.status(500).json({ success: false, error: "Failed to create chat" });
  }
};

// =======================
// Send message
// =======================
module.exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id; // ID of logged-in user
    const { chatId } = req.params; // Either chatId is provided
    const { content, replyTo, forwardedFrom } = req.body; // Message details

    if (!chatId) return res.status(400).json({ success: false, message: "Chat ID is required." });

    const chat = await Chat.findById(chatId); // If chatId exists, fetch chat
    if (!chat) return res.status(400).json({ success: false, message: "Chat not found." });

    ensureParticipant(chat, senderId);

    // If no content and no image file, return error
    if (!content && !req.file)
      return res.status(400).json({
        success: false,
        message: "Message text or image is required.",
      });

    // Validate reply-to message if exists
    if (replyTo) {
      const exists = await Message.exists({ _id: replyTo });
      if (!exists)
        return res
          .status(400)
          .json({ success: false, error: "Reply message not found." });
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
      .populate("reactions.user", "username profilePic")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "username fullName" },
      })
      .populate({
        path: "forwardedFrom",
        populate: { path: "sender", select: "username fullName" },
      });

    // Update chat metadata with latest message
    chat.latestMessage = newMessage._id;
    await chat.save();

    // Respond to sender
    res.status(201).json({ success: true, message: populatedMessage });
    
    // Emit message in chat room
    io.to(chat._id.toString()).emit("newMessage", populatedMessage);

    for (const userId of chat.participants) {
      if (userId.equals(senderId)) continue; // Skip sender

      // Emit to individual socket if user is online
      const socketId = getReceiverSocketId(userId);
      if (socketId) {
        io.to(socketId).emit("newMessage", populatedMessage);
      }

      // Send push notification to user
      await sendNotificationToUser(userId, {
        title: `New message from ${req.user.username}`,
        body: content || "Sent an image",
      });
    }
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ success: false, error: "Failed to send message" });
  }
};

// =======================
// Delete message
// =======================
module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params; // Message ID to delete
    const userId = req.user._id; // Logged-in user ID

    // Find message
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, error: "Message not found" });

    // Check ownership
    if (!message.sender.equals(userId)) {
      return res.status(403).json({ success: false, error: "Not allowed" });
    }

    // Mark as deleted and update content
    message.deleted = true;
    message.content = "This message was deleted";
    await message.save();

    // Emit event to chat participants
    io.to(message.chat.toString()).emit("messageDeleted", {
      messageId,
      chatId: message.chat,
    });

    res.json({ success: true, message });

  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ success: false, error: "Failed to delete message" });
  }
};

// =======================
// React / update reaction
// =======================
module.exports.upsertReaction = async (req, res) => {
  try {
    const { chatId, messageId } = req.params; // Chat ID & Message ID
    const { emoji } = req.body; // Emoji to react with
    const userId = req.user._id; // Logged-in user ID

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ success: false, error: "Emoji is required" });
    }

    const message = await Message.findOne({
      _id: messageId,
      chat: chatId
    });

    if (!message) return res.status(404).json({ success: false, error: "Message not found" });

    // Check if user already reacted
    const existingIndex = message.reactions.findIndex((r) => r.user.equals(userId));

    if (existingIndex !== -1) {
      if (message.reactions[existingIndex].emoji === emoji) {   // Remove reaction if same emoji
        message.reactions.splice(existingIndex, 1);
      } else {    // Update emoji if different
        existingIndex.emoji = emoji;
      }
    } else {
      message.reactions.push({ emoji, user: userId }); // Add new reaction
    }

    await message.save();

    // Emit updated reactions
    io.to(message.chat.toString()).emit("messageReacted", {
      messageId,
      reactions: message.reactions,
    });

    res.status(200).json({ success: true, reactions: message.reactions });

  } catch (error) {
    console.error("Reaction error:", error);
    return res.status(500).json({ success: false, error: "Failed to react to message" });
  }
};

// =======================
// Forward message
// =======================
module.exports.forwardMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params; // ID of message to forward
    const { targetUserId } = req.body; // ID of target chat
    const senderId = req.user._id; // Logged-in user ID

    const original = await Message.findOne({
      _id: messageId,
      chat: chatId
    });
    if (!original) return res.status(404).json({ success: false, error: "Message not found in this chat" });

    // Find target chat and original message
    let targetChat = await Chat.findOne({
      participants: { $all: [senderId, targetUserId] },
    });

    if (!targetChat) {
      targetChat = await Chat.create({
        participants: [senderId, targetUserId],
      });
    }

    ensureParticipant(targetChat, senderId);

    // Create forwarded message
    const forwarded = await Message.create({
      chat: targetUserId,
      sender: senderId,
      content: original.content,
      media: original.media,
      messageType: original.messageType,
      forwardedFrom: original._id,
      readBy: [senderId],
    });

    // Populate forwarded message
    const populated = await Message.findById(forwarded._id)
      .populate("sender", "username fullName profilePic")
      .populate("reactions.user", "username profilePic")
      .populate("replyTo")
      .populate({
        path: "forwardedFrom",
        populate: { path: "sender", select: "username fullName" },
      });

    // Emit forwarded message to participants
    io.to(targetUserId.toString()).emit("messageForwarded", populated);

    // Notify participants except sender
    for (const user of targetChat.participants) {
      if (user._id.equals(senderId)) continue;

      const receiverSocketId = getReceiverSocketId(user._id);
      if (receiverSocketId) io.to(receiverSocketId).emit("messageForwarded", populated);

      await sendNotificationToUser(user._id, {
        title: `Message forwarded from ${req.user.username}`,
        body: populated.content || "Sent an image",
      });
    }

    res.status(201).json({ success: true, message: populated });

  } catch (error) {
    console.error("Forward message error:", error);
    return res.status(500).json({ success: false, error: "Failed to forward message" });
  }
};

// =======================
// Mark messages as read
// =======================
module.exports.updateReadStatus = async (req, res) => {
  try {
    const { chatId } = req.params; // Chat ID
    const userId = req.user._id; // Logged-in user ID

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, error: "Chat not found" });

    ensureParticipant(chat, userId);

    // Update all unread messages by adding userId to readBy array
    await Message.updateMany(
      { chat: chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );

    // Emit event that messages were read
    io.to(chatId.toString()).emit("messagesRead", {
      chatId, 
      readerId: userId
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ success: false, error: "Failed to mark messages as read" });
  }
};
