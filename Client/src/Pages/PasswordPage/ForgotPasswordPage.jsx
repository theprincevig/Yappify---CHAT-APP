import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const { isSendingResetEmail, forgotPassword } = useAuthStore();

    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            await forgotPassword(email);
            setIsSubmitted(true);
            toast.success("Send Reset Password email successfully!");            
        } catch (error) {
            console.error("Error reset password email:", error);
            toast.error(error.response?.data?.message || "Failed to send Reset Password email.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-lg space-y-6 p-6 sm:p-12">
                {/* ===== Heading ===== */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl sm:text-3xl myfont-kaushan font-bold tracking-wider mt-2 mb-3">
                        Oops! Forgot your password?
                    </h1>
                    <p className="text-base-content/60 text-[10px] sm:text-xs font-[Poppins]">
                        Don’t worry! Enter your email and we’ll send a magic link to get you back in.
                    </p>
                </div>

                {/* --- Email Field --- */}
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="form-control space-y-6">
                            <label className="input validator w-full">
                                <svg className="h-[1.2em] opacity-50" viewBox="0 0 24 24">
                                    <Mail className="size-5 text-base-content/40" />
                                </svg>
                                <input 
                                    type="email"
                                    placeholder="Email Address"
                                    className="pl-2"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </label>
                            <div className="validator-hint text-left ml-2 hidden">
                                Enter valid email address
                            </div>

                            <button 
                                type="submit"
                                disabled={isSendingResetEmail}
                                className="btn btn-primary w-70 text-base flex items-center justify-center mx-auto p-2 
                                font-bold font-[Comfortaa] rounded-lg hover:opacity-50 transition disabled:bg-gray-700 cursor-pointer"
                            >
                                {isSendingResetEmail ? <Loader size={20} className="animate-spin" /> : "Send Reset Link"}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-base-300 p-3 flex flex-col items-center justify-center gap-4 rounded-lg">
                            <p className="font-[Poppins] text-center">
                                If an account exists for <span className="text-zinc-400">{email}</span>, you will receive a password reset link shortly.
                            </p>
                            
                            <Link to="/login" className="font-bold font-[Comfortaa] flex items-center gap-2 text-sm link-primary hover:underline transition">
                                <ArrowLeft size={16} />Back to Login
                            </Link>
                        </div>
                    )}                    
            </div>
        </div>
    );
}