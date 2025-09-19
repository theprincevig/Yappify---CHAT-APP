//! 💬 TYPING BUBBLE COMPONENT
//! ━━━━━━━━━━━━━━━━━━━━━━━━━
// Displays a sleek typing indicator with user avatar and bouncing dots animation
// Perfect for showing real-time typing status in chat interfaces

export default function TypingBubble({ typingUser }) {
  // Early return if no typing user is provided
  if (!typingUser) return null;

  return (
    <div className="chat chat-start">
      {/*
       * 👤 USER AVATAR SECTION
       * ────────────────────────
       * Displays user's profile picture or fallback avatar
       */}
      <div className="chat-image avatar">
        <div className="w-10 h-10 rounded-full">
          <img
            src={typingUser.profilePic || "/avatar.png"}
            alt="avatar"
            className="object-cover"
          />
        </div>
      </div>

      {/*
       * ✨ TYPING INDICATOR BUBBLE
       * ────────────────────────
       * Animated dots showing typing status
       * Uses tailwind's animate-bounce with custom delays
       */}
      <div className="chat-bubble bg-base-200 text-gray-600 flex items-center gap-1 px-3 py-2">
        <div className="flex space-x-1">
          {/* 🔵 Bouncing Dots Animation */}
          <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:200ms]"></span>
          <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:400ms]"></span>
        </div>
      </div>
    </div>
  );
}
