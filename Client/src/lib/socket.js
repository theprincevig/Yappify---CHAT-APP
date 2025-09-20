import { io } from "socket.io-client";

/**
 * Returns a socket.io client instance for the given user.
 *
 * @param {string} userId - The unique identifier for the user.
 * @returns {Socket|null} - Socket instance or null if no userId.
 */
export const getSocket = (userId) => {
    // If no userId is provided, do not create a socket
    if (!userId) return null;

    // ---------------------------------------------
    // Choose the correct server URL based on environment
    // ---------------------------------------------
    // - Production: Use relative path ('/')
    // - Development: Use API base URL from environment variables
    const URL = import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_BASE_URL   // local dev
        : '/';

    // ---------------------------------------------
    // Create and configure the socket.io client
    // ---------------------------------------------
    return io(URL, {
        autoConnect: false,      // Manual connection (handled elsewhere)
        withCredentials: true,   // Send cookies with requests
        auth: { userId },        // Pass userId for authentication
    });
}