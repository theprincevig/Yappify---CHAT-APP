const mongoose = require('mongoose');           // Import mongoose
const Schema = mongoose.Schema;                 // Shortcut for mongoose.Schema

// --------------------
// Message Schema
// --------------------
const messageSchema = new Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the Chat this message belongs to
        ref: "Chat",                           // Reference model
        required: true                          // Must belong to a chat
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,  // User who sent the message
        ref: "User",                           // Reference model
        required: true,                         // Must have a sender
        trim: true                              // Trim any extra spaces (mostly for strings, kept for consistency)
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,  // Users who have read the message
        ref: "User"                             // Reference to User model
    }],
    content: {
        type: String,                          // Text content of the message
        trim: true,                             // Remove extra whitespace
        required: function() {                  // Required only if media is not present
            return !this.media;                 
        }
    },
    media: String,                               // URL or path for media (image, etc.)
    messageType: {
        type: String,                           // Type of the message
        enum: [ "text", "image" ],              // Only text or image allowed
        default: "text"                          // Default type is text
    },
    deleted: {
        type: Boolean,                          // Indicates if the message was deleted
        default: false
    },
    reactions: [{
        emoji: String,                           // Emoji reaction
        user: {
            type: mongoose.Schema.Types.ObjectId, // User who reacted
            ref: "User"
        }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,    // Message this is replying to
        ref: "Message"
    },
    forwardedFrom: {
        type: mongoose.Schema.Types.ObjectId,    // Original message if forwarded
        ref: "Message"
    }
}, { timestamps: true });                       // Automatically add createdAt & updatedAt

// Export the Message model (use existing if already compiled)
module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
