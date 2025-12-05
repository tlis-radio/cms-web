"use client";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const SESSION_STORAGE_KEY = "tlis_embed_session_id";

/**
 * Component that initializes session ID in localStorage for embed widgets.
 * This avoids cookie issues in cross-origin iframes.
 */
export default function EmbedSessionInit() {
  useEffect(() => {
    // Get or create session ID in localStorage
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
  }, []);

  return null;
}

/**
 * Gets the embed session ID from localStorage.
 * Returns null if not initialized yet.
 */
export function getEmbedSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}
