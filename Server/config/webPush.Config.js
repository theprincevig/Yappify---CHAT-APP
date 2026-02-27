// --------------------
// Import dependencies
// --------------------
const webpush = require('web-push'); // Library for handling push notifications

// --------------------
// Load environment variables
// --------------------
require('dotenv').config(); // Load .env file variables

// --------------------
// VAPID configuration
// --------------------
// VAPID keys authenticate push notification requests
webpush.setVapidDetails(
    'mailto:your-email@example.com', // Contact email (can be replaced with real one)
    process.env.VAPID_PUBLIC_KEY,    // Public VAPID key from .env
    process.env.VAPID_PRIVATE_KEY    // Private VAPID key from .env
);

// --------------------
// Export webpush
// --------------------
module.exports = webpush; // Export instance for routes/controllers
