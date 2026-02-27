import PendingRequestsModal from "../Components/PopupModals/PendingRequestsModal";
import toast from "react-hot-toast";
import { useFriendStore } from "../store/useFriendStore";
import { useState, useEffect } from "react";
import { Loader, Search, Users, X } from "lucide-react";
import { friendActionsMap } from "../utils/friendActionsMap";
import { Link } from "react-router-dom";

/**
 * AddFriendPage
 * -------------------------------------------------
 * Main page for searching users, sending friend requests,
 * and managing pending/accepted/rejected requests.
 */
export default function AddFriendPage() {
    // -----------------------------
    // Store & State Initialization
    // -----------------------------
    const {
        pendingRequests,
        lastSeenPendingAt,
        setLastSeenPending,
        searchUser,
        searchResult: storeSearchResult,
        loading,
        getRequests,
        checkStatus,
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        removeFriends,
        initFriendSocket,
        disconnectFriendSocket
    } = useFriendStore();

    const hasNewPending = pendingRequests.received.some(req => {
        if (!lastSeenPendingAt) return true;
        return new Date(req.createdAt) > new Date(lastSeenPendingAt);
    });

    console.log("New pending request : ", hasNewPending);

    const [username, setUsername] = useState("");    
    const [status, setStatus] = useState("none");
    const [requestType, setRequestType] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ---------------------------------
    // Socket Connection Lifecycle
    // ---------------------------------
    useEffect(() => {
        initFriendSocket();
        getRequests();

        return () => {
            disconnectFriendSocket();
        };
    }, []);

    // ---------------------------------
    // Handle User Search
    // ---------------------------------
    async function handleSearch(e) {
        e.preventDefault();
        if (!username.trim()) return;

        try {
            const user = await searchUser(username);
            if (!user?._id) {
                toast.error("User not found!");
                return;
            }

            // Fetch friendship status with found user
            const statusRes = await checkStatus(user._id);
            console.log(`STATUS RESPONSE : ${JSON.stringify(statusRes, null, 2)}`);

            // Map backend status to UI state
            let mappedStatus = "none";
            let mappedRequestType = null;

            if (statusRes.status === "accepted") {
                mappedStatus = "accepted";
            } else if (statusRes.status === "pending") {
                mappedStatus = "pending";
                mappedRequestType = statusRes.sentBy === "me" ? "sent" : "received";
            } else if (statusRes.status === "rejected") {
                mappedStatus = "none";
            }

            setStatus(mappedStatus);
            setRequestType(mappedRequestType);

        } catch (error) {
            toast.error(error.response?.data?.error || "Search failed!");
        }
    }

    // ---------------------------------
    // Friend Actions Mapping
    // ---------------------------------
    const actionsMap = friendActionsMap({
        sendRequest,
        cancelRequest,
        acceptRequest,
        rejectRequest,
        removeFriends
    });

    // ---------------------------------
    // Handle Friend Actions (Add, Remove, Accept, etc.)
    // ---------------------------------
    async function handleAction(actionType) {
        if (!storeSearchResult?._id) return;
        setActionLoading(true);

        const userId = storeSearchResult._id;
        const action = actionsMap[actionType];

        if (!action) {
            setActionLoading(false);
            return;
        }

        try {
            const res = await action.fn(userId);
            toast.success(action.success);

            const newStatus = action.getNewStatus(res);
            const newRequestType = action.getNewRequestType(res);

            // Update UI status after action
            setStatus(newStatus);
            setRequestType(newRequestType);

        } catch (error) {
            const message = error.response?.data?.error;
            if (message === "Friend request already exists.") {
                setStatus("pending");
                setRequestType("sent");
                toast.error("Friend request already exists!");
            } else {
                toast.error(message || "Something went wrong!");
            }
        } finally {
            setActionLoading(false);
        }
    }

    // ---------------------------------
    // Reset Search Input & Result
    // ---------------------------------
    function handleReset() {
        setUsername("");
        setStatus("none");
        setRequestType(null);
        // Clear search result from store
        useFriendStore.setState({ searchResult: null });
    }

    const handleModeClose = () => {
        setIsModalOpen(true);
        setLastSeenPending();
    }

    // ---------------------------------
    // Render UI
    // ---------------------------------
    return ( 
        <div className="max-w-2xl mx-auto mt-20 px-4">
            {/* -------------------------------
                Page Heading
            -------------------------------- */}
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-wider myfont-kaushan">Add Friends</h1>
                <p className="text-base-content/70 text-xs sm:text-base font-[Poppins]">Search for friends by username and manage requests</p>
            </div>

            {/* -------------------------------
                Pending Requests Modal Button
            -------------------------------- */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={handleModeClose}
                    className="relative btn btn-outline btn-sm btn-secondary font-[Comfortaa] tracking-wide rounded-lg flex items-center gap-2"
                >
                    {hasNewPending && (
                        <div className="indicator absolute top-0 right-0">
                            <span className="indicator-item badge badge-primary w-10 h-5 text-xs myfont-kaushan font-light">New</span>
                        </div>
                    )}
                    <Users size={15} /> Pending Requests
                </button>
                <PendingRequestsModal 
                    pendingRequests={pendingRequests}
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </div>

            {/* -------------------------------
                Search Form
            -------------------------------- */}
            <form onSubmit={handleSearch} className="flex gap-2 items-center">
                <label className="input input-bordered flex items-center gap-2 flex-1 rounded-xl">
                    {username.length > 0 ? (
                        <button type="button" onClick={handleReset}>
                            <X size={20} className="opacity-70 hover:opacity-100 cursor-pointer" />
                        </button>
                    ) : (
                        <Users size={20} className="opacity-70" />
                    )}                    
                    <input
                        type="text"
                        placeholder="Search by username..."
                        className="grow pl-2"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>                
                <button 
                    type="submit"
                    className="btn btn-primary rounded-xl flex items-center gap-1 myfont-AU-NSW tracking-wider"
                    disabled={loading}
                >
                    {loading ? <Loader size={16} className="animate-spin" /> : <Search size={18} />} Search
                </button>
            </form>            

            {/* -------------------------------
                Search Result Card
            -------------------------------- */}
            {storeSearchResult && (
                <div className="card bg-base-100 shadow-xl mt-6 border rounded-2xl transition hover:shadow-lg">
                    <div className="card-body flex-row items-center justify-between gap-4">
                        {/* User Info & Avatar */}
                        <div className="flex items-center gap-4">
                            <div className="avatar">
                                <div className="w-16 h-16 rounded-full ring ring-offset-base-100 ring-offset-2">
                                    <img src={storeSearchResult.profilePic || "/avatar.png"} alt={storeSearchResult.username} />
                                </div>
                            </div>
                            <div>
                                <Link to={`/users/${storeSearchResult._id}`} className="card-title">{storeSearchResult.username}</Link>
                                <p className="text-sm text-base-content/70">{storeSearchResult.fullName}</p>
                            </div>
                        </div>

                        {/* ---------------------------------
                            Action Buttons (Dynamic)
                        ---------------------------------- */}
                        <div className="flex flex-wrap gap-2">
                            {/* Already Friends */}
                            {status === "accepted" && (
                                <>
                                    <button className="btn btn-success btn-sm rounded-xl" disabled>Friends</button>
                                    <button className="btn btn-error btn-sm rounded-xl" disabled={actionLoading} onClick={() => handleAction("remove")}>
                                        {actionLoading ? <Loader size={16} className="animate-spin" /> : "Remove"}
                                    </button>
                                </>
                            )}

                            {/* Pending Request Sent */}
                            {status === "pending" && requestType === "sent" && (
                                <>
                                    <button className="btn btn-warning btn-sm rounded-xl" disabled>Pending</button>
                                    <button className="btn btn-error btn-sm rounded-xl" disabled={actionLoading} onClick={() => handleAction("cancel")}>
                                        {actionLoading ? <Loader size={16} className="animate-spin" /> : "Cancel"}
                                    </button>
                                </>
                            )}

                            {/* Pending Request Received */}
                            {status === "pending" && requestType === "received" && (
                                <>
                                    <button className="btn btn-success btn-sm rounded-xl" disabled={actionLoading} onClick={() => handleAction("accept")}>
                                        {actionLoading ? <Loader size={16} className="animate-spin" /> : "Accept"}
                                    </button>
                                    <button className="btn btn-error btn-sm rounded-xl" disabled={actionLoading} onClick={() => handleAction("reject")}>
                                        {actionLoading ? <Loader size={16} className="animate-spin" /> : "Reject"}
                                    </button>
                                </>
                            )}

                            {/* No Request Yet */}
                            {status === "none" && (
                                <button className="btn btn-primary btn-sm rounded-xl" disabled={actionLoading} onClick={() => handleAction("add")}>
                                    {actionLoading ? <Loader size={16} className="animate-spin" /> : "Add Friend"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}