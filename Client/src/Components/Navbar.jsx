import { Link } from "react-router-dom";
import { UserPlus, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

/**
 * ===========================
 *        NAVBAR COMPONENT
 * ===========================
 * - Displays brand logo (theme-aware)
 * - Shows navigation buttons
 * - Authenticated users see extra options
 */

export default function Navbar() {
    const { authUser } = useAuthStore();
    const { theme } = useThemeStore();

    return (
        <header className="fixed top-0 z-40 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-lg">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
                
                {/* ========== BRAND LOGO ========== 
                        - Switches image based on theme
                        - Click to go Home
                */}
                <Link to="/" className="hover:opacity-80 transition duration-200">
                    <img
                        src={
                            theme === "dark"
                                ? "/logo/Yappify-logo2.png" // 🌙 Dark Mode Logo
                                : "/logo/Yappify-logo1.png" // ☀️ Light Mode Logo
                        }
                        alt="yappify"
                        className="h-15 md:h-20 w-auto"
                    />
                </Link>

                {/* ========== NAVIGATION BUTTONS ========== */}
                <div className="flex items-center gap-2 sm:gap-3">
                    
                    {/* --- Authenticated User Actions --- */}
                    {authUser && (
                        <>
                            {/* ➕ Add Friends Button */}
                            <Link to="/addFriend" className="btn btn-sm gap-2">
                                <UserPlus className="size-4" />
                                <span className="hidden sm:inline font-medium myfont-AU-NSW tracking-wide">
                                    Add Friends
                                </span>
                            </Link>

                            {/* 👤 Profile Button */}
                            <Link to="/profile" className="btn btn-sm gap-2">
                                <User className="size-4" />
                                <span className="hidden sm:inline font-medium myfont-AU-NSW tracking-wide">
                                    Profile
                                </span>
                            </Link>
                        </>
                    )}

                    {/* --- Always Visible --- */}
                    {/* ⚙️ Settings Button */}
                    <Link to="/settings" className="btn btn-sm gap-2 transition-colors">
                        <Settings className="size-4" />
                        <span className="hidden sm:inline font-medium myfont-AU-NSW tracking-wide">
                            Settings
                        </span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
