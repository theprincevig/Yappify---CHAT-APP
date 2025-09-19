/*=======================
  📜 ScrollToBottomButton
========================*/
// A sleek floating button that magically zaps users
// to the latest messages in the chat with a single click!

import { ArrowDown } from "lucide-react";

export default function ScrollToBottomButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        /* Positioning */
        absolute bottom-6 right-5/12 
        
        /* Styling */
        p-3 
        bg-black/40 
        text-white/50 
        rounded-full 
        shadow-lg
        
        /* Hover Effects */
        hover:text-white 
        transition 
        duration-150 
        cursor-pointer
      `}
    >
      {/* ⬇️ Bouncy arrow animation for visual feedback */}
      <ArrowDown size={20} className="animate-bounce-loop" />
    </button>
  );
}
