import { Check, X } from "lucide-react";
import { useMemo } from "react";

const PasswordCriteria = ({ password }) => {
    const criteria = useMemo(() => [
        { label: "Minimum 8 characters", met: password.length >= 8 },
        { label: "Includes uppercase letter (A–Z)", met: /[A-Z]/.test(password) },
        { label: "Includes lowercase letter (a–z)", met: /[a-z]/.test(password) },
        { label: "Contains a number (0–9)", met: /\d/.test(password) },
        { label: "Has special character (!@#$...)", met: /[!@#$%^&*(),.?":{}/<>]/.test(password) },
    ], [password]);

    return (
        <div className="mt-2 space-y-1">
            {criteria.map((item) => (
                <div 
                    key={item.label}
                    className="flex items-center text-xs font-[Poppins]"
                >
                    {item.met ? (
                        <Check className="size-4 text-green-500 mr-2" />
                    ) : (
                        <X className="size-4 text-gray-500 mr-2" />
                    )}
                    <span className={item.met ? "text-green-500" : "text-gray-500"}>{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function PasswordStrengthMeter({ password }) {
    const getStrength = (pass) => {
        let strength = 0;
        if (pass.length >= 8) strength += 1;
        if (/[A-Z]/.test(pass)) strength += 1;
        if (/[a-z]/.test(pass)) strength += 1;
        if (/\d/.test(pass)) strength += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 1;
        return Math.min(strength, 5);
    }

    const strength = getStrength(password);

    const getGradient = (strength) => {
        if (strength <= 1) return "bg-gradient-to-r from-red-500 to-red-400";
        if (strength === 2) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
        if (strength === 3) return "bg-gradient-to-r from-lime-500 to-green-400";
        return "bg-gradient-to-r from-green-500 to-emerald-400";
    }

    const getStrengthLabel = (strength) => {
        if (strength === 0) return "Very Weak";
        if (strength === 1) return "Weak";
        if (strength === 2) return "Moderate";
        if (strength === 3) return "Strong";
        return "Excellent";
    }


    return (
        <div className="mt-1 p-2">
            {/* Header with label */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 font-[Poppins]">Password Strength</span>
                <span className="text-xs text-gray-400 font-[Poppins]">{getStrengthLabel(strength)}</span>
            </div>

            {/* Smooth progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                <div
                    className={`h-full ${getGradient(strength)} transition-all duration-500 ease-out`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                />
            </div>

            {/* Password criteria checklist */}
            <PasswordCriteria password={password} />
        </div>
    );
}