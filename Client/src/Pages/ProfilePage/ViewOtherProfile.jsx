import { useNavigate, useParams } from "react-router-dom";
import { useFriendStore } from "../../store/useFriendStore";
import { useEffect, useState } from "react";
import { friendActionsMap } from "../../utils/friendActionsMap";
import { useAuthStore } from "../../store/useAuthStore";
import { useMessageStore } from "../../store/useMessageStore";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

import ProfileLoader from "../../Components/LoaderEffects/ProfileLoader";

// =======================
//   ViewOtherProfile Page
// =======================

export default function ViewOtherProfile() {
    // ----------- Hooks & Stores -----------
    const { profileId } = useParams();
    const navigate = useNavigate();
    const { viewProfile } = useAuthStore();
    const { setCurrentChat } = useMessageStore();
    const {            
            loading,
            checkStatus,
            sendRequest,
            acceptRequest,
            rejectRequest,
            cancelRequest,
            removeFriend,
            initFriendSocket,
            disconnectFriendSocket
        } = useFriendStore();

    // ----------- Local State -----------
    const [user, setUser] = useState(null);
    const [friendStatus, setFriendStatus] = useState("none"); // "accepted", "pending", "request", "none"
    const [requestType, setRequestType] = useState(null); // "sent" or "received"
    const [actionLoading, setActionLoading] = useState(false);

    // ----------- Friend Actions Map -----------
    const actionsMap = friendActionsMap({
            sendRequest,
            cancelRequest,
            acceptRequest,
            rejectRequest,
            removeFriend
        });

    // ===========================
    //   Fetch Profile & Status
    // ===========================
    useEffect(() => {
        async function fetchProfile() {
            try {
                // --- Get user profile data ---
                const profileData = await viewProfile(profileId);
                if (!profileData) return;

                setUser(profileData);

                // --- Check friendship status ---
                const statusRes = await checkStatus(profileId);
                if (statusRes.status === "accepted") {
                    setFriendStatus("accepted");
                } else if (statusRes.status === "pending") {
                    setFriendStatus("pending");
                    setRequestType(statusRes.sentBy === "me" ? "sent" : "received");                    
                } else if (statusRes.status === "rejected") {
                    setFriendStatus("none");
                }

            } catch (error) {
                console.error(error);
            }
        }

        fetchProfile();
        initFriendSocket();
        return () => disconnectFriendSocket();
    }, [profileId, viewProfile, checkStatus, initFriendSocket, disconnectFriendSocket]);

    // ===========================
    //   Handle Friend Actions
    // ===========================
    async function handleAction(actionType) {
        const userId = user._id;
        if (!userId) return;

        const action = actionsMap[actionType];
        if (!action) return;

        setActionLoading(true);
        try {
            // --- Perform action (add/cancel/accept/reject/remove) ---
            const res = await action.fn(userId);
            toast.success(action.success);

            // --- Update status & request type ---
            setFriendStatus(action.getNewStatus(res));
            setRequestType(action.getNewRequestType(res));

        } catch (error) {
            const message = error.response?.data?.error;
            if (message === "Friend request already exists.") {
                setFriendStatus("pending");
                setRequestType("sent");
                toast.error("Friend request already exists!");
            } else {
                toast.error(message || "Something went wrong!");
            }
        } finally {
            setActionLoading(false);
        }
    }

    // ===========================
    //   Start Chat With User
    // ===========================
    function handleMessageClick() {
        if (!user) return;

        // Use chatId if available, else null (will create new chat)
        const chatId = user.chatId || null;
        setCurrentChat(chatId, user);   // update store

        // Navigate to chat page
        navigate("/chat");
    }

    // ===========================
    //   Render UI
    // ===========================
    return (
        <div className="h-screen pt-20">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8 shadow-md">
                    {/* ----------- Loader ----------- */}
                    {loading ? (
                        <ProfileLoader />
                    ) : (
                        <>
                            {/* ----------- User Not Found ----------- */}
                            {!user ? (
                                <>
                                    {/* --- Avatar & Message --- */}
                                    <div className="flex flex-col items-center text-center">
                                        <img
                                            src="/avatar.png"
                                            alt="profile"
                                            className="size-32 rounded-full object-cover border-2"
                                        />                                
                                        <h2 className="mt-3 text-gray-400 myfont-kaushan tracking-wider">User not found.</h2>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* ----------- Profile Section ----------- */}
                                    <div className="flex flex-col items-center">
                                        {/* --- Avatar --- */}
                                        <img
                                            src={user.profilePic || "/avatar.png"}
                                            alt="profile"
                                            className="size-32 rounded-full object-cover border-2"
                                        />
                                        {/* --- Username --- */}
                                        <h2 className="mt-3 text-xl font-semibold">{user.username}</h2>
                                    </div>
                                    
                                    {/* ----------- Name & Bio ----------- */}
                                    <div className="text-left">
                                        <p className="text-lg font-medium font-[Poppins]">{user.fullName}</p>
                                        <p className="text-gray-400 font-[Comfortaa]">{user.bio || "No bio added."}</p>
                                    </div>

                                    {/* ----------- Action Buttons ----------- */}
                                    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-evenly items-center gap-2">
                                        <div className="sm:justify-start flex flex-wrap gap-2 justify-center">
                                            {/* --- If Friends --- */}
                                            {friendStatus === "accepted" && (
                                                <>
                                                    <button className="w-30 btn btn-success btn-base rounded-xl font-[Poppins]" disabled>Friends</button>
                                                    <button className="w-30 btn btn-error btn-base rounded-xl font-[Poppins]" disabled={actionLoading} onClick={() => handleAction("remove")}>
                                                        {actionLoading ? <Loader size={16} className="animate-spin" /> : "Remove"}
                                                    </button>
                                                </>
                                            )}

                                            {/* --- If Request Sent --- */}
                                            {friendStatus === "pending" && requestType === "sent" && (
                                                <>
                                                    <button className="w-30 btn btn-warning btn-base rounded-xl font-[Poppins]" disabled>Pending</button>
                                                    <button className="w-30 btn btn-error btn-base rounded-xl font-[Poppins]" disabled={actionLoading} onClick={() => handleAction("cancel")}>
                                                        {actionLoading ? <Loader size={16} className="animate-spin" /> : "Cancel"}
                                                    </button>
                                                </>
                                            )}

                                            {/* --- If Request Received --- */}
                                            {friendStatus === "pending" && requestType === "received" && (
                                                <>
                                                    <button className="w-30 btn btn-success btn-base rounded-xl font-[Poppins]" disabled={actionLoading} onClick={() => handleAction("accept")}>
                                                        {actionLoading ? <Loader size={16} className="animate-spin" /> : "Accept"}
                                                    </button>
                                                    <button className="w-30 btn btn-error btn-base rounded-xl font-[Poppins]" disabled={actionLoading} onClick={() => handleAction("reject")}>
                                                        {actionLoading ? <Loader size={16} className="animate-spin" /> : "Reject"}
                                                    </button>
                                                </>
                                            )}

                                            {/* --- If Not Friends --- */}
                                            {friendStatus === "none" && (
                                                <button className="w-40 btn btn-primary btn-base rounded-xl font-[Poppins]" disabled={actionLoading} onClick={() => handleAction("add")}>
                                                    {actionLoading ? <Loader size={16} className="animate-spin" /> : "Add Friend"}
                                                </button>
                                            )}
                                        </div>

                                        {/* --- Message Button (Only if Friends) --- */}
                                        {friendStatus === "accepted" && (
                                            <button 
                                                className="sm:w-80 w-full btn btn-primary rounded-xl text-base font-[Poppins]" 
                                                onClick={handleMessageClick}
                                                disabled={actionLoading}
                                            >
                                                Message
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}