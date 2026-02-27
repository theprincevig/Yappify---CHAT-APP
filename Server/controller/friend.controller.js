// =====================
// IMPORTS & UTILITIES
// =====================
const FriendRequest = require("../models/friendRequest");
const User = require("../models/user.js");
const Chat = require("../models/chat.js");

const { sendNotificationToUser } = require("../services/pushNotification.service.js");
const emitToUser = require("../utils/emitToUser");

// --------------------
// SEND FRIEND REQUEST
// --------------------
module.exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user._id; // Logged-in user (sender ID)
    const { userId: receiverId } = req.params; // Extract receiver (target user) ID

    if (!receiverId) return res.status(400).json({ success: false, error: "UserId is required" });

    // Prevent sending a request to yourself
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ success: false, error: "You can't send a friend request to yourself." });
    }
    
    const receiverExist = await User.findById(receiverId);
    if (!receiverExist) return res.status(400).json({ success: false, error: "User not found" });

    // Check if request already exists (either direction)
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false, 
        error: "Friend request already exists.", 
        existing: true
      });
    }

    // Create new request
    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    // Send push notification to receiver
    if (receiverExist) {
      sendNotificationToUser(receiverExist._id, {
        title: "New Friend Request",
        body: `${req.user.username} sent you a friend request.`,
      });
    }

    // Emit socket event → notify receiver
    emitToUser(receiverId, "friendRequestReceived", {
      sender: {
        _id: senderId,
        username: req.user.username,
        profilePic: req.user.profilePic || "/avatar.png",
      },
      requestId: request._id,
    });

    return res.status(200).json({ success: true, message: "Friend request sent!", request });

  } catch (err) {
    console.error("Send request error:", err);
    return res.status(500).json({ success: false, error: "Something went wrong." });
  }
};

// --------------------
// CANCEL FRIEND REQUEST
// --------------------
module.exports.cancelRequest = async (req, res) => {
  try {
    const senderId = req.user._id; // Logged-in user (sender)
    const { userId: receiverId } = req.params; // Target user ID

    // Delete pending request
    const deleted = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (!deleted) {
      return res.status(400).json({ success: false, error: "No pending request found to cancel." });
    }

    return res.status(200).json({
      success: true,
      message: "Friend request canceled!",
      status: "none"
    });

  } catch (err) {
    console.error("Cancel request error:", err);
    return res.status(500).json({ success: false, error: "Something went wrong." });
  }
};

