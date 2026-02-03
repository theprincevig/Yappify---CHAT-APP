import AboutApp from "../Components/About/AboutApp";
import SidebarLoader from "../Components/LoaderEffects/SidebarLoader";
import ThemeChanger from "../Components/ThemeChanger";

import usePushNotifications from "../hooks/usePushNotifications";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { settingsItems } from "../Config/settingsItems";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// =======================
// Settings Page Component
// =======================
export default function SettingsPage() {
    // ======= State & Stores =======
    const { authUser, logout, toggleNotifications } = useAuthStore();
    const { theme, setTheme  } = useThemeStore();
    const { subscribe } = usePushNotifications();

    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState("about");
    const [showContent, setShowContent] = useState(false);
    const navigate = useNavigate();

    // ===========================
    // Handle Notification Toggle
    // ===========================
    async function handleToggle() {
        if (!authUser) {
            toast.error("Please log in to manage notifications");
            return;
        }

        setLoading(true);
        try {
            if (!authUser.notificationsEnabled) {
                // Enable notifications (subscribe if in control mode)
                if (authUser.funMode === "control") {
                    await subscribe();
                }
                await toggleNotifications(true);
                toast.success("Notifications enabled");
            } else {
                // Disable notifications
                await toggleNotifications(false);
                toast.success("Notifications disabled");
            }            
        } catch (error) {
            console.error("Error toggling notifications:", error);
            toast.error("Failed to toggle notifications");
        } finally {
            setLoading(false);
        }
    }

    function handleSelection(item) {
        if (item.type === "action") {
            if (!authUser) {
                toast.error("You’re not logged in!");
                return;
            }

            navigate("/login");
            return logout();
        }

        // Protected items (notifications, password)
        if (["notifications", "password"].includes(item.id) && !authUser) {
            toast.error("Please log in to access this setting");
            return;
        }
        setSelected(item.id);

        // On mobile -> open full-screen content
        if (window.innerWidth < 768) {
            setShowContent(true);
        }
    }

    return (
        <div className="flex h-screen pt-15">
            {/* Settings sidebar */}
            <div 
                className={`
                    ${showContent ? "hidden" : "flex"}
                    md:flex flex-col w-full md:w-1/3 bg-base-200 p-3 
                    border-base-300 border-r-2 overflow-y-auto transition-all
                `}
            >
                {/* 🏷️ Sidebar Title */}
                <h2 className="text-3xl font-bold mb-3 tracking-wider myfont-kaushan">
                    Settings
                </h2>

                {/* ⏳ Loader State */}
                {loading ? (
                    <SidebarLoader type="list" />
                ) : (
                    <ul className="space-y-2">
                        {settingsItems.map((item) => {
                            const isProtected = ["logout", "notifications", "password"].includes(item.id);
                            const disabled = isProtected && !authUser;

                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleSelection(item)}
                                        disabled={disabled}
                                        className={`
                                            w-full flex items-center gap-3 text-left font-[Poppins] text-sm sm:text-base px-4 py-2 rounded-lg transition
                                            ${
                                                selected === item.id 
                                                ? "bg-base-300" : disabled 
                                                ? "opacity-50 cursor-not-allowed" 
                                                : "hover:bg-base-300 cursor-pointer"
                                            }
                                        `}
                                    >
                                        <item.icon className="size-5" />
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            {/* Main content area */}
            <div 
                className={`
                    ${showContent ? "flex" : "hidden"}
                    md:flex flex-1 w-full bg-base-200 p-4 flex-col
                `}
            >
                {/* Back button for mobile */}                
                <button
                    onClick={() => setShowContent(false)}
                    className="md:hidden flex items-center gap-2 mb-6 font-[Poppins] opacity-50 active:opacity-100"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="card bg-base-300 shadow-white/5 shadow-md w-full rounded-2xl">
                    {selected === "about" && <AboutApp />}                        
                </div>

                {selected === "notifications" && authUser && (
                    <div className="space-y-4">
                        <h3 className="text-xl sm:text-2xl myfont-kaushan tracking-wider font-semibold mb-3">
                            Manage Notifications
                        </h3>
                        {authUser.funMode === "control" ? (
                            <button
                                onClick={handleToggle}
                                className={`
                                        btn btn-primary text-right
                                        ${loading ? "btn-disabled" : ""}
                                    `}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader size={16} className="animate-spin" />
                                ) : authUser.notificationsEnabled ? (
                                    "Disable Notifications"
                                ) : (
                                    "Enable Notifications"
                                )}
                            </button>
                        ) : (
                            <p className="text-zinc-500  font-[Comfortaa] tracking-wide">
                                Notifications are always ON in {" "}
                                <span className="font-semibold">Fun Mode.</span>
                            </p>
                        )}
                    </div>
                )}

                {selected === "password" && authUser && (
                    <Link 
                        to="/change-password"
                        className="w-50 btn btn-outline flex items-center justify-center gap-2"
                    >
                        Change Password
                    </Link>
                )}

                {selected === "theme" && (
                    <ThemeChanger 
                        theme={theme}
                        setTheme={setTheme}
                    />
                )}
            </div>
        </div>
    );
}