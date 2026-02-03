import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';
import { API_PATHS } from '../utils/apiPaths';

/**
 * ============================
 * FRIEND STORE (ZUSTAND)
 * ============================
 * Handles all friend-related state and actions:
 * - Friends list
 * - Friend requests (sent/received)
 * - Search results
 * - API calls
 * - Real-time socket updates
 */

export const useFriendStore = create((set, get) => ({

    // -----------------------------------
    // STATE
    // -----------------------------------
    friends: [],                // List of current friends
    searchResult: null,         // Result of user search
    loading: false,             // Loading state for API actions
    pendingRequests: {          // Friend requests (sent & received)
        sent: [],
        received: []
    },
    isLoadingPending: false,    // Loading state for pending requests
    hasNewPending: false,

    // -----------------------------------
    // API ACTIONS
    // -----------------------------------
    setHasNewPending: (value) => set({ hasNewPending: value }),

    /**
     * Fetches the user's friends list from the server.
     */
    getFriends: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get(API_PATHS.FRIENDS.GET_FRIENDS);
            set({ friends: res.data.friends || [] });
        } catch (error) {
            console.error("Error fetching friends:", error.response?.data?.error || error.message);
            set({ friends: [] });
            throw new Error(error.response?.data?.error || "Something went wrong");
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Fetches all pending friend requests (sent & received).
     */
    getRequests: async () => {
        set({ isLoadingPending: true });
        try {
            const res = await axiosInstance.get(API_PATHS.FRIENDS.GET_REQUESTS);
            if (res.data?.success) {
                set({ pendingRequests: res.data.requests });
            }
        } catch (error) {
            console.error("Error fetching pending requests:", error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || "Something went wrong");
        } finally {
            set({ isLoadingPending: false });
        }
    },

    /**
     * Searches for a user by username.
     */
    searchUser: async (username) => {
        set({ loading: true, searchResult: null });
        try {
            const res = await axiosInstance.get(API_PATHS.FRIENDS.SEARCH(username));
            set({ searchResult: res.data.user });
            return res.data.user;
        } catch (error) {
            console.error("Search error:", error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || "Something went wrong");
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Sends a friend request to a user by ID.
     */
    sendRequest: async (userId) => {
        try {
            const res = await axiosInstance.post(API_PATHS.FRIENDS.SEND_REQUEST(userId));
            return res.data.message;
        } catch (error) {
            console.error("Send request error:", error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || "Something went wrong");
        }
    },

    /**
     * Cancels a previously sent friend request.
     */
    cancelRequest: async (userId) => {
        try {
            const res = await axiosInstance.delete(API_PATHS.FRIENDS.CANCEL_REQUEST(userId));
            await get().getPendingRequests();
            return res.data.message;
        } catch (error) {
            console.error("Cancel request error:", error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || "Something went wrong");
        }
    },

    /**
     * Accepts a received friend request.
     */
    acceptRequest: async (userId) => {
        try {
            const res = await axiosInstance.patch(API_PATHS.FRIENDS.ACCEPT_REQUEST(userId));
            await get().getFriends();
            return res.data.message;
        } catch (error) {
            console.error("Accept request error:", error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || "Something went wrong");
        }
    },

    /**
     * Rejects a received friend request.
     */
    rejectRequest: async (userId) => {
        try {
            const res = await axiosInstance.delete(API_PATHS.FRIENDS.REJECT_REQUEST(userId));
            await get().getPendingRequests();
            return res.data.message;
        } catch (error) {
            console.error("Reject request error:", error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || "Something went wrong");
        }
    },

    /**
     * Removes a friend from the user's friends list.
     */
    removeFriend: async (userId) => {
        try {
            const res = await axiosInstance.delete(API_PATHS.FRIENDS.REMOVE_FRIEND(userId));
            await get().getFriends();
            return res.data.message;
        } catch (error) {
            console.error("Remove friend error:", error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || "Something went wrong");
        }
    },

    /**
     * Checks the relationship status with a user by ID.
     */
    checkStatus: async (userId) => {
        try {
            const res = await axiosInstance.get(API_PATHS.FRIENDS.STATUS(userId));
            return res.data;
        } catch (error) {
            console.error("Check status error:", error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || "Something went wrong");
        }
    },

    // -----------------------------------
    // SOCKET LISTENERS
    // -----------------------------------

    /**
     * Initializes socket listeners for real-time friend events.
     * Handles:
     * - Friend request received
     * - Friend request accepted
     * - Friend request rejected
     * - Friend removed
     */
    initFriendSocket: () => {
        get().disconnectFriendSocket(); // prevent duplicates
        const { connectedSocket: socket } = useAuthStore.getState();
        if (!socket) return;

        // --- Friend request received ---
        socket.on("friendRequestReceived", ({ sender, requestId }) => {
            console.log("[FRIEND REQUEST RECEIVED]", { sender, requestId });
            set(state => ({
                pendingRequests: {
                    ...state.pendingRequests,
                    received: [
                        ...state.pendingRequests.received.filter(r => r._id !== requestId),
                        { _id: requestId, sender }
                    ]
                },
                hasNewPending: true,
                
                // Update searchResult if relevant
                searchResult: state.searchResult?._id === sender._id
                    ? { ...state.searchResult, relationshipStatus: "pending" }
                    : state.searchResult
            }));
        });

        // --- Friend request accepted ---
        socket.on("friendRequestAccepted", ({ friend }) => {
            console.log("[FRIEND REQUEST ACCEPTED]", { friend });
            set(state => ({
                friends: [...state.friends, friend],
                pendingRequests: {
                    ...state.pendingRequests,
                    sent: state.pendingRequests.sent.filter(r => r._id !== friend._id)
                },
                searchResult: state.searchResult?._id === friend._id
                    ? { ...state.searchResult, relationshipStatus: "friends" }
                    : state.searchResult
            }));
        });

        // --- Friend request rejected ---
        socket.on("friendRequestRejected", ({ userId }) => {
            console.log("[FRIEND REQUEST REJECTED]", { userId });
            set(state => ({
                pendingRequests: {
                    ...state.pendingRequests,
                    sent: state.pendingRequests.sent.filter(r => r._id !== userId)
                },
                searchResult: state.searchResult?._id === userId
                    ? { ...state.searchResult, relationshipStatus: "none" }
                    : state.searchResult
            }));
        });

        // --- Friend removed ---
        socket.on("friendRemoved", ({ userId }) => {
            console.log("[FRIEND REMOVED]", { userId });
            set(state => ({
                friends: state.friends.filter(f => f._id !== userId),
                searchResult: state.searchResult?._id === userId
                    ? { ...state.searchResult, relationshipStatus: "none" }
                    : state.searchResult
            }));
        });
    },

    /**
     * Disconnects all friend-related socket listeners.
     */
    disconnectFriendSocket: () => {
        const { connectedSocket: socket } = useAuthStore.getState();
        if (!socket) return;

        [
            "friendRequestReceived",
            "friendRequestAccepted",
            "friendRequestRejected",
            "friendRemoved"
        ].forEach(event => {
            socket.off(event);
            console.log(`[SOCKET OFF ${event}]`);
        });
    },

}));
