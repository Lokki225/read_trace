"use strict";
function initPopup() {
  const root = document.getElementById("root");
  if (!root) return;
  const initialState = {
    isOnline: true,
    lastUpdate: null,
    seriesTitle: null,
    chapterNumber: null,
    scrollPosition: 0,
    isSyncing: false,
    syncError: null
  };
  function render(rootElement, state) {
    rootElement.innerHTML = `
      <div style="width: 380px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #1f2937; padding: 0; margin: 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
          <div style="font-size: 18px; font-weight: 700; color: #ff7a45;">\u{1F4D6} ReadTrace</div>
          <div style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #ffffff; background: ${state.isOnline ? "#10b981" : "#ef4444"};">
            ${state.isOnline ? "\u{1F7E2} Online" : "\u{1F534} Offline"}
          </div>
        </div>

        <!-- Currently Reading -->
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Currently Reading</div>
          ${state.seriesTitle ? `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 16px; font-weight: 600; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${state.seriesTitle}</div>
              <div style="font-size: 14px; color: #6b7280;">Chapter ${state.chapterNumber}</div>
              <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; background: #ff7a45; width: ${state.scrollPosition}%; transition: width 0.3s ease;"></div>
              </div>
              <div style="font-size: 12px; color: #9ca3af; text-align: right;">${Math.round(state.scrollPosition)}% scrolled</div>
            </div>
          ` : `
            <div style="font-size: 13px; color: #9ca3af; text-align: center; padding: 20px 0; line-height: 1.5;">
              No reading progress detected.<br/>Open a manga/webtoon page to start tracking.
            </div>
          `}
        </div>

        <!-- Sync Status -->
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Sync Status</div>
          ${state.isSyncing ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #3b82f6;">
              <span style="display: inline-block; animation: spin 1s linear infinite; font-size: 16px;">\u27F3</span> Syncing...
            </div>
          ` : state.syncError ? `
            <div style="font-size: 13px; color: #ef4444; padding: 8px; background: #fee2e2; border-radius: 4px;">
              \u26A0\uFE0F Sync failed: ${state.syncError}
            </div>
          ` : state.lastUpdate ? `
            <div style="font-size: 13px; color: #10b981; padding: 8px; background: #ecfdf5; border-radius: 4px;">
              \u2713 Last synced: ${state.lastUpdate}
            </div>
          ` : `
            <div style="font-size: 13px; color: #f59e0b; padding: 8px; background: #fffbeb; border-radius: 4px;">
              \u25D0 Waiting for first sync...
            </div>
          `}
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 8px; padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <button id="syncBtn" style="flex: 1; padding: 10px 12px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; background: #ff7a45; color: #ffffff; transition: all 0.2s ease; opacity: ${state.isSyncing ? 0.6 : 1};" ${state.isSyncing ? "disabled" : ""}>
            ${state.isSyncing ? "Syncing..." : "Sync Now"}
          </button>
          <button id="dashboardBtn" style="flex: 1; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; background: #f3f4f6; color: #1f2937; transition: all 0.2s ease;">
            Dashboard
          </button>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 16px; background: #f9fafb; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; align-items: center;">
          <div>Tracking: MangaDex, Webtoon</div>
          <div>v1.0.0</div>
        </div>
      </div>

      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    const syncBtn = document.getElementById("syncBtn");
    const dashboardBtn = document.getElementById("dashboardBtn");
    if (syncBtn) {
      syncBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage(
          { type: "MANUAL_SYNC" },
          (response) => {
            if (chrome.runtime.lastError) {
              const newState2 = {
                ...state,
                isSyncing: false,
                syncError: chrome.runtime.lastError.message ?? "Unable to reach background script."
              };
              render(rootElement, newState2);
              return;
            }
            const newState = {
              ...state,
              isSyncing: false,
              syncError: (response == null ? void 0 : response.error) ?? null
            };
            render(rootElement, newState);
          }
        );
      });
    }
    if (dashboardBtn) {
      dashboardBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
      });
    }
  }
  render(root, initialState);
  fetch("http://localhost:3000/api/auth/me", { credentials: "include" }).then((r) => r.json()).then((data) => {
    if (data.userId) {
      chrome.runtime.sendMessage({ type: "SET_USER_ID", payload: { userId: data.userId } });
    }
  }).catch(() => {
  });
  setInterval(() => {
    chrome.runtime.sendMessage(
      { type: "GET_POPUP_STATE" },
      (response) => {
        if (chrome.runtime.lastError) {
          return;
        }
        if (response) {
          render(root, response);
        }
      }
    );
  }, 1e3);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPopup);
} else {
  initPopup();
}
