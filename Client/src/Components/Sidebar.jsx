import SidebarLoader from "./LoaderEffects/SidebarLoader";
import UnreadCounts from "./UnreadCounts";

import { useEffect } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";

/* --------------------------------------------------------------------------
    🟦 SIDEBAR COMPONENT
    -------------------------------------------------------------------------- */

export default function Sidebar() {
  // ------------------------------------------------------------------------
  // 🗂️ STATE & STORE HOOKS
  // ------------------------------------------------------------------------
  const {
     users,
     loading,
     getUsersForSidebar,
     setCurrentChat,
     selectedUser,
     setUsers,
     unreadCounts,
     getUnreadCounts,
     resetUnreadCount,
  } = useMessageStore();

  const { initFriendSocket, disconnectFriendSocket } = useFriendStore();
  const { authUser, isCheckingAuth, onlineUsers } = useAuthStore();

  // ------------------------------------------------------------------------
  // 🚀 FETCH USERS & UNREAD COUNTS ON LOGIN
  // ------------------------------------------------------------------------
  useEffect(() => {
     if (!isCheckingAuth && authUser?._id) {
        getUsersForSidebar();
        getUnreadCounts();
     } else {
        // 🔄 Reset sidebar if logged out
        setUsers([]);
     }
  }, [isCheckingAuth, authUser]);

  // ------------------------------------------------------------------------
  // 🔌 SOCKET: FRIEND UPDATES IN REAL-TIME
  // ------------------------------------------------------------------------
  useEffect(() => {
     initFriendSocket();

     const { connectedSocket: socket } = useFriendStore.getState();
     if (!socket) return;

     // ➕ Add friend to sidebar when request is accepted
     const handleFriendAdded = ({ friend }) => {
        setUsers((prev) => {
          if (!prev.find((u) => u._id === friend._id)) {
             return [...prev, { ...friend, chatId: friend.chatId || friend._id }];
          }
          return prev;
        });
     };

     // ➖ Remove friend from sidebar if unfriended
     const handleFriendRemoved = ({ userId }) => {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
     };

     socket.on("friendRequestAccepted", handleFriendAdded);
     socket.on("friendRemoved", handleFriendRemoved);

     // 🧹 Cleanup listeners & disconnect socket
     return () => {
        socket.off("friendRequestAccepted", handleFriendAdded);
        socket.off("friendRemoved", handleFriendRemoved);
        disconnectFriendSocket();
     };
  }, [initFriendSocket, disconnectFriendSocket, setUsers]);

  // ------------------------------------------------------------------------
  // 📲 HANDLE CHAT SELECTION (RESPONSIVE)
  // ------------------------------------------------------------------------
  function handleResponsiveness(user) {
     const chatId = user.chatId || null;
     setCurrentChat(chatId, user);

     if (chatId) {
        resetUnreadCount(chatId);
     }
  }

  // ------------------------------------------------------------------------
  // 🖥️ SIDEBAR UI
  // ------------------------------------------------------------------------
  return (
     <div className="w-full md:w-1/3 bg-base-200 p-3 border-base-300 border-r-2 overflow-y-auto">
        {/* 🏷️ Sidebar Title */}
        <h2 className="text-3xl font-bold mb-3 tracking-wider myfont-kaushan">
          Chats
        </h2>

        {/* ⏳ Loader State */}
        {loading ? (
          <SidebarLoader type="list" />
        ) : users.length === 0 ? (
          // 🚫 No Friends Placeholder
          <div className="flex flex-col gap-2 items-center justify-center h-1/2">
             <h1 className="text-4xl text-gray-600 font-[Poppins]">
                No Friends yet!
             </h1>
             <p className="text-sm text-gray-400 font-[Comfortaa] tracking-wide">
                Start making friends by clicking 'Add Friends'.
             </p>
          </div>
        ) : (
          // ✅ Friends List
          <ul className="space-y-2">
             {users
                // 🔝 Sort: Online friends first
                .sort(
                  (a, b) =>
                     onlineUsers.includes(b._id) - onlineUsers.includes(a._id)
                )
                .map((user) => (
                  <li key={user._id}>
                     <button
                        onClick={() => handleResponsiveness(user)}
                        className={`flex items-center gap-3 w-full p-2 rounded-lg transition
                          ${
                             selectedUser?._id === user._id
                                ? "bg-primary text-white"
                                : "hover:bg-base-300 cursor-pointer"
                          }`}
                     >
                        {/* 🖼️ Avatar + Online Status Dot */}
                        <div className="relative avatar">
                          <div className="w-10 rounded-full">
                             <img
                                src={user.profilePic || "/avatar.png"}
                                alt={user.username}
                                className="object-cover w-full h-full"
                             />
                             {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-2 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                             )}
                          </div>
                        </div>

                        {/* 👤 Friend Info + 🔔 Unread Count */}
                        <div className="flex-1 flex justify-between items-center">
                          <p className="font-[Poppins]">
                             {user.fullName ? user.fullName : user.username}
                          </p>
                          {user.chatId && unreadCounts[user.chatId] > 0 && (
                             <UnreadCounts user={user} />
                          )}
                        </div>
                     </button>
                  </li>
                ))}
          </ul>
        )}
     </div>
  );
}
