const mongoose = require('mongoose');           // Import mongoose
const Schema = mongoose.Schema;                 // Shortcut for mongoose.Schema

// --------------------
// Friend Request Schema
// --------------------
const friendRequestSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,  // User who sent the request
        ref: 'User',                           // Reference to User model
        required: true                          // Must have a sender
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,  // User who receives the request
        ref: 'User',                           // Reference to User model
        required: true                          // Must have a receiver
    },
    status: {
        type: String,                          // Current status of the request
        enum: ['pending', 'accepted', 'rejected'], // Only these values allowed
        default: 'pending'                     // Default status is pending
    }
}, { timestamps: true });                      // Automatically add createdAt & updatedAt

// Export the FriendRequest model (use existing if already compiled)
module.exports = mongoose.models.FriendRequest || mongoose.model('FriendRequest', friendRequestSchema);
