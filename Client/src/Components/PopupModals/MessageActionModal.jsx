import DeleteButton from "../Messages/DeleteButton";
import ForwardButton from "../Messages/ForwardButton";
import MessageReactItems from "../Messages/MessageReactItems";

// MessageActionModal
// Shows actions for a single message → React (emoji), Forward, Delete
export default function MessageActionModal({ message, isOwnMessage, isLastMessage, onForwardClick }) {
    return (
        <div
            className={`
                min-w-50 absolute
                ${isOwnMessage ? "right-8 md:right-20" : "left-8 md:left-20"} 
                ${isLastMessage ? "bottom-10" : "top-10"}
                backdrop-blur-md flex gap-1 bg-black/40 
                rounded-lg shadow p-2 z-1000
            `}
        >
            {/* Container for all action items */}
            <div className="flex flex-col items-center gap-2">
                {/* Emoji Reactions */}
                <MessageReactItems message={message} />

                {/* Forward Message */}
                <ForwardButton onClick={onForwardClick} />

                {/* Delete Message (only for own messages) */}
                <DeleteButton message={message} isOwnMessage={isOwnMessage} />
            </div>
        </div>
    );
}
