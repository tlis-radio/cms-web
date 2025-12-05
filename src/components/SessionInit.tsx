"use client";
import { useEffect } from "react";

/**
 * Component that initializes session cookie on mount.
 * Include this in root layouts to ensure all users get a session.
 */
export default function SessionInit() {
  useEffect(() => {
    // Initialize session cookie
    fetch("/api/session", { credentials: "include" }).catch((err) => {
      console.error("Failed to initialize session:", err);
    });
  }, []);

  return null;
}
