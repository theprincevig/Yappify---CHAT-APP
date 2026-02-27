// ──────────────────────────────────────────────────────────────
// AboutApp Component
// Displays app info, logo, version, description, and developer contact.
// ──────────────────────────────────────────────────────────────

// Import: App details (name, version, tagline, etc.)
import { appInfo } from "../../Config/appInfo";
// Import: Theme state (light/dark) from global store
import { useThemeStore } from "../../store/useThemeStore";

export default function AboutApp() {
  const { theme } = useThemeStore(); // Get current theme

  return (
    <div className="relative h-full">
      {/* ────────────── Sticky Header ────────────── */}
      <div className="sticky top-0 px-6 pt-4 z-20 bg-base-300 rounded-t-xl">
        {/* Smooth fade at top for scroll transition */}
        <div className="pointer-events-none absolute left-0 right-0 h-6 bg-gradient-to-b from-base-300 to-transparent" />
      </div>

      {/* ────────────── Scrollable Content ────────────── */}
      <div
        className="
          card-body h-100 group
          overflow-y-auto
          sm:overflow-y-hidden sm:hover:overflow-y-auto
          scrollbar-thin scrollbar-thumb-rounded
          scrollbar-track-transparent
          scrollbar-thumb-zinc-400/40 dark:scrollbar-thumb-zinc-600/40
          hover:scrollbar-thumb-zinc-400/70 dark:hover:scrollbar-thumb-zinc-500/70
          transition-all duration-500 ease-in-out
          animate-fadeIn
          md:pr-4
          [scrollbar-gutter:stable]
        "
      >
        {/* ────────────── Logo & App Name ────────────── */}
        <div className="flex gap-1 items-center justify-end">
          <img
            src={
              theme === "dark"
                ? "/logo/Yappify-logo2.png" // Dark mode logo
                : "/logo/Yappify-logo1.png" // Light mode logo
            }
            alt="logo"
            className="w-15 sm:w-20 h-15 sm:h-20"
          />
          <h1
            className={`
              text-xl sm:text-2xl font-bold tracking-wide myfont-kaushan
              ${theme === "dark" ? "text-white/70" : "text-black/70"}
            `}
          >
            {appInfo.name}
          </h1>
        </div>

        {/* ────────────── Version & Tagline ────────────── */}
        <p className="text-zinc-500 text-right sm:text-base">Version: {appInfo.version}</p>
        <p className="text-zinc-400 myfont-AU-NSW font-extralight sm:text-base text-right mb-4">
          "{appInfo.tagline}"
        </p>

        {/* ────────────── App Description ────────────── */}
        <p
          className={`
            mb-2 whitespace-pre-line sm:text-lg font-[Comfortaa] leading-relaxed text-justify
            ${theme === "dark" ? "text-white/80" : "text-black/80"}
          `}
        >
          {appInfo.description}
        </p>

        {/* ────────────── Developer Info ────────────── */}
        <div className="sm:text-base text-left mt-8">
          <p className="text-zinc-500 italic">
            Built by <span className="font-medium">{appInfo.developer}</span>
          </p>
          <p className="text-zinc-500 flex gap-1 items-center">
            Contact:
            <a
              href={`mailto:${appInfo.contact}`}
              className="text-blue-500 hover:underline transition"
            >
              {appInfo.contact}
            </a>
          </p>
        </div>
      </div>

      {/* ────────────── Bottom Fade ────────────── */}
      <div className="sticky bottom-0 pt-4 bg-base-300 rounded-b-xl">
        {/* Smooth fade at bottom for scroll ending */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 w-full h-10 bg-gradient-to-t from-base-300 to-transparent rounded-b-xl" />
      </div>

      {/* TODO: Add Privacy Policy & Terms later */}
    </div>
  );
}
