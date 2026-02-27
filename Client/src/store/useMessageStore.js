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
  chats: [],              // fixes chat updated bugs
  users: [],              // List of sidebar users/chats
  hasNewMessage: {},
  typingUser: null,       // User currently typing in chat

  currentChatId: null,    // Currently open chat ID
  selectedUser: null,     // Currently selected user in sidebar
  replyingTo: null,       // Message being replied to

  isForwarding: null,
  loading: false,         // Loading state for messages
  error: null,            // Error state

  // --------------------------------------
  //           SIMPLE MUTATORS
  // --------------------------------------

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setUsers: (users) => set({ users }),
  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),

  // --------------------------------------
  //         CHAT & MESSAGE ACTIONS
  // --------------------------------------

  /**
   * Set current chat and fetch its messages.
   */
  setCurrentChat: async (chatId, user) => {
    set((state) => ({
      currentChatId: chatId,
      selectedUser: user,
      messages: [],
      hasNewMessage: {
        ...state.hasNewMessage,
        [chatId]: false,
      }
    }));

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

    set({ loading: true });

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
        throw err;
      }
    } finally {
      set({ loading: false });
    }
  },

  /* ===============================
        FETCH MESSAGES
  =============================== */
  getMessages: async (chatId, limit = 20, skip = 0) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(API_PATHS.CHATS.MESSAGES(chatId), {
        params: { limit, skip },
      });

      if (res.data.success) {
        set((state) => {
          const existingIds = new Set(
            state.messages.map((m) => m._id.toString())
          );

          // Merge while avoiding duplicates
          const merged = skip === 0
            ? res.data.messages
            : [
                ...state.messages,
                ...res.data.messages.filter(
                  (m) => !existingIds.has(m._id.toString())
                ),
              ];

          // Sort chronologically (oldest → newest)
          const sorted = [...merged].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          return {
            messages: sorted,
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
      throw err;
    }
  },

  /* ===============================
        SEND MESSAGE
  =============================== */
  sendMessage: async (content, media = null, targetUserId = null) => {
    const { currentChatId, replyingTo } = get();
    const { connectedSocket: socket } = useAuthStore.getState();

    if (!content && !media)
      return toast.error("Message content or media is required");

    try {
      let chatId = currentChatId;

      // If chat doesn't exist, create it first
      if (!chatId && targetUserId) {
        const chatRes = await axiosInstance.post(
          API_PATHS.CHATS.CREATE_CHAT,
          { targetUserId }
        );

        chatId = chatRes.data.chatId;
        socket?.emit("joinChats", [chatId]);
      }

      if (!chatId)
        return toast.error("Chat not found");

      const formData = new FormData();
      if (content) formData.append("content", content);
      if (media) formData.append("media", media);
      if (replyingTo?._id) formData.append("replyTo", replyingTo._id);

      const res = await axiosInstance.post(
        API_PATHS.CHATS.MESSAGES(chatId),
        formData,
        { headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const newMessage = res.data.message;

        set((state) => {
          const exists = state.messages.some(
            m => m._id.toString() === newMessage._id.toString()
          );

          if (exists) return state;

          return {
            messages: [...state.messages, newMessage],
            currentChatId: chatId,
          };
        });

        set({ replyingTo: null });
        await get().getChats();
        
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send message");
      throw err;
    }
  },

  /* ===============================
        DELETE MESSAGE
  =============================== */
  deleteMessage: async (chatId, messageId) => {
    try {
      const res = await axiosInstance.delete(API_PATHS.CHATS.DELETE_MESSAGE(chatId, messageId));

      if (res.data.success) {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId
              ? { ...msg, deleted: true, content: "This message was deleted" }
              : msg
          ),
        }));
        toast.success("Message deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete message");
      throw err;
    }
  },

  /* ===============================
        REACT MESSAGE
  =============================== */
  reactToMessage: async (chatId, messageId, emoji) => { 
    try { 
      await axiosInstance.post(
        API_PATHS.CHATS.UPSERT_REACTION(chatId, messageId),
        { emoji }
      );
      // No manual state update here.
      // Socket will handle it via "messageReacted"

    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to react to message");
      throw err;
    } 
  },
  
  /* ===============================
        FORWARD MESSAGE
  =============================== */
  forwardMessage: async (chatId, messageId, targetUserId) => {
    set({ isForwarding: targetUserId });
    try {
      const res = await axiosInstance.post(
        API_PATHS.CHATS.FORWARD(chatId, messageId),
        { targetUserId }
      );
      
      if (res.data.success) {
        toast.success("Message forwarded"); 
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to forward message");
      throw err;
    } finally {
      set({ isForwarding: null });
    }
  },
  
  /* ===============================
        READ MESSAGE
  =============================== */
  readStatus: async (chatId) => {
    try {
      await axiosInstance.patch(API_PATHS.CHATS.READ_STATUS(chatId));
      // No manual store update; socket "messagesRead" event will handle it
    } catch (err) {
      toast.error( err.response?.data?.error || "Failed to mark messages as read" );
      throw err;
    }
  },

  // --------------------------------------
  //      SOCKET.IO REALTIME HANDLERS
  // --------------------------------------

  /**
   * Initialize all socket event listeners for real-time updates.
   */
  initializeSocketListeners: (chatIds = []) => {
    get().disconnectSocketListeners();
    const { connectedSocket: socket } = useAuthStore.getState(); // Get live socket
    if (!socket) return;

    // Join all chat rooms for real-time events
    if (Array.isArray(chatIds) && chatIds.length > 0) {
      console.log("Joining chat room:", chatIds);
      socket.emit("joinChats", chatIds);
    }

    // --- New message received ---
    socket.on("newMessage", (newMessage) => {
      set((state) => {
        const chatId = newMessage.chat?._id || newMessage.chat;
        const isActiveChat = 
            chatId?.toString() === state.currentChatId?.toString();

        if (isActiveChat) {
          const existing = state.messages.findIndex(
            m => m._id.toString() === newMessage._id.toString()
          );

          let updatedMessages;

          if (existing !== -1) {
            updatedMessages = state.messages.map((m) => 
              m._id.toString() === newMessage._id.toString() 
                ? newMessage 
                : m
            );

          } else {
            updatedMessages = [...state.messages, newMessage];
          }

          const sortedMessages = [...updatedMessages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          return {
            messages: sortedMessages,
          };
        }

        return {
          hasNewMessage: {
            ...state.hasNewMessage,
            [chatId]: true,
          },
        };
      });

      const { currentChatId } = get();
      const chatId = newMessage.chat?._id || newMessage.chat;

      if (chatId?.toString() === currentChatId?.toString()) {
        const currentUserId = useAuthStore.getState().authUser._id;

        if (!newMessage.readBy?.some(
          id => id.toString() === currentUserId.toString()
        )) {
          get().readStatus(chatId);
        }
      }
    });

    // --- Chat updated (e.g. new participant) ---
    socket.on("chatUpdated", (updatedChat) => {
      try {
        set((state) => {
          const exists = state.chats.findIndex(
            (c) => c._id.toString() === updatedChat._id.toString()
          );

          let updatedChats;

          if (exists !== -1) {
            // Update existing chat
            updatedChats = state.chats.map((c) =>
              c._id.toString() === updatedChat._id.toString() 
                ? updatedChat 
                : c
            );

          } else {
            // Insert new chat
            updatedChats = [updatedChat, ...state.chats];
          }

          return { chats: updatedChats };
        });
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
          msg._id === messageId 
            ? { ...msg, reactions } 
            : msg
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
          if (
            (msg.chat?._id || msg.chat).toString() !== chatId.toString()
          ) return msg;
          
          const normalizedReadBy = (msg.readBy || []).map(r => r.toString());
          if (normalizedReadBy.includes(readerId.toString())) {
            return msg;
          }

          return {
            ...msg,
            readBy: [...normalizedReadBy, readerId.toString()],
          };
        }),
      }));
    });

    // --- Message forwarded ---
    socket.on("messageForwarded", (forwardedMessage) => {
      const chatId = 
        typeof forwardedMessage.chat === "string"
          ? forwardedMessage.chat
          : forwardedMessage.chat?._id;

      set((state) => {
        const forwarded = {
          ...forwardedMessage,
          forwardedFrom: forwardedMessage.forwardedFrom
            ? {
              ...forwardedMessage.forwardedFrom,
              sender: forwardedMessage.forwardedFrom.sender || {
                username: "Unknown",
                fullName: "Unknown"
              }
            }
            : null,
        };

        const exists = state.messages.some((m) => m._id === forwarded._id);
        return {
          messages: exists
            ? state.messages.map((m) =>
                m._id === forwarded._id ? forwarded : m
              )
            : [...state.messages, forwarded],
        };
      });
    });

    // --- Typing indicator ---
    socket.on("typing", ({ chatId, senderId }) => {
      const { currentChatId, users } = get();
      if (chatId?.toString() === currentChatId?.toString()) {
        const user = users.find(
          (u) => u._id?.toString() === senderId?.toString()
        );

        if (user) {
          set({ typingUser: user });
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
