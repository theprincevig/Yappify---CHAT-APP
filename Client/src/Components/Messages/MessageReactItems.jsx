//╔════════════════════════════════════════════════════════════════════════════════╗
//║                       MessageReactItems Component                              ║
//║     Quick and fun way to react to messages with emojis! Express yourself!      ║
//╚════════════════════════════════════════════════════════════════════════════════╝

import { useState } from "react";
import { Plus } from "lucide-react";
import Picker from "emoji-picker-react";
import { useMessageStore } from "../../store/useMessageStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function MessageReactItems({ message }) {
  const { currentChatId, reactToMessage } = useMessageStore();
  const { authUser } = useAuthStore(); // Your digital identity

  // Safety First: No auth? No reactions!
  if (!authUser) return null;

  const [showFullPicker, setShowFullPicker] = useState(false);

  //══════════════════════════════ Helper Functions ══════════════════════════════//

  // Detective work: Find user's existing reaction
  const userReaction = message.reactions?.find((r) => {
    const reactionUserId =
      typeof r.user === "string" ? r.user : r.user?._id?.toString();
    return reactionUserId === authUser?._id?.toString();
  });

  // Quick-access emoji arsenal
  const quickEmojis = ["❤️", "💀", "😂", "😭", "👍🏻"];

  // Emoji Selection Handler - Works for both quick picks and full picker
  async function handleEmojiClick(emoji) {
    await reactToMessage(currentChatId, message._id, emoji);
    setShowFullPicker(false); // Clean up: Close picker after selection
  }

  //══════════════════════════════ Component Layout ══════════════════════════════//

  return (
    <div className="relative group">
      {/* Quick Reaction Bar - Floating emoji menu */}
      <div className="bg-white/10 rounded-full shadow px-2 py-1">
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className={`px-1 hover:scale-110 transition ${
              userReaction?.emoji === emoji
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {emoji}
          </button>
        ))}

        {/* Emoji Explorer Button - Unlock more emotions! */}
        <button
          onClick={() => setShowFullPicker((prev) => !prev)}
          className="cursor-pointer"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Full Emoji Paradise - When quick reactions aren't enough */}
      {showFullPicker && (
        <div className="absolute z-50 top-10 right-0">
          <Picker onEmojiClick={(e) => handleEmojiClick(e.emoji)} />
        </div>
      )}
    </div>
  );
}
