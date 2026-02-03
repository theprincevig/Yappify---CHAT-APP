import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import ViewOwnProfile from "./ViewOwnProfile";
import EditProfile from "./EditProfile";
import ProfileLoader from "../../Components/LoaderEffects/ProfileLoader";

/**
 * Profile Page Component
 * ---------------------
 * Displays the user's profile information.
 * Allows toggling between viewing and editing profile.
 */
export default function Profile() {
    // Get authenticated user from store
    const { authUser } = useAuthStore();

    // State: Track if user is editing profile
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="h-screen pt-20">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8 shadow-md">
                    {!authUser ? (
                        <ProfileLoader />
                    ) : (
                        <>
                            {/* Render Edit or View Profile based on isEditing */}
                            {isEditing ? (
                                <EditProfile 
                                    authUser={authUser} 
                                    setIsEditing={setIsEditing} 
                                />
                            ) : (
                                <ViewOwnProfile 
                                    authUser={authUser} 
                                    setIsEditing={setIsEditing} 
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}