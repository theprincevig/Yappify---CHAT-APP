// 🎨 ICONS
import { ArrowLeft } from "lucide-react";

// 🏪 GLOBAL STORE
import { useAuthStore } from "../../store/useAuthStore";

// 🔗 ROUTING
import { Link } from "react-router-dom";

/**
 * ──────────────────────────────────────────────
 * 📦 ChatHeader Component
 * ──────────────────────────────────────────────
 * Displays the top bar in chat with:
 *   - Back button
 *   - Selected user's avatar, name, and status
 *   - Link to user's profile
 * ──────────────────────────────────────────────
 */
export default function ChatHeader({ selectedUser, setSelectedUser }) {
    // 🟢 Get online users from global auth store
    const { onlineUsers } = useAuthStore();

    return (
        <>
            {/* ──────────────── HEADER BAR ──────────────── */}
            <div className="flex items-center gap-3 p-4 border-b border-base-300 bg-base-300">
                
                {/* ← BACK BUTTON (clears selected user) */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="opacity-50 hover:opacity-100 cursor-pointer"
                >
                    <ArrowLeft className="size-5 text-base-content" />
                </button>

                {/* ────────────── USER INFO ────────────── */}
                <div className="flex items-center gap-2">
                    
                    {/* 🖼️ AVATAR */}
                    <img
                        src={selectedUser.profilePic || "/avatar.png"}
                        alt={selectedUser.username}
                        className="w-9 h-9 rounded-full object-cover"
                    />

                    {/* 👤 NAME & STATUS */}
                    <div className="flex flex-col">
                        {/* 🔗 USER PROFILE LINK */}
                        <Link 
                            to={`/chat/profile/${selectedUser._id}`} 
                            className="font-semibold"
                        >
                            {selectedUser.fullName || selectedUser.username}
                        </Link>

                        {/* 🟢 ONLINE / OFFLINE STATUS */}
                        <p className="text-xs ml-1 text-base-content/50 font-light myfont-AU-NSW">
                            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>
            </div>
            {/* ────────────────────────────────────────── */}
        </>
    );
}
