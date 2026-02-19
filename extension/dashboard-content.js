"use strict";
(() => {
  // src/extension/dashboard-content.ts
  async function extractAndSendUserId() {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      const data = await response.json();
      if (data.userId) {
        chrome.runtime.sendMessage({
          type: "SET_USER_ID",
          payload: { userId: data.userId }
        });
      }
    } catch (err) {
      console.error("[ReadTrace] Failed to extract user_id:", err);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", extractAndSendUserId);
  } else {
    extractAndSendUserId();
  }
})();
