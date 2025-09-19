//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 MessageReactions
// Shows emoji reactions below messages with different styles for user's own reactions
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useAuthStore } from "../../store/useAuthStore";

export default function MessageReactions({ message, isOwnMessage }) {
  // 🔐 Authentication & User Context
  const { authUser } = useAuthStore();

  // ⚡ Early Return
  // Skip rendering if no reactions are present
  if (!message.reactions || message.reactions.length === 0) return null;

  return (
    <div
      className={`
        absolute -bottom-4
        ${isOwnMessage ? "left-2" : "right-2"} 
        flex
      `}
    >
      {message.reactions.map((r) => {
        // 👥 Reaction Ownership Check
        // Determines if the current user made this reaction
        const isMine = r.user?._id?.toString() === authUser._id?.toString();

        return (
          <span
            // 🔑 Unique Key: Combination of user ID and emoji
            key={`${r.user?._id}-${r.emoji}`}
            className={`
              react-badge
              ${isMine ? "bg-black/20" : "bg-white/10"}
            `}
          >
            {/* 🎨 Reaction Display
                Shows emoji and count (if more than 1) */}
            {r.emoji}
            {r.count && r.count > 1 ? `${r.count}` : ""}
          </span>
        );
      })}
    </div>
  );
}
