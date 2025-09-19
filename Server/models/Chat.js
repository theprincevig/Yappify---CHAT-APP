const mongoose = require("mongoose");           // Import mongoose
const Schema = mongoose.Schema;                 // Shortcut for mongoose.Schema

// --------------------
// Chat Schema
// --------------------
const chatSchema = new Schema({
    isGroupChat: {
        type: Boolean,                         // True if group chat, false for 1-to-1
        default: false
    },
    chatName: {
        type: String,                          // Optional name for the chat (group name)
        trim: true
    },
    participants: [{
        type: Schema.Types.ObjectId,           // Users in the chat
        ref: "User"
    }],
    groupAdmin: {
        type: Schema.Types.ObjectId,           // Admin of the group (if group chat)
        ref: "User"
    },
    latestMessage: {
        type: Schema.Types.ObjectId,           // Reference to latest message
        ref: "Message"
    }
}, { timestamps: true });                      // Automatically manage createdAt & updatedAt

// Export the Chat model (use existing if already compiled)
module.exports = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
