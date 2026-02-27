import { useEffect, useState } from "react";
import { useFriendStore } from "../../store/useFriendStore";
import { useMessageStore } from "../../store/useMessageStore";
import { Loader, Loader2, X } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

// =========================
// ForwardModal Component
// =========================
// Opens a modal to forward a message to one of your friends
export default function ForwardModal({ messageId, onClose }) {
    // =========================
    //  Data Stores
    // =========================
    const { friends, loading, getFriends } = useFriendStore(); // Friends data store
    const { currentChatId, isForwarding, forwardMessage } = useMessageStore(); // Message actions
    const { theme } = useThemeStore();

    // =========================
    //  Effects
    // =========================
    // Fetch friends when modal opens
    useEffect(() => {
        getFriends();
    }, [getFriends]);

    // =========================
    //  Handlers
    // =========================
    // Handle forwarding a message
    async function handleForward(targetUserId) {
        if (!targetUserId) return;

        try {
            await forwardMessage(currentChatId, messageId, targetUserId);
            onClose(); // Close modal after successful forward
        } catch (err) {
            console.error("Failed to forward message", err);
        } finally {
            setLoadingForwardChatId(null);
        }
    }

    // =========================
    //  Guards
    // =========================
    if (!friends) return null; // Guard: No friends list yet

    // =========================
    //  Render
    // =========================
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs px-2 sm:px-4"
            onClick={onClose} // Close modal on outside click
        >
            <div
                className={`
                    relative w-full max-w-lg rounded-2xl shadow-lg 
                    ${theme === "dark" ? "bg-black/60" : "bg-white/60"}
                    p-4 sm:p-6 max-h-[85vh] overflow-y-auto
                `}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {/* Header */}
                <h2 className="text-lg sm:text-xl font-semibold mb-4 opacity-80">
                    Forward Message
                </h2>

                {/* Close button */}
                <button
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-70 hover:opacity-100 duration-200 cursor-pointer"
                    onClick={onClose}
                >
                    <X size={22} />
                </button>

                {/* Loading state */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : friends.length <= 1 ? (
                    // No friends available
                    <p className="text-sm text-center text-gray-400 font-[Poppins]">
                        No friends available to forward a message.
                    </p>
                ) : (
                    // Friend list
                    <div className="space-y-3">
                        {friends.map((f) => (
                            <div
                                key={f._id}
                                className="flex items-center justify-between bg-transparent p-3 rounded-lg border border-base-300 hover:bg-base-200/30 transition"
                            >
                                {/* Friend avatar + name */}
                                <div className="flex items-center gap-3">
                                    <img
                                        src={f.profilePic || "/avatar.png"}
                                        alt={f.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm sm:text-base ml-2 uppercase font-semibold">
                                            {f.username || f.fullName}
                                        </p>
                                    </div>
                                </div>

                                {/* Forward button */}
                                <div>
                                    <button
                                        className="btn btn-sm btn-primary flex items-center gap-2"
                                        onClick={() => handleForward(f._id)}
                                        disabled={isForwarding === f._id}
                                    >
                                        {isForwarding === f._id ? (
                                            <Loader size={16} className="animate-spin" />
                                        ) : (
                                            "Forward"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
