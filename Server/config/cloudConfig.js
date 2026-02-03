// --------------------
// Import dependencies
// --------------------
const cloudinary = require('cloudinary').v2; // Cloudinary library (v2 API)
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Storage engine for Multer

// --------------------
// Cloudinary configuration
// --------------------
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,      // Cloud name (unique for your Cloudinary account)
    api_key: process.env.CLOUD_API_KEY,      // API key for authentication
    api_secret: process.env.CLOUD_API_SECRET // API secret for secure API access
});

// --------------------
// Multer storage setup
// --------------------
const storage = new CloudinaryStorage({
    cloudinary: cloudinary, // Connect storage to configured Cloudinary instance
    params: {
        folder: 'yappify_Chat_App',           // All uploaded files stored inside this folder
        allowed_formats: ["png", "jpg", "jpeg"] // Restrict uploads to safe image formats
    },
});

// --------------------
// Export configuration
// --------------------
module.exports = { cloudinary, storage }; // Export for use in routes & controllers
