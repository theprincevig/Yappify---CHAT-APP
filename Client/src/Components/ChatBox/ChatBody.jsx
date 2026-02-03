// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Imports: React, Stores, Utils, Icons, Components                          ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useMessageStore } from "../../store/useMessageStore";
import { formateMessageTime } from "../../lib/helper.js";
import { Reply } from "lucide-react";
import MessageActionModal from "../PopupModals/MessageActionModal";
import MessageReactions from "../Messages/MessageReactions";
import TypingBubble from "../Messages/TypingBubble";
import ScrollToBottomButton from "../Messages/ScrollToBottomButton";
import ForwardModal from "../PopupModals/ForwardModal";

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ ChatBody: Main Chat Message List Component                                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
export default function ChatBody({ messages, selectedUser, currentChatId }) {
    // ────────────────────────────────────────────────────────────────────────
    // Auth & Message Store Hooks
    // ────────────────────────────────────────────────────────────────────────
    const { authUser } = useAuthStore();
    const { typingUser, readStatus, setReplyingTo } = useMessageStore();

    // ────────────────────────────────────────────────────────────────────────
    // Refs: For Scrolling & Long-Press Detection
    // ────────────────────────────────────────────────────────────────────────
    const bottomRef = useRef(null);
    const containerRef = useRef(null);
    const pressTimerRef = useRef(null);

    // ────────────────────────────────────────────────────────────────────────
    // Local State: UI Controls
    // ────────────────────────────────────────────────────────────────────────
    const [showScrollButton, setShowScrollButton] = useState(false); // Show "scroll to bottom" button
    const [forwardingMessageId, setForwardingMessageId] = useState(null); // Forward modal control
    const [selectedMessageId, setSelectedMessageId] = useState(null); // Message action menu control

    // ────────────────────────────────────────────────────────────────────────
    // Close Action Modal When Clicking Outside Message Bubble
    // ────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        function handleClickOutside(e) {
            if (!e.target.closest(".chat-bubble")) {
                setSelectedMessageId(null);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // ────────────────────────────────────────────────────────────────────────
    // Auto-Scroll To Bottom On New Message Or Typing (Unless Scrolled Up)
    // ────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!showScrollButton) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length, typingUser]);

    // ────────────────────────────────────────────────────────────────────────
    // Mark Incoming Messages As "Read"
    // ────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!messages.length || !currentChatId) return;

        const unreadFromOther = messages.filter((msg) => {
            const isOwn = msg.sender._id === authUser._id;
            const alreadyRead = (msg.readBy || []).some((r) =>
                (typeof r === "string" ? r : r?._id?.toString?.()) === authUser._id
            );
            return !isOwn && !alreadyRead;
        });

        if (unreadFromOther.length > 0) {
            readStatus(currentChatId);
        }
    }, [messages, currentChatId, authUser._id, markMessagesAsRead]);

    // ────────────────────────────────────────────────────────────────────────
    // Scroll Handler: Show Floating Button When Away From Bottom
    // ────────────────────────────────────────────────────────────────────────
    function handleScroll() {
        if (!containerRef.current) return;
        const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Force Scroll To Bottom
    // ────────────────────────────────────────────────────────────────────────
    function scrollToBottom() {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Long-Press Handling (Mobile): Open Message Menu
    // ────────────────────────────────────────────────────────────────────────
    function handleTouchStart(msgId) {
        pressTimerRef.current = setTimeout(() => {
            setSelectedMessageId(msgId);
        }, 500); // 0.5s hold
    }
    function handleTouchEnd() {
        clearTimeout(pressTimerRef.current);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Desktop Right-Click Or Mobile Hold: Open Message Menu
    // ────────────────────────────────────────────────────────────────────────
    function openMessageMenu(msgId) {
        setSelectedMessageId(msgId);
    }

    // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    // ┃ Render: Chat Messages, Typing, Modals, Scroll Button                  ┃
    // ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    return (
        <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3 relative"
        >
            {/* ──────────────── Chat Messages List ──────────────── */}
            {messages.map((msg, index) => {
                const isOwnMessage = msg.sender._id === authUser._id;
                const isLastMessage = index === messages.length - 1;

                // Normalize read receipts
                const readers = (msg.readBy || [])
                    .map(r => (typeof r === "string" ? r : r?._id?.toString?.()))
                    .filter(rid => rid && rid !== authUser._id);

                const messageStatus = isOwnMessage
                    ? readers.length > 0 ? "Seen" : "Sent"
                    : "";

                return (
                    <div
                        key={msg._id}
                        className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
                    >
                        {/* Avatar */}
                        <div className="chat-image avatar">
                            <div className="w-10 h-10 rounded-full">
                                <img
                                    src={
                                        isOwnMessage
                                            ? authUser.profilePic || "/avatar.png"
                                            : selectedUser.profilePic || "/avatar.png"
                                    }
                                    alt="avatar"
                                />
                            </div>
                        </div>

                        {/* (Optional) Chat Header: Username/Time */}
                        {/* <div className="chat-header mb-1 flex items-center" /> */}

                        <div className={`flex items-center gap-4 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                            {/* ──────────────── Message Bubble ──────────────── */}
                            <div 
                                className="chat-bubble flex flex-col relative group"
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    openMessageMenu(msg._id);
                                }}
                                onTouchStart={() => handleTouchStart(msg._id)}
                                onTouchEnd={handleTouchEnd}
                            >
                                {/* Reply Preview */}
                                {msg.replyTo && (
                                    <div className="p-1 mb-1 text-xs text-gray-600 border-l-2 border-gray-300 pl-2 rounded">                                        
                                        <div className="truncate">
                                            {msg.replyTo.deleted
                                                ? "This message was deleted..."
                                                : msg.replyTo.content || (msg.replyTo.media ? "Image/Media" : "")
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Forwarded Indicator */}
                                {msg.forwardedFrom && (
                                    <div className="p-1 mb-1 text-xs font-light myfont-AU-NSW text-gray-500">
                                        Forwarded
                                    </div>
                                )}

                                {/* Media (Image/File) */}
                                {msg.media && (
                                    <img
                                        src={msg.media}
                                        alt="attachment"
                                        className="sm:max-w-[200px] rounded-md mb-2"
                                    />
                                )}

                                {/* Text Content */}
                                <p 
                                    className={`
                                        ${msg.deleted ? "font-light myfont-AU-NSW" : "font-semibold font-[Poppins]"} 
                                        ${isOwnMessage ? "text-left" : "text-right"}
                                        pointer-events-none select-none
                                    `}
                                >
                                    {msg.content}
                                </p>                                

                                {/* Timestamp */}
                                <time
                                    className={`text-[10px] mt-1 opacity-50 pointer-events-none select-none ${
                                        isOwnMessage ? "self-end text-right" : "self-start text-left"
                                    }`}
                                >
                                    {formateMessageTime(msg.createdAt)}
                                </time>

                                {/* Reactions */}
                                <MessageReactions message={msg} isOwnMessage={isOwnMessage} />

                                {/* Action Modal (If Selected) */}
                                {selectedMessageId === msg._id && (
                                    <MessageActionModal
                                        message={msg}
                                        isOwnMessage={isOwnMessage}
                                        isLastMessage={isLastMessage}
                                        onForwardClick={() => setForwardingMessageId(msg._id)}
                                    />
                                )}
                            </div>

                            {/* ↩️ Reply Button */}
                            <button
                                onClick={() => setReplyingTo(msg)}
                                className="opacity-50 hover:opacity-100 transition duration-200 cursor-pointer"
                            >
                                <Reply size={18} />
                            </button>
                        </div>

                        {/* Status For Own Messages (Sent / Seen) */}
                        {isOwnMessage && (
                            <div className="chat-footer opacity-50 text-xs">
                                {messageStatus}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* ──────────────── Typing Indicator ──────────────── */}
            {typingUser && typingUser.senderId !== authUser._id && (
                <TypingBubble typingUser={typingUser} />
            )}

            {/* ──────────────── Scroll Anchor ──────────────── */}
            <div ref={bottomRef} />

            {/* ──────────────── Floating "Scroll To Bottom" Button ──────────────── */}
            {showScrollButton && (
                <ScrollToBottomButton onClick={scrollToBottom} />
            )}

            {/* ──────────────── Forward Modal ──────────────── */}
            {forwardingMessageId && (
                <ForwardModal 
                    messageId={forwardingMessageId} 
                    onClose={() => setForwardingMessageId(null)} 
                />
            )}
        </div>
    );
}
