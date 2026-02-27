// Custom error class to standardize error handling in Express routes
class AppError extends Error {
    /**
     * @param {number} status - HTTP status code (e.g., 404, 500)
     * @param {string} message - Human-readable error message
     */
    constructor(status, message) {
        super(message);                  // Call the built-in Error constructor
        this.status = status;     // Store the HTTP status code
    }
}

// Export the class for use in controllers or middleware
module.exports = AppError;
