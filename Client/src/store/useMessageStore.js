import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore"; // Auth store import
import { API_PATHS } from "../utils/apiPaths";

/**
 * ============================
 *        MESSAGE STORE
 * ============================
 * Centralized Zustand store for chat messages, sidebar users,
 * unread counts, and real-time socket event handlers.
 */

export const useMessageStore = create((set, get) => ({

  // --------------------------------------
  //           STATE VARIABLES
  // --------------------------------------
  messages: [],           // All messages for current chat
  loading: false,         // Loading state for messages
  error: null,            // Error state
  currentChatId: null,    // Currently open chat ID
  replyingTo: null,       // Message being replied to

  // --- Sidebar state ---
  users: [],              // List of sidebar users/chats
  selectedUser: null,     // Currently selected user in sidebar
  typingUser: null,       // User currently typing in chat
  unreadCounts: {},       // Unread message counts per chat

  // --------------------------------------
  //           STATE MUTATORS
  // --------------------------------------

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setUsers: (users) => set({ users }),

  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),

  setUnreadCounts: (counts) => set({ unreadCounts: counts }),

  incrementUnreadCount: (chatId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: (state.unreadCounts[chatId] || 0) + 1,
      }
    }));
  },

  resetUnreadCount: (chatId) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [chatId]: 0 }
    }));
  },

  // --------------------------------------
  //         CHAT & MESSAGE ACTIONS
  // --------------------------------------

  /**
   * Set current chat and fetch its messages.
   */
  setCurrentChat: async (chatId, user) => {
    set({ currentChatId: chatId, selectedUser: user, messages: [] });

    if (chatId) {
      await get().getMessages(chatId);
    }
  },

  /**
   * Fetch sidebar users/chats.
   */
  getChats: async () => {
    const { authUser, isCheckingAuth } = useAuthStore.getState();

    if (isCheckingAuth || !authUser?._id) {
      // Prevent API call if auth not ready or user not logged in
      set({ users: [] });
      return;
    }

    try {
      const res = await axiosInstance.get(API_PATHS.CHATS.GET_CHATS);

      if (res.data.success) {
        set({ users: res.data.users });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("User is logged out, skipping sidebar fetch");
        set({ users: [] });
      } else {
        toast.error(err.response?.data?.error || "Failed to load sidebar users");
      }
    }
  },

  /**
   * Fetch messages for a chat.
   */
  getMessages: async (chatId, limit = 20, skip = 0) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(API_PATHS.CHATS.MESSAGES(chatId), {
        params: { limit, skip },
      });

      if (res.data.success) {
        set((state) => {
          // Merge while avoiding duplicates
          const mergedMessages = skip === 0
            ? res.data.messages
            : [
                ...state.messages,
                ...res.data.messages.filter(
                  (m) => !state.messages.some((msg) => msg._id === m._id)
                ),
              ];

          // Sort chronologically (oldest → newest)
          const sortedMessages = mergedMessages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          return {
            ...state,
            messages: sortedMessages,
            currentChatId: chatId,
            loading: false,
          };
        });
      }
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to load messages",
        loading: false,
      });
      toast.error(err.response?.data?.error || "Failed to load messages");
    }
  },

  /**
   * Fetch unread message counts for all chats.
   */
  getUnreadCounts: async () => {
    const { authUser, isCheckingAuth } = useAuthStore.getState();

    if (isCheckingAuth || !authUser?._id) {
      console.log("Skipping unread counts fetch - no authUser");
      return;
    }
    
    try {
      const res = await axiosInstance.get(API_PATHS.CHATS.UNREAD_COUNTS);
      if (res.data.success) set({ unreadCounts: res.data.unreadCounts });

    } catch (err) {
      if (err.response?.status === 401) {        
        set({ users: [] });
      } else {
        toast.error(err.response?.data?.error || "Failed to fetch unread counts");
      }      
    }
  },

  /**
   * Send a new message (text/media/reply).
   */
  sendMessage: async (content, media = null, targetUserId = null) => {
    const { currentChatId, users, selectedUser, replyingTo } = get();

    if (!content && !media)
      return toast.error("Message content or media is required");
    if (!currentChatId && !targetUserId)
      return toast.error("Select a user to chat with");

    try {
      const formData = new FormData();
      if (content) formData.append("content", content);
      if (media) formData.append("media", media);
      if (targetUserId) formData.append("targetUserId", targetUserId);
      if (replyingTo?._id) formData.append("replyTo", replyingTo._id);

      const endpoint = currentChatId
        ? API_PATHS.CHATS.MESSAGES(currentChatId)
        : API_PATHS.CHATS.MESSAGES(targetUserId);

      const res = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const newMessage = res.data.message;
        const chatId = res.data.chatId;

        set((state) => ({
          messages: [...state.messages, newMessage],
          currentChatId: chatId,
          selectedUser:
            state.selectedUser?._id === targetUserId
              ? state.selectedUser
              : users.find((u) => u._id === targetUserId) || state.selectedUser,
        }));

        set({ replyingTo: null });

        // If new chat, refresh sidebar users
        if (targetUserId && !currentChatId) {
          await get().getUsersForSidebar();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send message");
    }
  },

  /**
   * Delete a message.
   */
  deleteMessage: async (chatId, messageId) => {
    try {
      const res = await axiosInstance.delete(API_PATHS.CHATS.DELETE_MESSAGE(chatId, messageId));

      if (res.data.success) {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId
              ? { ...msg, deleted: true, content: "This message was deleted..." }
              : msg
          ),
        }));
        toast.success("Message deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete message");
    }
  },

  /**
   * React to a message with emoji.
   */
  upsertReaction: async (chatId, messageId, emoji) => { 
    try { 
      const res = await axiosInstance.post(API_PATHS.CHATS.UPSERT_REACTION(chatId, messageId), { emoji });

      if (res.data.success) {
        set((state) => ({ 
          messages: state.messages.map((msg) => 
            msg._id === messageId 
            ? res.data.message 
            : msg 
          ), 
        })); 
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to react to message"); 
    } 
  },
  
  /**
   * Forward a message to another chat.
   */
  forwardMessage: async (chatId, messageId, targetChatId) => {
    try {
      const res = await axiosInstance.post(API_PATHS.CHATS.FORWARD(chatId, messageId), { targetChatId });
      
      if (res.data.success) {
        toast.success("Message forwarded"); 
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to forward message");
    }
  },
  
  /**
   * Mark all messages in a chat as read.
   */
  readStatus: async (chatId) => {
    try {
      await axiosInstance.patch(API_PATHS.CHATS.READ_STATUS(chatId));
      // No manual store update; socket "messagesRead" event will handle it
    } catch (err) {
      toast.error( err.response?.data?.error || "Failed to mark messages as read" );
    }
  },

  // --------------------------------------
  //      SOCKET.IO REALTIME HANDLERS
  // --------------------------------------

  /**
   * Initialize all socket event listeners for real-time updates.
   */
  initializeSocketListeners: (allChatIds = []) => {
    get().disconnectSocketListeners();
    const { connectedSocket: socket } = useAuthStore.getState(); // Get live socket
    if (!socket) return;

    // Join all chat rooms for real-time events
    if (Array.isArray(allChatIds) && allChatIds.length > 0) {
      console.log("Joining chat room:", allChatIds);
      socket.emit("joinChats", allChatIds);
    }

    // --- New message received ---
    socket.on("newMessage", (newMessage) => {
      const { currentChatId, messages } = get();
      const chatId = newMessage.chat?._id || newMessage.chat;

      if (chatId === currentChatId) {
        const exists = messages.some((m) => m._id === newMessage._id);

        set((state) => ({
          messages: exists
            ? state.messages.map((m) => (m._id === newMessage._id ? { ...newMessage } : m))
            : [...state.messages, newMessage], // No sorting if server sends in order
        }));

        // Reset unread count immediately since we’re viewing it
        get().resetUnreadCount(chatId);

        // Mark as read in backend
        get().readStatus(chatId);
      } else {
        // Not open → increment unread
        get().incrementUnreadCount(chatId);
      }
    });

    // --- Chat updated (e.g. new participant) ---
    socket.on("chatUpdated", (updatedChat) => {
      try {
        const currentUserId = useAuthStore.getState().authUser?._id?.toString();
        if (!currentUserId) return;

        const chatId = updatedChat._id?.toString?.() || updatedChat._id;

        const otherParticipant = (updatedChat.participants || []).find(
          (p) => p._id?.toString?.() !== currentUserId
        );

        if (otherParticipant) {
          set((state) => ({
            users: state.users.map((u) => 
              u._id?.toString?.() === otherParticipant._id?.toString?.()
              ? { ...u, chatId }
              : u
            )
          }));
        }
      } catch (err) {
        console.error("chatUpdated handler error:", err);
      }
    });

    // --- Message deleted ---
    socket.on("messageDeleted", ({ messageId, chatId }) => {
      const { currentChatId } = get();
      console.log("[FRONTEND RECEIVED messageDeleted]", { messageId, chatId });

      if (!currentChatId || currentChatId.toString() !== chatId?.toString()) return;

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, deleted: true, content: "This message was deleted..." }
            : msg
        ),
      }));
    });

    // --- Message reacted ---
    socket.on("messageReacted", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        ),
      }));
    });

    // --- Messages marked as read ---
    socket.on("messagesRead", ({ chatId, readerId }) => {
      const { currentChatId } = get();
      if (chatId !== currentChatId) return;

      if (readerId === useAuthStore.getState().authUser._id) {
        get().resetUnreadCount(chatId);
      }

      set((state) => ({
        messages: state.messages.map((msg) => {
          if ((msg.chat?._id || msg.chat) !== chatId) return msg;
          return {
            ...msg,
            readBy: [...new Set([...(msg.readBy ?? []), readerId])],
          };
        }),
      }));
    });

    // --- Message forwarded ---
    socket.on("messageForwarded", (forwardedMessage) => {
      const { currentChatId } = get();
      if ((forwardedMessage.chat?._id || forwardedMessage.chat) === currentChatId) {
        // Ensure forwardedFrom.sender always exists
        if (forwardedMessage.forwardedFrom && !forwardedMessage.forwardedFrom.sender) {
          forwardedMessage.forwardedFrom.sender = { username: "Unknown", fullName: "Unknown" };
        }

        set((state) => {
          const exists = state.messages.some((m) => m._id === forwardedMessage._id);
          return {
            messages: exists
              ? state.messages.map((m) =>
                  m._id === forwardedMessage._id ? forwardedMessage : m
                )
              : [...state.messages, forwardedMessage],
          };
        });
      }
    });

    // --- Typing indicator ---
    socket.on("typing", ({ chatId, senderId }) => {
      const { currentChatId, users, selectedUser } = get();
      if (chatId === currentChatId) {
        const user =
          users.find((u) => u._id === senderId) ||
          (selectedUser && selectedUser._id === senderId ? selectedUser : null);

        if (user) {
          set({ typingUser: { ...user, _id: user._id || senderId } });
        }
      }
    });

    // --- Stop typing indicator ---
    socket.on("stopTyping", ({ chatId, senderId }) => {
      const { currentChatId } = get();
      if (chatId === currentChatId) {
        set({ typingUser: null });
      }
    });
  },

  /**
   * Disconnect all socket event listeners.
   */
  disconnectSocketListeners: () => {
    const { connectedSocket: socket } = useAuthStore.getState();
    if (!socket) return;

    const events = [
      "newMessage",
      "chatUpdated",
      "messageDeleted",
      "messageReacted",
      "messagesRead",
      "messageForwarded",
      "typing",
      "stopTyping",
    ];

    events.forEach((event) => {
      socket.off(event);
      console.log(`[SOCKET OFF ${event}]`);
    });
  },

}));
