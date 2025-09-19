import { MessageSquare } from "lucide-react";

/**
 * NoChatSelected Component
 * --------------------------------------------------
 * Displayed when no chat is selected.
 * Shows a friendly welcome, a bouncing chat icon,
 * and a helpful hint to guide the user.
 */
export default function NoChatSelected() {
    return (
        <div className="hidden md:flex flex-1 p-8 bg-base-200">
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">

                {/* -------------------------------------------
                     Floating Chat Icon (Animated & Centered)
                -------------------------------------------- */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
                        <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                </div>

                {/* -------------------------------------------
                     Friendly Welcome Message
                -------------------------------------------- */}
                <h2 className="text-3xl font-bold myfont-kaushan tracking-wider">
                    Welcome to Yappify!
                </h2>

                {/* -------------------------------------------
                     User Guidance Hint
                -------------------------------------------- */}
                <p className="text-sm text-base-content/60 font-[Comfortaa]">
                    Select a conversation from the sidebar to start chatting.
                </p>
            </div>
        </div>
    );
}
