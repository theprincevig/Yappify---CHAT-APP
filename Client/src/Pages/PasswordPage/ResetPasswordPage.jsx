import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate, useParams } from "react-router-dom";
import PasswordStrengthMeter from "../../Components/PasswordStrengthMeter";
import { Eye, EyeOff, KeyRound, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
    const { isResettingPassword, resetPassword } = useAuthStore();
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords doesn't match");
            return;
        }

        try {
            await resetPassword(token, password);
            toast.success("Password Reset Successfully!");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            console.error("Error resetting password :", error);
            toast.error(error.response?.data?.message || "Failed to Resetting Password.");
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-lg space-y-6 p-6 sm:p-12">
                {/* ===== Heading ===== */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl sm:text-3xl myfont-kaushan font-bold tracking-wider mt-2 mb-3">
                        Get back to Yappify!
                    </h1>
                    <p className="text-base-content/60 text-[10px] sm:text-xs font-[Poppins]">
                        Set a new password and jump right back into the fun.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="form-control space-y-6">
                    <label className="input validator w-full">
                        <svg className="h-[1.2em] opacity-50" viewBox="0 0 24 24">
                            <KeyRound className="size-5 text-base-content/40" />
                        </svg>
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="new password"
                            className="pl-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        {/* Password visibility toggle */}
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            { showPassword ? (
                                <EyeOff className="size-3.5 text-base-content/40 cursor-pointer" />
                            ) : (
                                <Eye className="size-3.5 text-base-content/40 cursor-pointer" />
                            )}
                        </button>
                    </label>
                    <label className="input validator w-full">
                        <svg className="h-[1.2em] opacity-50" viewBox="0 0 24 24">
                            <KeyRound className="size-5 text-base-content/40" />
                        </svg>
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="confirm new password"
                            className="pl-2"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                        {/* Password visibility toggle */}
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            { showConfirmPassword ? (
                                <EyeOff className="size-3.5 text-base-content/40 cursor-pointer" />
                            ) : (
                                <Eye className="size-3.5 text-base-content/40 cursor-pointer" />
                            )}
                        </button>
                    </label>
                    {/* Password Strength Meter - Only show if password is not empty */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out`}
                        style={{
                            maxHeight: password ? "200px" : "0px", // adjust according to your PasswordStrengthMeter height
                        }}
                    >
                        <div
                            className="transform origin-top transition-transform duration-300 ease-in-out"
                            style={{
                                transform: password ? "scaleY(1)" : "scaleY(0)",
                            }}
                        >
                            <PasswordStrengthMeter password={password} />
                        </div>
                    </div>

                    {/* --- Submit Button --- */}
                    <button 
                        type="submit" 
                        disabled={isResettingPassword}
                        className="btn btn-primary w-70 text-base flex items-center justify-center mx-auto p-2 
                        font-bold font-[Comfortaa] rounded-lg hover:opacity-50 transition disabled:bg-gray-700 cursor-pointer" 
                    >
                        {isResettingPassword ? <Loader size={20} className="animate-spin"/> : "Set New Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}