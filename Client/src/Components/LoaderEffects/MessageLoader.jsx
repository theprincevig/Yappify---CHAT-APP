// ──────────────────────────────────────────────────────────────
// 🌟 MessageLoader Component
//    A sleek loading animation for the chat interface
//    Creates realistic chat-like placeholder elements
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function MessageLoader() {
  // 🎲 Random widths for varied message lengths
  const skeletonMessages = Array(6).fill().map(() =>
    [150, 180, 220, 260][Math.floor(Math.random() * 4)]
  );

  return (
    // 📱 Main container with responsive layout
    <div
      className={`
        fixed w-full h-full bg-base-200 flex flex-col
        transition-transform duration-300 ease-in-out
        md:relative md:flex md:flex-1 md:w-auto
      `}
    >
      {/* 💫 Scrollable messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {skeletonMessages.map((width, idx) => (
          <div
            key={idx}
            className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}
          >
            {/* 👤 Avatar skeleton */}
            <div className="chat-image avatar">
              <div className="size-10 rounded-full">
                <div className="skeleton w-full h-full rounded-full" />
              </div>
            </div>

            {/* 📛 Username skeleton */}
            <div className="chat-header mb-1">
              <div className="skeleton h-4 w-16" />
            </div>

            {/* 💭 Message bubble skeleton */}
            <div className="chat-bubble bg-transparent p-0">
              <div
                className="skeleton h-16 rounded-lg"
                style={{ width: `${width}px` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ⌨️ Input field skeleton (inactive) */}
      {/*
      <div className="p-3 border-t border-base-300 flex items-center gap-2 animate-pulse">
        <div className="flex-1 h-10 bg-base-300 rounded shimmer" />
        <div className="w-10 h-10 bg-base-300 rounded-full shimmer" />
      </div>
      */}
    </div>
  );
};
