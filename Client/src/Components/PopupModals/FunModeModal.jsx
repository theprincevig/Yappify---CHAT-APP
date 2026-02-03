import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import usePushNotifications from "../../hooks/usePushNotifications";
import { Loader } from "lucide-react";

// ========================================================================
// FunModeModal Component
// ========================================================================
// Lets the user choose between Fun Mode (chaos) or Full Control (peace)
export default function FunModeModal({ onClose }) {
    // Track confirm button loading state
    const [loading, setLoading] = useState(false);
    // Which mode user selects ('fun' or 'control')
    const [selectedMode, setSelectedMode] = useState("");

    // Store action for setting fun mode
    const { updateNotifications } = useAuthStore();
    // Push notifications hook for enabling notifications
    const { subscribe } = usePushNotifications();

    // ========================================================================
    // Handle confirm button click
    // ========================================================================
    const handleSelectMode = async () => {
        // If no mode is selected, show an error toast
        if (!selectedMode) {
            toast.error("Please select the Mode.");
            return;
        }

        setLoading(true); // Start loading animation
        try {
            await updateNotifications(selectedMode); // Update the selected mode in the store

            // Enable push notifications if Full Control mode is chosen
            if (selectedMode === "control") {
                await subscribe();
            }

            toast.success(`Mode set to "${selectedMode}" successfully!`); // Show success toast
            onClose(); // Close the modal after successful mode setting
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to set mode"); // Show error toast if mode setting fails
        } finally {
            setLoading(false); // Stop loading animation
        }
    };

    // ========================================================================
    // Render the modal UI
    // ========================================================================
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2">
            <div className="flex flex-col items-center justify-center bg-black text-white rounded-xl p-6 w-full max-w-lg shadow-lg relative">
                {/* 🔹 Modal Header */}
                <div className="flex flex-col items-center justify-center gap-2 mb-4">
                    <h2 className="text-3xl myfont-kaushan tracking-wide">Choose your Mode</h2>
                    <p className="text-zinc-500 text-sm font-[Comfortaa]">
                        You can only choose once, so pick wisely!
                    </p>
                </div>

                {/* 🎛 Mode Selection */}
                <div className="space-y-2">
                    <div className="flex flex-col gap-3">
                        {/* Fun Mode */}
                        <label
                            onClick={() => setSelectedMode("fun")}
                            className={`flex flex-col gap-2 p-4 rounded-lg cursor-pointer transition 
                            ${selectedMode === "fun" ? "bg-neutral-800 border border-blue-500" : "hover:bg-neutral-900"}`}
                        >
                            <p className="text-base sm:text-lg opacity-50">
                                Are you the friend who loves chaos and constant attention? Go Fun by Default
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-[Poppins]">
                                    Fun Mode (notifications always on)
                                </span>
                                {/* Radio button */}
                                <span
                                    className={`
                                        size-3 sm:size-4 flex items-center justify-center rounded-full border 
                                        ${selectedMode === "fun" ? "border-blue-500" : "border-gray-500"}
                                    `}
                                >
                                    {selectedMode === "fun" && <span className="w-3 h-3 bg-blue-500 rounded-full" />}
                                </span>
                            </div>
                        </label>

                        {/* Full Control Mode */}
                        <label
                            onClick={() => setSelectedMode("control")}
                            className={`
                                flex flex-col gap-2 p-4 rounded-lg cursor-pointer transition 
                                ${selectedMode === "control" ? "bg-neutral-800 border border-blue-500" : "hover:bg-neutral-900"}
                            `}
                        >
                            <p className="text-base sm:text-lg opacity-50">
                                Prefer peace and quiet? Take full control
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-[Poppins]">
                                    Full Control <br /> (manage notifications yourself)
                                </span>
                                {/* Radio button */}
                                <span
                                    className={`
                                        size-3 sm:size-4 flex items-center justify-center rounded-full border 
                                        ${selectedMode === "control" ? "border-blue-500" : "border-gray-500"}
                                    `}
                                >
                                    {selectedMode === "control" && <span className="w-3 h-3 bg-blue-500 rounded-full" />}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleSelectMode}
                    disabled={loading}
                    className="w-[60%] sm:w-full flex items-center justify-center mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 font-semibold font-[Poppins] py-2 sm:py-3 rounded-lg cursor-pointer duration-150"
                >
                    {loading ? <Loader size={16} className="animate-spin" /> : "Confirm"}
                </button>
            </div>
        </div>
    );
}
