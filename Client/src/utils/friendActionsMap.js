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
        fn: async (userId) => await storeFunctions.sendRequest(userId),
        success: "Friend request sent!", // Success message
        getNewStatus: () => "pending", // Update status to 'pending'
        getNewRequestType: () => "sent" // Update request type to 'sent'
    },

    // --- Cancel a sent friend request ---
    cancel: { 
        fn: async (userId) => await storeFunctions.cancelRequest(userId),
        success: "Friend request canceled!",
        getNewStatus: () => "none", // Reset status
        getNewRequestType: () => null // Reset request type
    },

    // --- Accept a received friend request ---
    accept: { 
        fn: async (userId) => await storeFunctions.acceptRequest(userId),
        success: "Friend request accepted!",
        getNewStatus: () => "accepted", // Update status to 'accepted'
        getNewRequestType: () => null
    },

    // --- Reject a received friend request ---
    reject: { 
        fn: async (userId) => await storeFunctions.rejectRequest(userId),
        success: "Friend request rejected!",
        getNewStatus: () => "none",
        getNewRequestType: () => null
    },

    // --- Remove an existing friend ---
    remove: { 
        fn: async (userId) => await storeFunctions.removeFriends(userId),
        success: "Friend removed!",
        getNewStatus: () => "none",
        getNewRequestType: () => null
    },
});
