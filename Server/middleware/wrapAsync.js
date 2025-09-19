// --------------------
// Async wrapper utility
// Wraps async route handlers to forward errors to Express
// --------------------
module.exports = (fn) => {
    return (req, res, next) => {
        // ✅ Execute the async function
        // ❌ Catch any errors and forward to next() (Express error handler)
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
