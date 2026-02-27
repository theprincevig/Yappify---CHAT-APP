//╔═══════════════════════════════════════╗
//║    ForwardButton Component            ║
//║    Lets users share messages around!  ║
//╚═══════════════════════════════════════╝

import { Send } from "lucide-react";

export default function ForwardButton({ onClick }) {
  return (
    <>
      {/* 
        Interactive Forward Button
        - Styled with Comfortaa font
        - Smooth hover animation
        - Triggers forwarding action on click 
      */}
      <button
        onClick={onClick}
        className="w-full flex items-center justify-around font-[Comfortaa] opacity-80 hover:opacity-100 duration-150 cursor-pointer"
      >
        {/* Button Text */}
        Forward

        {/* 
          Forward Icon
          Using Lucide's Send icon at 16px 
        */}
        <Send size={16} />
      </button>
    </>
  );
}
