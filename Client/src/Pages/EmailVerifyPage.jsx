import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function EmailVerify() {
    const {
        verifyEmail,
        resendVerificationEmail,
        authUser,
        isVerifying        
    } = useAuthStore();
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const [code, setCode] = useState([ "", "", "", "", "", "" ]);
    const [coolDown, setCoolDown] = useState(0);

    // Load cooldown from localStorage (persistent)
    useEffect(() => {
        const saved = localStorage.getItem("coolDown");
        if (saved) setCoolDown(parseInt(saved));
    }, []);

    // Save cooldown persistently
    useEffect(() => {
        if (coolDown > 0) {
            localStorage.setItem("coolDown", coolDown);
        } else {
            localStorage.removeItem("coolDown");
        }
    }, [coolDown]);

    // Redirect if already verified
    useEffect(() => {
        if (authUser?.isVerified) navigate("/chats");
    }, [authUser, navigate]);

    // Auto-submit when all digits are filled
    useEffect(() => {
        if (code.every(d => d !== "")) {
            const timeout = setTimeout(() => handleSubmit(), 200);
            return () => clearTimeout(timeout);
        }
    }, [code]);  
    
    // Cooldown timer logic
    useEffect(() => {
        if (coolDown <= 0) return;
        const timer = setInterval(() => {
            setCoolDown((prev) => prev > 0 ? prev -1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, [coolDown]);

    function handleChange(index, value) {
        const newCode = [...code];

        // Handle pasted content
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";                
            }
            setCode(newCode);

            // Focus on the last non-empty input or the first empty one
            const lastFilledIndex = newCode.findLastIndex((d) => d !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex].focus();

        } else {
            newCode[index] = value;
            setCode(newCode);

            // Move focus to the next input field if value is entered
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    }

    function handleKeyDown(index, e) {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index -1].focus();
        }
    }

    async function handleSubmit(e) {
        if (e) e.preventDefault();
        const verificationCode = code.join("");
        if (verificationCode.length < 6) return;

        if (!authUser?.username) {
            toast.error("User info missing! Please signup again.");
            navigate("/signup");
            return;
        }

        try {
            const res = await verifyEmail(authUser?.username, verificationCode);
            if (res?.success) {
                toast.success("Email verified successfully!");
                toast.success("Welcome to Yappify!");
                setTimeout(() => navigate("/chats"), 800);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.message || "Email verification failed!");
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0].focus();
        }
    }

    async function handleResend() {
        if (coolDown) return;
        try {
            await resendVerificationEmail(authUser?.username, authUser?.email);
            toast.success("Verification email resent!");
            setCoolDown(30);    // Start 30 seconds countdown           

        } catch (error) {
            console.log(error);
            toast.error(error?.message || "Failed to resend email!");
        }
    }    

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-lg space-y-6 p-6 sm:p-12">
                {/* ===== Heading ===== */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl myfont-kaushan font-bold tracking-wider mt-2 mb-3">
                        Unlock Yappify!
                    </h1>
                    <p className="text-base-content/60 text-xs font-[Poppins]">
                        Drop the 6-digit code, start chatting.
                    </p>
                </div>

                <div className="w-full bg-base-300 rounded-xl p-6 space-y-4 shadow-md">
                    <p className="text-xs text-gray-400 font-[Comfortaa] text-center">Check your email for the verification code.</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="validator flex justify-between items-center">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-2xl font-[Poppins] bg-gray-700 text-white 
                                    border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>

                        {/* validation message */}
                        <div className="validator-hint text-left ml-2 hidden text-red-400 text-xs">Enter valid 6-digit code.</div>

                        <button 
                            type="submit"
                            disabled={isVerifying || code.some((digit) => !digit)}
                            className="w-full flex items-center justify-center mx-auto p-2 
                            bg-blue-500 font-bold font-[Comfortaa] rounded-lg disabled:opacity-50 cursor-pointer"
                        >
                            {isVerifying ? <Loader size={20} className="animate-spin" /> : "Verify"}
                        </button>
                    </form>

                    {/* Resend Link */}
                    <p className="text-xs text-gray-400 mt-5 font-[Comfortaa] text-center">
                        Didn’t receive a code?{" "}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={coolDown > 0}
                            className={`${
                                    coolDown > 0 
                                    ? "pointer-events-none" 
                                    : "link-primary hover:underline cursor-pointer"
                                }`}
                        >
                            {coolDown ? `Wait ${coolDown}s...` : "Resend"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}