// Content script that runs on localhost:3000/dashboard
// Extracts user_id from the page and sends it to the background service worker

async function extractAndSendUserId() {
  try {
    // Try to get user_id from the API (this runs in the page context, so cookies work)
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await response.json();
    
    if (data.userId) {
      // Send to background service worker
      chrome.runtime.sendMessage({
        type: 'SET_USER_ID',
        payload: { userId: data.userId }
      });
    }
  } catch (err) {
    console.error('[ReadTrace] Failed to extract user_id:', err);
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', extractAndSendUserId);
} else {
  extractAndSendUserId();
}
