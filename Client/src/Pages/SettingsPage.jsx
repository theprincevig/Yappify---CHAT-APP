import { Loader, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Link } from "react-router-dom";
import usePushNotifications from "../hooks/usePushNotifications";
import toast from "react-hot-toast";
import { useState } from "react";
import AboutApp from "../Components/About/AboutApp";

// =======================
// Settings Page Component
// =======================
export default function SettingsPage() {
    // ======= State & Stores =======
    const { authUser, logout, toggleNotifications } = useAuthStore();
    const { theme, setTheme  } = useThemeStore();
    const { subscribe } = usePushNotifications();
    const [loading, setLoading] = useState(false);

    // ===========================
    // Handle Notification Toggle
    // ===========================
    async function handleToggle() {
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

    // ===========================
    // Render Settings Page Layout
    // ===========================
    return (
        <div className="h-screen pt-20">
            <div className="w-full max-w-lg p-6 space-y-6">

                {/* ----------- About Section ----------- */}
                <div className="card bg-base-200 shadow-md">
                    <AboutApp />
                </div>

                {/* -------- Notifications Section -------- */}
                {authUser && (
                    <div className="card bg-base-200 shadow-md">
                        <div className="card-body">
                            <h2 className="card-title">Notifications</h2>
                            {authUser.funMode === "control" ? (
                                <button 
                                    onClick={handleToggle} 
                                    className={`btn btn-primary mt-2 ${loading ? "btn-disabled" : ""}`} 
                                    disabled={loading}
                                >
                                    {loading ? <Loader size={16} className="animate-spin" /> 
                                        : authUser.notificationsEnabled ? "Disable" : "Enable"
                                    } Notifications
                                </button>
                            ) : (
                                <p className="text-gray-400">Notifications are always ON in Fun Mode.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ----------- Theme Section ----------- */}
                <div className="card bg-base-200 shadow-md">
                    <div className="card-body">
                        <h2 className="card-title">Theme</h2>
                        <div className="join join-horizontal">
                            {/* Light Mode Button */}
                            <input
                                type="radio"
                                name="theme-buttons"
                                className="btn theme-controller join-item"
                                aria-label="Light"
                                value="light"
                                checked={theme === "light"}
                                onChange={() => setTheme("light")}
                            />

                            {/* Dark Mode Button */}
                            <input
                                type="radio"
                                name="theme-buttons"
                                className="btn theme-controller join-item"
                                aria-label="Dark"
                                value="dark"
                                checked={theme === "dark"}
                                onChange={() => setTheme("dark")}
                            />
                        </div>
                    </div>
                </div>

                {/* ----------- Logout Section ----------- */}
                {authUser && (
                    <div className="card bg-base-200 shadow-md">
                        <div className="card-body">
                            <button onClick={logout}>
                                <Link to={"/login"} className="w-full flex items-center justify-between">
                                    <h2 className="card-title cursor-pointer">Logout</h2>
                                    <LogOut className="size-6 cursor-pointer" />
                                </Link>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}