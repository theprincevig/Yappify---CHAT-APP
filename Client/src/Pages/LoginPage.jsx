import { Eye, EyeOff, KeyRound, Loader, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

// =======================
//   Login Page Component
// =======================
export default function LoginPage() {
    // Initial form data
    const data = { username: "", password: "" }

    // Local state for password visibility and form data
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(data);

    // Auth store: login function & loading state
    const { login, isLoggingIn } = useAuthStore();

    // -----------------------
    //   Handle Form Submit
    // -----------------------
    async function handleSubmit(e) {
        e.preventDefault();

        try {
            await login(formData); // Attempt login
            toast.success("Welcome to Yappify!"); // Success toast
            setFormData(data); // Reset form
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed!"); // Error toast
        }
    }

    // =======================
    //        UI Render
    // =======================
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md space-y-6 p-6 sm:p-12">

                {/* ----------- LOGO & TITLE ----------- */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold myfont-kaushan tracking-wider mt-2 mb-4">
                        Access your Yappify!
                    </h1>
                    <p className="text-base-content/60 text-xs font-[Poppins]">
                        Join the conversation now.
                    </p>
                </div>

                {/* ----------- LOGIN FORM ----------- */}
                <form onSubmit={handleSubmit} className="text-center space-y-6">

                    {/* --- Username Input --- */}
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
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required 
                            />
                        </label>                        
                    </div>

                    {/* --- Password Input --- */}
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
                        
                        {/* Forgot password */}
                        <div className="text-left text-xs font-[Comfortaa] px-2 mt-1">
                            <Link to={"/forgot-password"} className="link-primary hover:underline transition">Forgotten password?</Link>
                        </div>
                    </div>

                    {/* --- Submit Button --- */}
                    <button
                        type="submit"
                        className="btn btn-primary w-35 text-base font-bold font-[Comfortaa]"
                        disabled={isLoggingIn}
                    >
                        { isLoggingIn ? (
                            <>
                                <Loader size={20} className="animate-spin"/>
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {/* ----------- SIGNUP LINK ----------- */}
                <div className="text-center">
                    <p className="text-base-content/60 text-sm tracking-wide font-[Comfortaa]">
                        Don&apos;t have an Account?{" "}
                        <Link to="/signup" className="link link-primary tracking-wide transition">
                            SignUp
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}