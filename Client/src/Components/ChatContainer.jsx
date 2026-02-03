import MessageInput from "./ChatBox/MessageInput";
import ChatBody from "./ChatBox/ChatBody";
import ChatHeader from "./ChatBox/ChatHeader";
import MessageLoader from "./LoaderEffects/MessageLoader";

import { useMessageStore } from "../store/useMessageStore";
import { useEffect } from "react";

/* ===========================
  ChatContainer Component
  =========================== */

export default function ChatContainer() {
  // 🗃️ State & Actions from Store
  const {
   messages,
   getMessages,
   loading,
   selectedUser,
   setSelectedUser,
   currentChatId,
   initializeSocketListeners,
   disconnectSocketListeners
  } = useMessageStore();

  /* ---------------------------------
    Socket Listeners Lifecycle
    --------------------------------- */
  useEffect(() => {
   if (!currentChatId) return;

   // Setup listeners for active chat
   initializeSocketListeners([currentChatId]);
   // Cleanup listeners on unmount
   return () => disconnectSocketListeners();
  }, [currentChatId, initializeSocketListeners, disconnectSocketListeners]);

  /* ---------------------------------
    Fetch Messages on Chat Change
    --------------------------------- */
  useEffect(() => {
   if (selectedUser?._id && currentChatId) {
    getMessages(currentChatId);
   }
  }, [selectedUser?._id, currentChatId, getMessages]);

  /* ---------------------------------
    No User Selected: Hide Chat UI
    --------------------------------- */
  if (!selectedUser) return null;

  /* ---------------------------------
    Chat Window Layout & Sections
    --------------------------------- */
  return (
   <div
    className={`
      fixed top-0 left-0 w-full h-full bg-base-200 flex flex-col
      transition-transform duration-300 ease-in-out
      z-50 md:z-auto
      md:relative md:flex md:flex-1 md:w-auto
      ${selectedUser ? "translate-x-0" : "translate-x-full"}
    `}
   >
    {/* ===========================
       Chat Header (User Info)
       =========================== */}
    <ChatHeader selectedUser={selectedUser} setSelectedUser={setSelectedUser} />

    {/* ===========================
       Chat Body (Messages/List)
       =========================== */}
    {loading ? (
      <div className="flex-1 flex flex-col overflow-auto">
       <MessageLoader />
      </div>
    ) : (
      <ChatBody
       messages={messages}
       selectedUser={selectedUser}
       currentChatId={currentChatId}
      />
    )}

    {/* ===========================
       Message Input (Composer)
       =========================== */}
    <MessageInput selectedUser={selectedUser} />
   </div>
  );
}
