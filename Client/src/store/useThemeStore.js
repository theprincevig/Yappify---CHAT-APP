import { create } from 'zustand';

// ===============================
// Theme Store for Yappify Chat App
// ===============================
// Handles theme state, persistence, and toggling
// Uses Zustand for global state management
// ===============================

export const useThemeStore = create((set) => ({
    // -------------------------------------------
    // Current theme: loaded from localStorage or defaults to 'light'
    // -------------------------------------------
    theme: localStorage.getItem("chat-theme") || "light",

    // -------------------------------------------
    // Set a new theme
    // - Saves to localStorage
    // - Updates HTML attribute for DaisyUI
    // - Updates Zustand state
    // -------------------------------------------
    setTheme: (theme) => {
        localStorage.setItem("chat-theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
    },

    // -------------------------------------------
    // Toggle between 'light' and 'dark' themes
    // - Saves to localStorage
    // - Updates HTML attribute for DaisyUI
    // - Updates Zustand state
    // -------------------------------------------
    toggleTheme: () => {
        set((state) => {
            const newTheme = state.theme === "light" ? "dark" : "light";
            localStorage.setItem("chat-theme", newTheme);
            document.documentElement.setAttribute("data-theme", newTheme);
            return { theme: newTheme };
        });
    },
}));