// --------------------
// ACCEPT FRIEND REQUEST
// --------------------
module.exports.acceptRequest = async (req, res) => {
  try {
    const receiverId = req.user._id; // Current user (acceptor)
    const { userId: senderId } = req.params; // Request sender ID

    // Update request status → accepted
    const request = await FriendRequest.findOneAndUpdate(
      { sender: senderId, receiver: receiverId, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!request) {
      return res.status(400).json({ success: false, error: "No pending request found." });
    }

    // Fetch both sender & receiver
    const sender = await User.findById(senderId).select("username profilePic");
    const receiver = await User.findById(receiverId).select("username profilePic");

    // Notify sender → request accepted
    if (sender) {
      sendNotificationToUser(sender._id, {
        title: "Friend Request Accepted",
        body: `${req.user.username} accepted your friend request.`,
      });
    }

    // Emit socket events to both
    emitToUser(senderId, "friendRequestAccepted", {
      friend: receiver,
      requestId: request._id
    });

    emitToUser(receiverId, "friendAdded", {
      friend: sender
    });

    return res.status(200).json({
      success: true,
      message: "Friend request accepted!",
      status: "accepted"
    });

  } catch (err) {
    console.error("Accept request error:", err);
    return res.status(500).json({ success: false, error: "Something went wrong." });
  }
};

// --------------------
// REJECT FRIEND REQUEST
// --------------------
module.exports.rejectRequest = async (req, res) => {
  try {
    const receiverId = req.user._id; // Current user (rejector)
    const { userId: senderId } = req.params; // Sender ID

    // Update request status → rejected
    const request = await FriendRequest.findOneAndUpdate(
      { sender: senderId, receiver: receiverId, status: "pending" },
      { status: "rejected" },
      { new: true },
    );

    if (!request) {
      return res.status(400).json({ success: false, error: "No pending request found." });
    }

    // Notify sender → request rejected
    const sender = await User.findById(senderId);
    if (sender) {
      sendNotificationToUser(sender._id, {
        title: "Friend Request Rejected",
        body: `${req.user.username} rejected your friend request.`,
      });
    }

    // Emit socket event to sender
    emitToUser(senderId, "friendRequestRejected", {
      userId: receiverId,
      requestId: request._id
    });

    return res.status(200).json({
      success: true,
      message: "Friend request rejected!",
      status: "none"
    });

  } catch (err) {
    console.error("Reject request error:", err);
    return res.status(500).json({ success: false, error: "Something went wrong." });
  }
};

// --------------------
// REMOVE FRIEND
// --------------------
module.exports.removeFriends = async (req, res) => {
  try {
    const userId = req.user._id; // Current user
    const { userId: friendId } = req.params; // Friend ID

    // Delete accepted friendship
    const removed = await FriendRequest.findOneAndDelete({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
      status: "accepted",
    });

    if (!removed) {
      return res.status(400).json({ success: false, error: "No friend connection found to remove." });
    }

    // Notify removed friend
    const removedUser = await User.findById(friendId);
    if (removedUser) {
      sendNotificationToUser(removedUser._id, {
        title: "Friend Removed",
        body: `${req.user.username} has removed you as a friend.`,
      });
    }

    // Emit socket event
    emitToUser(friendId, "friendRemoved", { userId });

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully!",
      status: "none"
    });

  } catch (err) {
    console.error("Remove friend error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------
// VIEW PENDING FRIEND REQUESTS
// --------------------
module.exports.getRequests = async (req, res) => {
  try {
    const userId = req.user._id; // Current user ID

    // Requests I sent
    const sent = await FriendRequest.find({
      sender: userId,
      status: "pending",
    }).populate("receiver", "username fullName profilePic bio");

    // Requests I received
    const received = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "username fullName profilePic bio");

    return res.status(200).json({
      success: true,
      requests: { sent, received },
    });

  } catch (err) {
    console.error("Get request error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------
// VIEW FRIEND LIST
// --------------------
module.exports.getFriends = async (req, res) => {
  try {
    const userId = req.user._id; // Current user

    // Find all accepted requests
    const connections = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    }).populate("sender receiver", "username fullName bio profilePic");

    // Extract actual friends (other user)
    const friendList = connections.map(conn => 
      conn.sender._id.equals(userId) 
          ? conn.receiver
          : conn.sender
    );

    const friendIds = friendList.map(friend => friend._id);

    // Fetch all chats in one query
    const chats = await Chat.find({
      participants: { $all: [userId] },
      // participants: { $in: friendIds }
    }).select("_id participants");

    // Map chats by friendIds for quick lookup
    const chatMap = {};

    chats.forEach(chat => {
      const friendId = chat.participants.find(
        id => !id.equals(userId) && friendIds.some(fId => fId.equals(id))
      );

      if (friendId) {
        chatMap[friendId.toString()] = chat._id;
      }
    });

    // Build final response
    const friends = friendList.map(friend => ({
      _id: friend._id,
      username: friend.username,
      fullName: friend.fullName,
      profilePic: friend.profilePic,
      bio: friend.bio,
      chatId: chatMap[friend._id.toString()] || null,
    }));

    return res.status(200).json({ success: true, friends });

  } catch (err) {
    console.error("Get Friends error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------
// SEARCH USER BY USERNAME
// --------------------
module.exports.searchUser = async (req, res) => {
  try {
    const { username } = req.query; // Username from query
    const currUserId = req.user._id; // Current user

    if (!username) {
      return res.status(400).json({ success: false, error: "Username query is required." });
    }

    // Find user by username
    const user = await User.findOne({
      username: { $regex: `^${username}$`, $options: "i" }
    })
      .select("username fullName bio profilePic");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found!" });
    }

    // Check request status
    const request = await FriendRequest.findOne({
      $or: [
        { sender: currUserId, receiver: user._id },
        { sender: user._id, receiver: currUserId },
      ],
    });

    let relationshipStatus = "none"; // Default
    if (request) {
      relationshipStatus = request.status;
    }

    return res.status(200).json({ success: true, user, relationshipStatus });

  } catch (err) {
    console.error("Search user error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------
// CHECK RELATIONSHIP STATUS
// --------------------
module.exports.checkStatus = async (req, res) => {
  try {
    const currUserId = req.user._id; // Current user
    const { userId: otherUserId } = req.params; // Other user ID

    // Cannot check against self
    if (currUserId.equals(otherUserId)) {
      return res.status(400).json({
        success: false,
        status: "self",
        message: "You cannot check status with yourself.",
      });
    }

    // Find request between the two users
    const request = await FriendRequest.findOne({
      $or: [
        { sender: currUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currUserId },
      ],
    });

    let relationshipStatus = "none"; // Default
    let sentBy = null; // Who sent request

    if (request) {
      relationshipStatus = request.status; // pending/accepted/rejected
      sentBy = request.sender.equals(currUserId) ? "me" : "them";
    }

    return res.status(200).json({
      success: true, 
      status: relationshipStatus, 
      sentBy
    });
    
  } catch (err) {
    console.error("Check status error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
