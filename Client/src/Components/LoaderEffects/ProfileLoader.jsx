/*******************************************
 * 🎭 PROFILE LOADER COMPONENT
 * A sleek loading skeleton for profile views
 * Creates a smooth, engaging loading experience
 *******************************************/

export default function ProfileLoader() {
  return (
    <>
      {/* ============================
          🎪 Profile Avatar Section
          Shows a pulsing circular loader
      ============================= */}
      <div className="flex flex-col items-center space-y-4">
        <div className="avatar">
          <div className="size-40 rounded-full bg-base-300 shimmer" />
        </div>
        {/* 📛 Username Placeholder - Shimmering bar */}
        <div className="h-8 w-1/2 bg-base-300 rounded shimmer" />
      </div>

      {/* ============================
          📖 Bio Information Section
          Displays placeholder text blocks
      ============================= */}
      <div className="text-left space-y-2">
        <div className="h-8 w-1/3 bg-base-300 rounded shimmer" />
        <div className="h-8 w-1/2 bg-base-300 rounded shimmer" />
      </div>

      {/* ============================
          🎯 Action Button Section
          Full-width button placeholder
      ============================= */}
      <div className="w-full flex justify-evenly items-center">
        <div className="h-10 w-full bg-base-300 rounded shimmer" />
      </div>
    </>
  );
}
