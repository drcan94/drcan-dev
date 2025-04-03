"use client";

import { useEffect } from "react";

// This component only adds client-side behavior and doesn't render anything
export function ClientHashLinks() {
  useEffect(() => {
    // Function to handle click events on anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');

      if (anchor) {
        e.preventDefault();
        const hashId = anchor.getAttribute("href");

        if (hashId) {
          const element = document.querySelector(hashId);
          if (element) {
            // Scroll smoothly to the element
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });

            // Update the URL hash without triggering navigation
            window.history.pushState(null, "", hashId);
          }
        }
      }
    };

    // Add the event listener
    document.addEventListener("click", handleAnchorClick);

    // Clean up the event listener
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return null;
}
