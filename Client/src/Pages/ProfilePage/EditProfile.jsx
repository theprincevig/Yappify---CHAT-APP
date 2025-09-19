import { useState } from "react";
import { Camera, Loader, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * EditProfile Component
 * ---------------------
 * Allows users to update their profile info and avatar.
 */
export default function EditProfile({ authUser, setIsEditing }) {
    // Store actions and state
    const { isUpdatingProfile, updateProfile } = useAuthStore();

    // Toggle username editing (disabled due to server issues)
    const allowUsernameEdit = false;

    // Initial form data
    const data = {
        username: authUser.username || "",
        fullName: authUser.fullName || "",
        bio: authUser.bio || ""
    };

    // Local state for form and avatar
    const [formData, setFormData] = useState(data);
    const [selectedImgPreview, setSelectedImgPreview] = useState(authUser.profilePic || "/avatar.png");
    const [selectedImgFile, setSelectedImgFile] = useState(null);

    // ----------------------------------------
    // Avatar Upload & Preview Handler
    // ----------------------------------------
    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedImgFile(file);

        // Show preview of selected image
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setSelectedImgPreview(reader.result);
        };
    }

    // ----------------------------------------
    // Remove Profile Picture Handler
    // ----------------------------------------
    function handleRemoveProfilePic() {
        setSelectedImgPreview("/avatar.png");
        setSelectedImgFile(null);
        toast.success("Profile picture will be removed successfully.");
    }

    // ----------------------------------------
    // Save Profile Changes Handler
    // ----------------------------------------
    async function handleSave() {
        try {
            // If avatar is removed, send default avatar path
            const profilePicToSend = selectedImgPreview === "/avatar.png" ? "/avatar.png" : selectedImgFile;

            await updateProfile({ ...formData, profilePic: profilePicToSend });
            toast.success("Profile updated successfully!");
            setIsEditing(false);

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
            console.log(error);
        }
    }

    // ----------------------------------------
    // Render UI
    // ----------------------------------------
    return (
        <div className="space-y-6">
            {/* ----------------------------------------
                Avatar Section
            ---------------------------------------- */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <img
                        src={selectedImgPreview || "/avatar.png"}
                        alt="profile"
                        className="w-32 h-32 rounded-full object-cover border-2"
                    />
                    <div className="absolute bottom-0 right-0">
                        {selectedImgPreview === "/avatar.png" ? (
                            // Show "Add profile" button if using default avatar
                            <label
                                htmlFor="avatar-upload"
                                className={`
                                    absolute bottom-0 right-0
                                    bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer
                                    transition-all duration-200
                                    ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                                `}
                            >
                                <Camera className="w-4 h-4 text-base-200" />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUpdatingProfile}
                                />
                            </label>
                        ) : (
                            // Show "Remove" button if custom avatar is set
                            <button
                                type="button"
                                onClick={handleRemoveProfilePic}
                                className="bg-red-500 hover:bg-red-600 hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200"
                                disabled={isUpdatingProfile}
                            >
                                <Trash2 className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ----------------------------------------
                Editable Profile Fields
            ---------------------------------------- */}
            <div className="space-y-4">
                {/* Username Field */}
                <fieldset className="border border-gray-500 bg-base-200 rounded-xl p-2">
                    <legend className="text-sm font-medium px-2">Username</legend>
                    {allowUsernameEdit ? (
                        // Editable username input
                        <input
                            type="text"
                            value={formData.username}
                            pattern="^(?![._])[A-Za-z0-9._]{3,30}(?<![._])$"
                            minLength="3"
                            maxLength="30"
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                            className="w-full outline-none bg-transparent"
                            required
                        />
                    ) : (
                        // Disabled username input with warning
                        <>
                            <input
                                type="text"
                                value={formData.username}
                                readOnly
                                onFocus={() =>
                                    toast.error("⚠️ Username editing is temporarily disabled.")
                                }
                                className="w-full outline-none bg-transparent cursor-not-allowed text-zinc-400"
                            />
                            <p className="text-yellow-500 font-[Poppins] opacity-70 text-xs mt-1">
                                ⚠️ You can't edit your username right now due to server issues.
                            </p>
                        </>
                    )}
                </fieldset>

                {/* Full Name Field */}
                <fieldset className="border border-gray-500 bg-base-200 rounded-xl p-2">
                    <legend className="text-sm font-medium fieldset-label px-2">Name</legend>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full outline-none bg-transparent"
                    />
                </fieldset>

                {/* Bio Field */}
                <fieldset className="border border-gray-500 bg-base-200 rounded-xl p-2">
                    <legend className="text-sm font-medium fieldset-label px-2">Bio</legend>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full outline-none bg-transparent"
                    />
                </fieldset>
            </div>

            {/* ----------------------------------------
                Action Buttons
            ---------------------------------------- */}
            <div className="flex gap-3">
                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isUpdatingProfile}
                    className="btn flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition cursor-pointer"
                >
                    <Save size={16} /> {isUpdatingProfile ? <Loader size={16} className="animate-spin" /> : "Save"}
                </button>
                {/* Cancel Button */}
                <button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg transition cursor-pointer btn btn-ghost"
                >
                    <X size={16} /> Cancel
                </button>
            </div>
        </div>
    );
}