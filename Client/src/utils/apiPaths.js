// =======================
// API PATHS
// =======================
export const API_PATHS = {
  /* ======================
     AUTH / SESSION
  ====================== */
  AUTH: {
    SESSION: "/api/auth/session",              // GET (check), POST (login), DELETE (logout)
    SIGNUP: "/api/auth/signup",

    VERIFY_EMAIL: "/api/auth/email/verification",
    EMAIL_RESEND: "/api/auth/email/verification/resend",

    CHANGE_PASSWORD: "/api/auth/password",
    UPDATE_MODE: "/api/auth/preferences/mode",

    SAVE_SUBSCRIPTION: "/api/auth/notifications/subscription",
    TOGGLE_NOTIFICATIONS: "/api/auth/notifications",
  },

  /* ======================
     USERS / PROFILE
  ====================== */
  USERS: {
    UPDATE_ME: "/api/users/me",
    GET_PROFILE: (userId) => `/api/users/${userId}`,
  },

  /* ======================
     FRIENDS
  ====================== */
  FRIENDS: {
    // Requests
    GET_REQUESTS: "/api/friends/requests",
    SEND_REQUEST: (userId) => `/api/friends/requests/${userId}`,
    CANCEL_REQUEST: (userId) => `/api/friends/requests/${userId}`,
    ACCEPT_REQUEST: (userId) => `/api/friends/requests/${userId}/accept`,
    REJECT_REQUEST: (userId) => `/api/friends/requests/${userId}/reject`,

    // Friends list
    GET_FRIENDS: "/api/friends",
    REMOVE_FRIEND: (userId) => `/api/friends/${userId}`,

    // Utilities
    STATUS: (userId) => `/api/friends/status/${userId}`,
    SEARCH: (username) => `/api/friends/search?username=${username}`,
  },

  /* ======================
     CHATS
  ====================== */
  CHATS: {
    CREATE_CHAT: "/api/chats",
    GET_CHATS: "/api/chats",
    UNREAD_COUNTS: "/api/chats/unread-counts",

    MESSAGES: (chatId) => `/api/chats/${chatId}/messages`,
    DELETE_MESSAGE: (chatId, messageId) =>
      `/api/chats/${chatId}/messages/${messageId}`,

    UPSERT_REACTION: (chatId, messageId) =>
      `/api/chats/${chatId}/messages/${messageId}/reactions`,

    FORWARD: (chatId, messageId) =>
      `/api/chats/${chatId}/messages/${messageId}/forwards`,

    READ_STATUS: (chatId) => `/api/chats/${chatId}/read-status`,
  },
};