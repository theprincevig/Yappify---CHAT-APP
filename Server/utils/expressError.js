// Custom error class to standardize error handling in Express routes
class ExpressError extends Error {
    /**
     * @param {number} status - HTTP status code (e.g., 404, 500)
     * @param {string} message - Human-readable error message
     */
    constructor(status, message) {
        super();                  // Call the built-in Error constructor
        this.status = status;     // Store the HTTP status code
        this.message = message;   // Store the error message
    }
}

// Export the class for use in controllers or middleware
module.exports = ExpressError;
