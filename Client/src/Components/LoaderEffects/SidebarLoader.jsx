//╔══════════════════════════════════════════╗
//║         SIDEBAR LOADER COMPONENT         ║
//╚══════════════════════════════════════════╝

// 🎭 PURPOSE: Displays loading skeletons for the sidebar content
// 📋 TYPES:   - "list" : Shows chat list with avatar placeholders (default)
//             - "empty": Shows "No Friends" message placeholder

export default function SidebarLoader({ type = "list" }) {
  // 🔄 Generate placeholder items for skeleton list
  const loaderItems = Array(8).fill(null);

  return (
    <div className="w-full h-screen bg-base-200 p-3 border-base-300 overflow-y-auto">
      {type === "empty" ? (
        //┌─────────────────────────────────┐
        //│     EMPTY STATE SKELETON        │
        //└─────────────────────────────────┘
        <div className="flex flex-col gap-2 items-center justify-center h-1/2 animate-pulse">
          {/* ✨ Main heading shimmer effect */}
          <div className="h-8 w-48 bg-base-300 rounded shimmer" />
          {/* 💫 Subheading shimmer effect */}
          <div className="h-4 w-60 bg-base-300 rounded shimmer" />
        </div>
      ) : (
        //┌─────────────────────────────────┐
        //│     CHAT LIST SKELETON          │
        //└─────────────────────────────────┘
        <ul className="space-y-3">
          {loaderItems.map((_, idx) => (
            <li key={idx}>
              <div className="flex items-center gap-3 w-full p-2 rounded-lg 
                bg-base-300/40 animate-pulse">
                {/* 🎪 Circular avatar skeleton */}
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full bg-base-300 shimmer" />
                </div>

                {/* 📝 Username text skeleton */}
                <div className="flex-1">
                  <div className="h-4 w-30 bg-base-300 rounded shimmer" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
