import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../../Components/PasswordStrengthMeter";
import { Eye, EyeOff, KeyRound, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
    const fields = {
        current: false,
        new: false,
        confirm: false
    }

    const { isResettingPassword, changePassword } = useAuthStore();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(fields);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error(`Please fill the ${newPassword || confirmPassword} field`);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords doesn't match");
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            toast.success("Password Updated Successfully! Please login again.");
            setTimeout(() => {
                navigate("/login");
            }, 1000);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error) {
            console.error("Error updating password :", error);
            toast.error(error.response?.data?.message || "Failed to Updating Password.");
        }
    }

    const togglePassword = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
    }


    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-lg space-y-6 p-6 sm:p-12">
                {/* ===== Heading ===== */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl sm:text-3xl myfont-kaushan font-bold tracking-wider mt-2 mb-3">
                        Secure your Yappify!
                    </h1>
                    <p className="text-base-content/60 text-[10px] sm:text-xs font-[Poppins]">
                        Refresh your password to stay safe and connected.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="form-control space-y-4">
                    <label className="input validator w-full">
                        <svg className="h-[1.2em] opacity-50" viewBox="0 0 24 24">
                            <KeyRound className="size-5 text-base-content/40" />
                        </svg>
                        <input 
                            type={showPassword.current ? "text" : "password"}
                            placeholder="Current Password"
                            className="pl-2"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required 
                        />
                        {/* Password visibility toggle */}
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePassword("current")}
                        >
                            {showPassword.current ? (
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
                            type={showPassword.new ? "text" : "password"}
                            placeholder="New Password"
                            className="pl-2"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                        />
                        {/* Password visibility toggle */}
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePassword("new")}
                        >
                            {showPassword.new ? (
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
                            type={showPassword.confirm ? "text" : "password"}
                            placeholder="Confirm New Password"
                            className="pl-2"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                        {/* Password visibility toggle */}
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePassword("confirm")}
                        >
                            {showPassword.confirm ? (
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
                            maxHeight: newPassword ? "200px" : "0px", // adjust according to your PasswordStrengthMeter height
                        }}
                    >
                        <div
                            className="transform origin-top transition-transform duration-300 ease-in-out"
                            style={{
                                transform: newPassword || confirmPassword ? "scaleY(1)" : "scaleY(0)",
                            }}
                        >
                            <PasswordStrengthMeter password={newPassword || confirmPassword} />
                        </div>
                    </div>

                    {/* --- Submit Button --- */}
                    <button 
                        type="submit" 
                        disabled={isResettingPassword}
                        className="btn btn-primary w-70 text-base flex items-center justify-center mx-auto p-2 
                        font-bold font-[Comfortaa] rounded-lg hover:opacity-50 transition-all disabled:bg-gray-700 cursor-pointer" 
                    >
                        {isResettingPassword ? <Loader size={20} className="animate-spin"/> : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}