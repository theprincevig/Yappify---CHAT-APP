import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { getSocket } from '../lib/socket';

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
    isSigningUp: false,            // Signup loading state
    isLoggingIn: false,            // Login loading state
    isUpdatingProfile: false,      // Profile update loading state
    isCheckingAuth: true,          // Auth check loading state
    showFunModePopup: false,       // Show fun mode popup
    onlineUsers: [],               // List of online users
    connectedSocket: null,         // Socket connection instance

    // =========================
    //   AUTH CHECK
    // =========================
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get("/api/auth/checkAuth");
            if (res.data) {
                set({ authUser: res.data });
                get().connectSocket(res.data);

                // Show fun mode popup if not locked
                if (!res.data.funModeLocked) {
                    set({ showFunModePopup: true });
                } else {
                    set({ showFunModePopup: false });
                }
            } else {
                set({ authUser: null, showFunModePopup: false });
            }
        } catch (error) {
            console.error(`Error in checkAuth : ${error}`);
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
            const res = await axiosInstance.post("/api/auth/signup", data);
            set({ authUser: res.data });            
            get().connectSocket(res.data);

            set({ showFunModePopup: true });
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
            const res = await axiosInstance.post("/api/auth/login", data);

            set({ authUser: res.data.user });
            get().connectSocket(res.data.user);

            // Show fun mode popup if not locked
            if (res.data && !res.data.user.funModeLocked) {
                set({ showFunModePopup: true });
            } else {
                set({ showFunModePopup: false });
            }
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
            await axiosInstance.post("/api/auth/logout");
            set({ authUser: null });
            get().disconnectSocket();
        } catch (error) {
            console.log("Logout error:", error);
            throw error;
        }
    },

    // =========================
    //   FUN MODE
    // =========================
    setFunMode: async (mode) => {
        try {
            const res = await axiosInstance.post("/api/auth/set-fun-mode", { funMode: mode });
            set((state) => ({
                authUser: { ...state.authUser, funMode: res.data.funMode, funModeLocked: true },
                showFunModePopup: false,
            }));
        } catch (error) {
            console.error(`Error setting Fun Mode: ${error}`);
        }
    },

    // =========================
    //   PUSH SUBSCRIPTION
    // =========================
    sendSubscriptionToServer: async (subscription) => {
        try {
            if (!subscription) return;

            const res = await axiosInstance.post("/api/auth/save-subscription", 
                { subscription },
                { withCredentials: true },
            )

            console.log("✅ Subscription saved:", res.data);
            return res.data;
        } catch (error) {
            console.error("❌ Error sending subscription:", error);
        }
    },

    // =========================
    //   NOTIFICATIONS TOGGLE
    // =========================
    toggleNotifications: async (enabled) => {
        try {
            const res = await axiosInstance.post("/api/auth/toggle-notifications", { enabled });
            set((state) => ({
                authUser: { ...state.authUser, notificationsEnabled: res.data.notificationsEnabled },
            }));
        } catch (error) {
            console.error(`Error toggling notifications: ${error}`);
        }
    },

    // =========================
    //   VIEW PROFILE
    // =========================
    viewProfile: async (profileId) => {
        try {
            const res = await axiosInstance.get(`/chat/profile/${profileId}`);
            if (res.data?.success) {
                return res.data.user; // Return the user object
            } else {
                console.error("Failed to fetch user profile:", res.data?.error);
                return null;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
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
            if (data.username) formData.append("username", data.username);
            if (data.bio) formData.append("bio", data.bio);
            if (data.profilePic) formData.append("profilePic", data.profilePic);

            const res = await axiosInstance.put(`/chat/profile/me`, formData, {
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
    //   SOCKET CONNECTION
    // =========================
    connectSocket: (user) => {
        console.log("📥 connectSocket called with:", user);
        
        const authUser = user || get().authUser;
        if (!authUser?._id) {
            console.warn("⚠️ No authUser found when trying to connect socket");
            return;
        }

        const { connectedSocket } = get();

        // Disconnect old socket if exists
        if (connectedSocket) {
            connectedSocket.off();
            connectedSocket.disconnect();
        }

        // Create new socket for user
        console.log("🟢 Creating socket for user:", authUser._id);
        const socket = getSocket(authUser._id);

        // Trigger connection
        socket.connect();

        // Log auth payload
        console.log("📤 Socket auth payload:", socket.auth);

        set({ connectedSocket: socket });

        // Listen for socket events
        socket.on("connect", () => {
            console.log("🔌 [FRONTEND CONNECTED] socket.id:", socket.id);
        });

        socket.on("getOnlineUsers", (userIds) => {
            console.log("👥 [FRONTEND RECEIVED onlineUsers]", userIds);
            set({ onlineUsers: userIds });
        });
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
