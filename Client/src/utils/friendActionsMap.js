// utils/friendActionsMap.js

/**
 * friendActionsMap
 * ----------------
 * Maps friend-related actions to their respective handler functions,
 * success messages, and status/request type updaters.
 *
 * Usage:
 *   const actions = friendActionsMap(storeFunctions);
 *   await actions.add.fn(userId);
 */

export const friendActionsMap = (storeFunctions) => ({
    // --- Send a friend request ---
    add: { 
        // Async function to send a friend request
        fn: async (userId) => {
            const res = await storeFunctions.sendRequest(userId);
            return res; // Return API response
        }, 
        success: "Friend request sent!", // Success message
        getNewStatus: (res) => "pending", // Update status to 'pending'
        getNewRequestType: (res) => "sent" // Update request type to 'sent'
    },

    // --- Cancel a sent friend request ---
    cancel: { 
        fn: async (userId) => {
            const res = await storeFunctions.cancelRequest(userId);
            return res;
        }, 
        success: "Friend request canceled!",
        getNewStatus: () => "none", // Reset status
        getNewRequestType: () => null // Reset request type
    },

    // --- Accept a received friend request ---
    accept: { 
        fn: async (userId) => {
            const res = await storeFunctions.acceptRequest(userId);
            return res;
        }, 
        success: "Friend request accepted!",
        getNewStatus: () => "accepted", // Update status to 'accepted'
        getNewRequestType: () => null
    },

    // --- Reject a received friend request ---
    reject: { 
        fn: async (userId) => {
            const res = await storeFunctions.rejectRequest(userId);
            return res;
        }, 
        success: "Friend request rejected!",
        getNewStatus: () => "none",
        getNewRequestType: () => null
    },

    // --- Remove an existing friend ---
    remove: { 
        fn: async (userId) => {
            const res = await storeFunctions.removeFriend(userId);
            return res;
        }, 
        success: "Friend removed!",
        getNewStatus: () => "none",
        getNewRequestType: () => null
    },
});
