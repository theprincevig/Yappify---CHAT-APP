import { Pencil } from "lucide-react";

// =======================
//   ViewOwnProfile Page
// =======================

export default function ViewOwnProfile({ authUser, setIsEditing }) {
    return (
        <div className="text-center space-y-6">
            {/* ======= Profile Avatar & Username ======= */}
            <div className="flex flex-col items-center">
                <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt="profile"
                    className="size-32 rounded-full object-cover border-2"
                />
                <h2 className="mt-3 text-xl font-semibold">{authUser.username}</h2>
            </div>

            {/* ======= Full Name & Bio Section ======= */}
            <div className="text-left space-y-2">
                <p className="text-lg font-medium font-[Poppins]">{authUser.fullName}</p>
                <p className="text-gray-400 font-[Comfortaa]">
                    {authUser.bio || "No bio added."}
                </p>
            </div>

            {/* ======= Edit Profile Button ======= */}
            <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition cursor-pointer"
            >
                <Pencil size={16} /> Edit Profile
            </button>
        </div>
    );
}