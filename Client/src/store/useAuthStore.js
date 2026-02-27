import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { getSocket } from '../lib/socket';
import { API_PATHS } from '../utils/apiPaths';

/**
 * =========================
 *   AUTH STORE (ZUSTAND)
 * =========================
 * Handles authentication, user profile, sockets, notifications, and fun mode logic.
 */

export const useAuthStore = create((set, get) => ({

    // =========================
    //   STATE VARIABLES
    // =========================
    authUser: null,                // Current authenticated user
    onlineUsers: [],               // List of online users
    connectedSocket: null,         // Socket connection instance
    showFunModePopup: false,       // Show fun mode popup

    isCheckingAuth: true,          // Auth check loading state
    isSigningUp: false,            // Signup loading state
    isLoggingIn: false,            // Login loading state
    isLoadingProfile: false,  // Profile loading state
    isUpdatingProfile: false,      // Profile update loading state
    isResettingPassword: false, // Password reset loading state

    // =========================
    //  FunMode Popup
    // =========================
    setFunModePopup: (value) => set({ showFunModePopup: value }),

    // =========================
    //   AUTH CHECK
    // =========================
    session: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get(API_PATHS.AUTH.SESSION);
            const user = res.data.user;

            if (user) {
                set({ authUser: user });
                get().connectSocket(user);

                // Show fun mode popup if not locked
                const mode = !user.funModeLocked && !user.funMode;
                set({ showFunModePopup: mode });
            } else {
                set({ authUser: null, showFunModePopup: false });
            }
        } catch (error) {
            console.error(`Error in check auth session : ${error}`);
            set({ authUser: null, showFunModePopup: false });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    // =========================
    //   SIGNUP
    // =========================
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post(API_PATHS.AUTH.SIGNUP, data);
            const user = res.data;

            set({ authUser: user });            
            get().connectSocket(user);

        } catch (error) {
            console.error(`Signup error: ${error}`);
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    // =========================
    //   LOGIN
    // =========================
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post(API_PATHS.AUTH.SESSION, data);
            const user = res.data.user;

            set({ authUser: user });
            get().connectSocket(user);
            await get().session(); // 🔥 THIS IS IMPORTANT

            // Show fun mode popup if not locked
            const mode = !user.funModeLocked && !user.funMode;
            set({ showFunModePopup: mode });
        } catch (error) {
            console.error(`Login error: ${error}`);
            throw error;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    // =========================
    //   LOGOUT
    // =========================
    logout: async () => {
        try {
            get().disconnectSocket();
            await axiosInstance.delete(API_PATHS.AUTH.SESSION);
            set({ authUser: null });
        } catch (error) {
            console.log("Logout error:", error);
            throw error;
        }
    },

    // ===========================
    //  UPDATE NOTIFICATION MODE
    // ===========================
    updateNotifications: async (mode) => {
        try {
            const res = await axiosInstance.patch(API_PATHS.AUTH.UPDATE_MODE, {
                funMode: mode
            });
            set((state) => ({
                authUser: {
                    ...state.authUser,
                    funMode: res.data.funMode,
                    funModeLocked: true
                },
                showFunModePopup: false,
            }));
        } catch (error) {
            console.error(`Error setting Update Mode: ${error}`);
            throw error;
        }
    },

    // =========================
    //   PUSH SUBSCRIPTION
    // =========================
    saveSubscription: async (subscription) => {
        try {
            if (!subscription) return;

            const res = await axiosInstance.post(API_PATHS.AUTH.SAVE_SUBSCRIPTION, 
                { subscription },
                { withCredentials: true },
            )

            console.log("Subscription saved:", res.data);
            return res.data;
        } catch (error) {
            console.error("Error sending subscription:", error);
            throw error;
        }
    },

    // =========================
    //   NOTIFICATIONS TOGGLE
    // =========================
    toggleNotifications: async (enabled) => {
        try {
            const res = await axiosInstance.patch(API_PATHS.AUTH.TOGGLE_NOTIFICATIONS, {
                enabled
            });
            set((state) => ({
                authUser: {
                    ...state.authUser,
                    notificationsEnabled: res.data.notificationsEnabled
                },
            }));
        } catch (error) {
            console.error(`Error toggling notifications: ${error}`);
            throw error;
        }
    },

    // =========================
    //   VIEW PROFILE
    // =========================
    viewProfile: async (userId) => {
        set({ isLoadingProfile: true });

        try {
            const res = await axiosInstance.get(API_PATHS.USERS.GET_PROFILE(userId));
            if (res.data?.success) {
                return res.data.user; // Return the user object
            } else {
                console.error("Failed to fetch user profile:", res.data?.error);
                return null;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        } finally {
            set({ isLoadingProfile: false });
        }
    },

    // =========================
    //   UPDATE PROFILE
    // =========================
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const formData = new FormData();
            if (data.fullName) formData.append("fullName", data.fullName);
            if (data.username && data.username !== get().authUser.username) {
                formData.append("username", data.username);
            }
            if (data.bio) formData.append("bio", data.bio);
            if (data.profilePic) formData.append("profilePic", data.profilePic);

            const res = await axiosInstance.patch(API_PATHS.USERS.UPDATE_ME, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data?.user) {
                set({ authUser: res.data.user });
                return res.data.user;
            } else {
                console.error("No user object returned from server");
                return null;
            }
        } catch (error) {
            console.error(`Error updating profile: ${error}`);
            throw error;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    // =========================
    //   CHANGE PASSWORD
    // =========================
    changePassword: async (oldPassword, newPassword) => {
        set({ isResettingPassword: true });

        try {
            const res = await axiosInstance.patch(API_PATHS.AUTH.CHANGE_PASSWORD, {
                oldPassword,
                newPassword
            });
            return res.data;
        } catch (error) {
            console.error("Error changing password:", error);
            throw (
                error.response?.data || {
                success: false,
                message: "Unable to change password.",
                }
            );
        } finally {
            set({ isResettingPassword: false });
        }
    },

    // =========================
    //   SOCKET CONNECTION
    // =========================
    connectSocket: (user) => {
        console.log("connectSocket called with:", user);
        
        const authUser = user || get().authUser;
        if (!authUser?._id) {
            console.warn("No authUser found when trying to connect socket");
            return;
        }

        const { connectedSocket } = get();

        // Disconnect old socket if exists
        if (connectedSocket) {
            connectedSocket.off();
            connectedSocket.disconnect();
            console.log("Disconnected old socket before reconnecting");
        }

        // Create new socket for user
        console.log("Creating socket for user:", authUser._id);
        const socket = getSocket(authUser._id);

        // Trigger connection
        socket.connect();

        // Log auth payload
        console.log("Socket auth payload:", socket.auth);

        set({ connectedSocket: socket });

        // Listen for socket events
        socket.on("connect", () => {
            console.log("[FRONTEND CONNECTED] socket.id:", socket.id);
        });

        socket.on("getOnlineUsers", (userIds) => {
            console.log("[FRONTEND RECEIVED onlineUsers]", userIds);
            set({ onlineUsers: userIds });
        });

        set({ connectedSocket: socket });
    },

    // =========================
    //   SOCKET DISCONNECT
    // =========================
    disconnectSocket: () => {
        const { connectedSocket } = get();
        if (connectedSocket) {
            connectedSocket.off();
            connectedSocket.disconnect();
            set({ connectedSocket: null, onlineUsers: [] });
        }
    },
}));
