import { useLayoutEffect } from "react";

// Force light theme on public pages (Landing, SolutionDetail, etc.)
// Restores user's theme preference when leaving the page
// Pass enabled=false to skip (e.g., when user is logged in)
export function useForceLightTheme(enabled = true) {
  useLayoutEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");

    return () => {
      // Restore user's theme preference when leaving
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || (wasDark && !savedTheme)) {
        root.classList.add("dark");
      }
    };
  }, [enabled]);
}
