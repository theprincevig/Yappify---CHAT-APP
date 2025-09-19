import { useEffect } from "react";
import { useFriendStore } from "../../store/useFriendStore";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function PendingRequestsModal({ isOpen, onClose }) {
    // Accessing friend-related state and actions from our custom store
    const {
        pendingRequests,
        isLoadingPending,
        getPendingRequests,
        acceptRequest,
        rejectRequest,
        cancelRequest
    } = useFriendStore();

    // 🔄 Fetch pending requests when the modal is opened
    useEffect(() => {
        if (isOpen) {
            getPendingRequests();
        }
    }, [isOpen, getPendingRequests]);

    // 🚀 Handle actions (accept, reject, cancel) for friend requests
    async function handleRequests(id, action) {
        try {
            switch (action) {
                case "accept":
                    await acceptRequest(id);
                    toast.success("Friend request accepted!"); // ✅ Hooray!
                    break;
                case "reject":
                    await rejectRequest(id);
                    toast.success("Friend request rejected!"); // ❌ Ouch!
                    break;
                case "cancel":
                    await cancelRequest(id);
                    toast.success("Friend request canceled!"); // 🛑 Request gone!
                    break;
                default:
                    console.warn("Unknown action:", action);
                    return;
            }
            await getPendingRequests(); // 🔄 Refresh the list after the action
        } catch (error) {
            // ⚠️ Display an error message if something goes wrong
            toast.error(
                error.response?.data?.error || "Failed to process request"
            );
        }
    }

    // 🚪 If the modal is closed, don't render anything
    if (!isOpen) return null;

    return (
        // The backdrop with a blur effect
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
            {/* Modal Container */}
            <div className="bg-black/60 rounded-2xl shadow-lg w-full max-w-lg p-6">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold opacity-70">
                        Pending Requests
                    </h2>
                    {/* Close button */}
                    <button
                        className="opacity-50 hover:opacity-100 duration-200 cursor-pointer"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conditional Content: Loading state or the actual content */}
                {isLoadingPending ? (
                    // ⏳ Loading state display
                    <div className="flex justify-center py-8">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : (
                    // Content: Received and Sent Requests
                    <div className="space-y-8">
                        {/* 📥 Received Requests Section */}
                        <div>
                            <h3 className="font-semibold mb-3 font-[Comfortaa]">
                                Received
                            </h3>
                            {pendingRequests.received?.length > 0 ? (
                                // Mapping through each received request
                                <div className="space-y-3">
                                    {pendingRequests.received.map((req) => (
                                        <div
                                            key={req._id}
                                            className="flex items-center justify-between bg-transparent p-3 rounded-lg border border-zinc-600"
                                        >
                                            {/* Sender Info */}
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        req.sender.profilePic ||
                                                        "/avatar.png"
                                                    }
                                                    alt={req.sender.username}
                                                    className="size-10 rounded-box"
                                                />
                                                <div>
                                                    <p className="text-lg">
                                                        @{req.sender.username}
                                                    </p>
                                                    <p className="text-xs ml-2 uppercase font-semibold opacity-60">
                                                        {req.sender.fullName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() =>
                                                        handleRequests(
                                                            req.sender._id,
                                                            "accept"
                                                        )
                                                    }
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-error"
                                                    onClick={() =>
                                                        handleRequests(
                                                            req.sender._id,
                                                            "reject"
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Displayed when there are no received requests
                                <p className="text-sm text-center text-gray-500 font-[Poppins]">
                                    No received requests.
                                </p>
                            )}
                        </div>

                        {/* Visual divider */}
                        <div className="divider"></div>

                        {/* 📤 Sent Requests Section */}
                        <div>
                            <h3 className="font-semibold mb-3 font-[Comfortaa]">
                                Sent
                            </h3>
                            {pendingRequests.sent?.length > 0 ? (
                                // Mapping through each sent request
                                <div className="space-y-3">
                                    {pendingRequests.sent.map((req) => (
                                        <div
                                            key={req._id}
                                            className="flex items-center justify-between bg-transparent p-3 rounded-lg border border-zinc-600"
                                        >
                                            {/* Receiver Info */}
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        req.receiver.profilePic ||
                                                        "/avatar.png"
                                                    }
                                                    alt={req.receiver.username}
                                                    className="size-10 rounded-box"
                                                />
                                                <div>
                                                    <p className="text-lg">
                                                        @{req.receiver.username}
                                                    </p>
                                                    <p className="text-xs ml-2 uppercase font-semibold opacity-60">
                                                        {req.receiver.fullName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                {/* Disabled button indicating the request is pending */}
                                                <button className="btn btn-sm btn-disabled">
                                                    Pending
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() =>
                                                        handleRequests(
                                                            req.receiver._id,
                                                            "cancel"
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Displayed when there are no sent requests
                                <p className="text-sm text-center text-gray-500 font-[Poppins]">
                                    No sent requests.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
