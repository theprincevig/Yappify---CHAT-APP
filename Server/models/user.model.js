const mongoose = require('mongoose');              // Import mongoose
const Schema = mongoose.Schema;                    // Shortcut for mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose'); // Passport plugin for local auth

// --------------------
// User Schema
// --------------------
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,                             // User's email
        required: true,                           // Email is mandatory for registration
        lowercase: true,                         // Store email in lowercase
        unique: true,                            // Ensure email uniqueness
        trim: true
    },
    profilePic: {
        type: String,                             // URL of profile picture
        default: ""                               // Empty by default
    },
    fullName: {
        type: String,                             // Full name of user
        default: ""                               // Empty by default
    },
    bio: {
        type: String,                             // User biography / description
        default: ""                               // Empty by default
    },
    funMode: {
        type: String,                             // Mode selected by user after signup
        enum: [ "fun", "control", null ],         // Can be "fun", "control", or null (not selected yet)
        default: null                             // Not selected initially
    },
    funModeLocked: {
        type: Boolean,                            // If true, user cannot change mode
        default: false
    },
    notificationSubscription: {
        endpoint: String,                         // Push notification endpoint
        keys: {                                   // Encryption keys for web push
            p256dh: String,
            auth: String
        }
    },
    notificationsEnabled: {
        type: Boolean,                            // Whether user allows notifications
        default: true                             // Default true (only relevant for "control" mode)
    }
}, { timestamps: true });                         // Auto-create createdAt and updatedAt fields

// --------------------
// Passport plugin for local authentication (username + password)
// --------------------
userSchema.plugin(passportLocalMongoose);

// Export the model (use existing if already compiled)
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
