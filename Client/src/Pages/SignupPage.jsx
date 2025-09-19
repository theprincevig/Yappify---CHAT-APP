import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, KeyRound, Loader, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import FunModeModal from "../Components/PopupModals/FunModeModal";

// =======================
//   Signup Page Component
// =======================
export default function SignupPage() {
    // Initial form data
    const data = {
        username: "",
        email: "",
        password: ""
    }

    // =======================
    //   Local State
    // =======================
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(data);

    // =======================
    //   Auth Store Hooks
    // =======================
    const { signup, isSigningUp, showFunModePopup, setShowFunModePopup } = useAuthStore();

    // =======================
    //   Handle Form Submit
    // =======================
    async function handleSubmit(e) {
        e.preventDefault();

        try {
            await signup(formData); // Call signup from store
            toast.success("Welcome to Yappify!");
            setFormData(data); // Reset form
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed!");
            console.log(error);
        }
    }

    // =======================
    //   Render UI
    // =======================
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md space-y-6 p-6 sm:p-12">

                {/* ===== Logo & Welcome Text ===== */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-wider mt-2 mb-4" style={{fontFamily: "'Kaushan Script', sans serif"}}>
                        Join Yappify!
                    </h1>
                    <p className="text-base-content/60 text-xs font-[Poppins]">
                        Your chat journey begins here.
                    </p>
                </div>

                {/* ===== Signup Form ===== */}
                <form onSubmit={handleSubmit} className="text-center space-y-6">

                    {/* --- Username Field --- */}
                    <div className="form-control">
                        <label className="input validator w-full">
                            <svg className="h-[1.2em] opacity-50" viewBox="0 0 24 24">
                                <User className="size-5 text-base-content/40" />
                            </svg>
                            <input 
                                type="text"
                                placeholder="username"
                                value={formData.username}
                                className="pl-2"
                                pattern="^(?![._])[A-Za-z0-9._]{3,30}(?<![._])$"
                                minLength="3"
                                maxLength="30"
                                title="Username must be 3-30 characters long and can contain letters, numbers, dots (.) and underscores (_)."
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required 
                            />
                        </label>
                        <div className="validator-hint text-left ml-2 hidden">
                            Must be 3 to 30 characters containing letters, numbers, dots (.) or underscores (_)
                        </div>
                    </div>

                    {/* --- Email Field --- */}
                    <div className="form-control">
                        <label className="input validator w-full">
                            <svg className="h-[1.2em] opacity-50" viewBox="0 0 24 24">
                                <Mail className="size-5 text-base-content/40" />
                            </svg>
                            <input 
                                type="email"
                                placeholder="mail@site.com"
                                className="pl-2"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required 
                            />
                        </label>
                        <div className="validator-hint text-left ml-2 hidden">
                            Enter valid email address
                        </div>
                    </div>

                    {/* --- Password Field --- */}
                    <div className="form-control">
                        <label className="input validator w-full">
                            <svg className="h-[1.2em] opacity-50" viewBox="0 0 24 24">
                                <KeyRound className="size-5 text-base-content/40" />
                            </svg>
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="password"
                                className="pl-2"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required 
                            />
                            {/* Toggle Password Visibility */}
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
                        <div className="validator-hint text-left ml-2 hidden">
                            Must be more than 8 characters, including
                        </div>
                    </div>

                    {/* --- Submit Button --- */}
                    <button 
                        type="submit" 
                        className="btn btn-primary w-35 text-sm font-bold font-[Comfortaa]" 
                        disabled={isSigningUp}
                    >
                        { isSigningUp ? (
                            <>
                                <Loader className="size-5 animate-spin"/>
                            </>
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                {/* ===== Login Link ===== */}
                <div className="text-center">
                    <p className="text-base-content/60 text-sm font-[Comfortaa]">
                        If Already have an Account?{" "}
                        <Link to="/login" className="link link-primary">login</Link>
                    </p>
                </div>

                {/* ===== Fun Mode Popup ===== */}
                { showFunModePopup && <FunModeModal onClose={() => setShowFunModePopup(false)} /> }
            </div>
        </div>
    );
}