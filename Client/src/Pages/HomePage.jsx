import NoChatSelected from "../Components/NoChatSelected";
import ChatContainer from "../Components/ChatContainer";
import Sidebar from "../Components/Sidebar";
import { useMessageStore } from "../store/useMessageStore";

/**
 * HomePage Component
 * ------------------
 * Layout:
 * | Sidebar | Chat Area |
 * 
 * - Sidebar: User list & navigation (visible on md+ screens)
 * - Chat Area: Shows either chat or placeholder based on selection
 */
export default function HomePage() {
    const { selectedUser } = useMessageStore();

    return (
        <div className="flex h-screen bg-base-200 pt-15">
            {/* === Sidebar Section ===
                Displays user list and navigation.
                Hidden on small screens, visible on md+.
            */}
            <Sidebar className="w-full md:w-1/3 md:flex hidden" />

            {/* === Chat Area Section ===
                If a user is selected, show chat container.
                Otherwise, show a friendly placeholder.
            */}
            {!selectedUser ? (
                <NoChatSelected className="flex-1 w-full hidden md:flex" />
            ) : (
                <ChatContainer />
            )}
        </div>
    );
}