//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE BUTTON COMPONENT
// Adds a sleek delete option that appears only on user's own messages
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Trash2 } from "lucide-react";
import { useMessageStore } from "../../store/useMessageStore";

export default function DeleteButton({ message, isOwnMessage }) {
  //━━━━ Store Connection ━━━━
  // Hook into our message management system
  const { currentChatId, deleteMessage } = useMessageStore();

  //━━━━ Event Handlers ━━━━
  // Zap away the message when delete is clicked
  async function handleDelete() {
    await deleteMessage(currentChatId, message._id);
  }

  //━━━━ Component Render ━━━━
  return (
    <>
      {/* Smart Display: Only visible to message owner */}
      {isOwnMessage && (
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-around font-[Comfortaa] opacity-80 hover:opacity-100 duration-150 cursor-pointer"
        >
          {/* Message removal text */}
          Delete
          {/* Stylish trash can icon */}
          <Trash2 size={16} />
        </button>
      )}
    </>
  );
}
