import { useMessageStore } from "../store/useMessageStore";

/**
 * UnreadCounts Component
 * ----------------------
 * Displays a notification for unread messages in a chat.
 * Shows a small text and a bouncing indicator if there are unread messages.
 */
export default function UnreadCounts({ user }) {
    // Get the unread message counts from the global store
    const unreadCounts = useMessageStore(state => state.unreadCounts);

    // Determine the chat ID (fallback to user._id if chatId is missing)
    const chatId = user.chatId || user._id;

    // Get the unread count for this chat
    const unread = unreadCounts[chatId] || 0;

    // Hide the notification if there are no unread messages
    if (!unread) return null;

    return (
        <div className="flex gap-2 items-center">
            {/* 
                Notification Text
                -----------------
                Shows "4+ New Messages" if more than 4,
                otherwise shows the exact count.
            */}
            <span className="text-xs text-gray-400 font-medium mb-1">
                {unread > 4
                    ? "4+ New Messages"
                    : `${unread} New Message${unread > 1 ? "s" : ""}`}
            </span>

            {/* 
                Bouncing Status Indicator
                ------------------------
                A small animated dot to draw attention to new messages.
            */}
            <div className="status status-info animate-pulse w-2 h-2 rounded-full" />
        </div>
    );
}