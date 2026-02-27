import { Loader, X } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

export default function ConfirmModal({ loading, onConfirm, isOpen, onCancel }) {
    const { theme } = useThemeStore();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs mx-2">
            <div 
                className={`
                    ${theme === "dark" ? "bg-black/60" : "bg-white/60"} 
                    text-center rounded-2xl shadow-lg w-full max-w-lg p-6
                `}
            >
                {/* Close button */}
                <button
                    className="w-full opacity-50 hover:opacity-100 duration-200 cursor-pointer mb-4"
                    onClick={onCancel}
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <p className="font-[Poppins] font-light text-sm sm:text-base mb-4">
                    After Changing your username, you will be logged out automatically. Please login again using your new username.
                </p>

                <button
                    onClick={onConfirm}
                    className="border w-[50%] rounded-lg btn btn-primary sm:text-base text-sm"
                    disabled={loading}
                >
                    {loading ? <Loader size={20} className="animate-spin" /> : "Confirm"}
                </button>
            </div>
        </div>
    );
}