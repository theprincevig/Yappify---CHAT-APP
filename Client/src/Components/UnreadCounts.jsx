import { useMessageStore } from "../store/useMessageStore";

/**
 * NewMessageIndicator Component
 * ----------------------
 * Displays a simple animated dot when a chat has a new message
 * (tracked only on frontend via socket events)
 */
export default function UnreadCounts({ user }) {
    const { hasNewMessage } = useMessageStore();

    const chatId = user.chatId;
    if (!chatId) return null;

    const isNew = hasNewMessage?.[chatId];
    if (!isNew) return null;

    return (
        <div className="flex gap-2 items-center">
            {/* Show "New Message" label */}
            <span className="text-xs text-gray-400 font-medium mb-1">
                New Message
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