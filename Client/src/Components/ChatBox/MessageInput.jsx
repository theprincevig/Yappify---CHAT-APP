import { useEffect, useState, useRef } from "react";
import { useMessageStore } from "../../store/useMessageStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { Images, SendHorizonal, X } from "lucide-react";
import toast from "react-hot-toast";

/**
 * MessageInput Component
 * --------------------------------------------------
 * Handles message composition, media upload, reply preview,
 * and typing indicator for chat conversations.
 */
export default function MessageInput({ selectedUser }) {
  // -------------------- State --------------------
  // Message text
  const [content, setContent] = useState("");
  // Selected media file
  const [media, setMedia] = useState(null);
  // Media preview URL
  const [mediaPreview, setMediaPreview] = useState(null);

  // -------------------- Stores --------------------
  const { sendMessage, currentChatId, replyingTo, clearReplyingTo } = useMessageStore();
  const { authUser, connectedSocket } = useAuthStore();
  const { theme } = useThemeStore();

  // -------------------- Typing Timeout Ref --------------------
  const typingTimeoutRef = useRef(null);

  // -------------------- Media Preview Effect --------------------
  // Generates image preview when a media file is selected
  useEffect(() => {
    if (!media) {
      setMediaPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setMediaPreview(e.target.result);
    reader.readAsDataURL(media);
    return () => reader.abort();
  }, [media]);

  // -------------------- Send Message Handler --------------------
  async function handleSend() {
    // Prevent sending empty messages
    if (!content.trim() && !media) {
      toast.error("Cannot send empty message!");
      return;
    }
    try {
      await sendMessage(content, media, selectedUser?._id, replyingTo?._id);
      setContent("");
      setMedia(null);
      setMediaPreview(null);
      clearReplyingTo();

      // Emit stopTyping event after sending
      if (connectedSocket && selectedUser) {
        connectedSocket.emit("stopTyping", {
          chatId: currentChatId,
          senderId: authUser._id,
          receiverId: selectedUser._id,
        });
      }
    } catch (error) {
      console.error(`ERROR : ${error}`);
    }
  }

  // -------------------- Typing Indicator Handler --------------------
  function handleTyping(e) {
    setContent(e.target.value);

    // Only emit typing events if all required data is present
    if (!connectedSocket || !selectedUser || !currentChatId) return;

    // Emit typing event
    connectedSocket.emit("typing", {
      chatId: currentChatId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });

    // Reset typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Emit stopTyping after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      connectedSocket.emit("stopTyping", {
        chatId: currentChatId,
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    }, 2000);
  }

  // -------------------- Render --------------------
  return (
    <div
      className={`
        flex flex-col gap-2 p-3 backdrop-blur-md border-t 
        ${theme === "dark" ? "border-white/20" : "border-black/20"} rounded-t-2xl shadow-lg
      `}
    >
      {/* ----------- Media Preview Section ----------- */}
      {mediaPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={mediaPreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              type="button"
              onClick={() => {
                setMedia(null);
                setMediaPreview(null);
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center cursor-pointer"
            >
              <X size={16} className="opacity-80 hover:opacity-100 duration-100" />
            </button>
          </div>
        </div>
      )}

      {/* ----------- Reply Preview Section ----------- */}
      {replyingTo && (
        <div
          className={`
            flex justify-between items-center 
            ${theme === "dark" ? "bg-white/20 border-white/30" : "bg-black/20 border-black/30"} 
            backdrop-blur-sm border rounded-lg px-3 py-2 mb-1
          `}
        >
          <span
            className={`
              text-sm font-semibold 
              ${theme === "dark" ? "text-white" : "text-black"} truncate max-w-[80%]
            `}
          >
            {replyingTo.deleted
              ? "This message was deleted..."
              : replyingTo.content || (replyingTo.media ? "Image/Media" : "")}
          </span>
          <button
            onClick={clearReplyingTo}
            className={`
                p-1 rounded-full 
                ${theme === "dark" ? "hover:bg-white/30" : "hover:bg-black/30"} 
                transition
              `}
          >
            <X
              size={16}
              className={`
                  opacity-70 ${theme === "dark" ? "text-white" : "text-black"} 
                  hover:opacity-100
                `}
            />
          </button>
        </div>
      )}

      {/* ----------- Input Row Section ----------- */}
      <div className="flex items-center gap-2">
        {/* --- Media Upload Button --- */}
        <label
          className={`
            p-2 rounded-full 
            ${theme === "dark" ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-black/5 text-black/40 hover:text-black"} 
            cursor-pointer duration-250
          `}
        >
          <Images size={20} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setMedia(e.target.files[0])}
          />
        </label>

        {/* --- Text Input Field --- */}
        <input
          type="text"
          placeholder="Type a message..."
          value={content}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className={`
            flex-1 bg-black/40 backdrop-blur-sm border-transparent rounded-full px-4 py-3 text-white placeholder-white/60 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:ring-opacity-40 outline-none transition
          `}
        />

        {/* --- Send Button --- */}
        <button
          onClick={handleSend}
          className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
}
