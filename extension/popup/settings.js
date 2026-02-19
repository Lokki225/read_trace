/**
 * Settings page for ReadTrace extension
 * Allows manual update checking and viewing update history
 */

// Get DOM elements
const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
const checkStatus = document.getElementById('checkStatus');
const currentVersionEl = document.getElementById('currentVersion');
const lastCheckEl = document.getElementById('lastCheck');
const updateHistoryEl = document.getElementById('updateHistory');

/**
 * Format timestamp to readable date string
 */
function formatDate(timestamp) {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Load and display current version
 */
async function loadCurrentVersion() {
  try {
    const manifest = chrome.runtime.getManifest();
    currentVersionEl.textContent = manifest.version || '0.0.0';
  } catch (err) {
    currentVersionEl.textContent = 'Unknown';
  }
}

/**
 * Load and display last update check time
 */
async function loadLastCheckTime() {
  try {
    const result = await chrome.storage.local.get('readtrace_last_update_check');
    const timestamp = result.readtrace_last_update_check;
    lastCheckEl.textContent = formatDate(timestamp);
  } catch (err) {
    lastCheckEl.textContent = 'Unknown';
  }
}

/**
 * Load and display update history
 */
async function loadUpdateHistory() {
  try {
    const result = await chrome.storage.local.get('readtrace_update_log');
    const logs = result.readtrace_update_log || [];

    if (logs.length === 0) {
      updateHistoryEl.innerHTML = '<div class="history-item">No update history</div>';
      return;
    }

    // Show last 10 entries
    const recent = logs.slice(-10).reverse();
    updateHistoryEl.innerHTML = recent
      .map(
        (log) => `
      <div class="history-item">
        <div>${getLogTypeLabel(log.type)} ${log.version || ''}</div>
        <div class="history-time">${formatDate(log.timestamp)}</div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    updateHistoryEl.innerHTML = '<div class="history-item">Error loading history</div>';
  }
}

/**
 * Get human-readable label for log type
 */
function getLogTypeLabel(type) {
  const labels = {
    check: '✓ Checked',
    available: '↓ Update available',
    installed: '✔ Installed',
    failed: '✗ Failed',
    dismissed: '✕ Dismissed'
  };
  return labels[type] || type;
}

/**
 * Show status message
 */
function showStatus(message, type = 'loading') {
  checkStatus.className = `status ${type}`;
  checkStatus.textContent = message;
  if (type === 'loading') {
    checkStatus.innerHTML = `<span class="spinner"></span>${message}`;
  }
}

/**
 * Clear status message
 */
function clearStatus() {
  checkStatus.className = 'status';
  checkStatus.textContent = '';
}

/**
 * Handle check for updates button click
 */
async function handleCheckUpdates() {
  checkUpdatesBtn.disabled = true;
  showStatus('Checking for updates...', 'loading');

  try {
    // Send message to background script to check for updates
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_FOR_UPDATES'
    });

    if (response.success) {
      if (response.isUpdateAvailable) {
        showStatus(`Update available: v${response.latestVersion}`, 'success');
      } else {
        showStatus('You are running the latest version', 'success');
      }
    } else {
      showStatus('Failed to check for updates', 'error');
    }

    // Reload update history
    await new Promise((resolve) => setTimeout(resolve, 500));
    loadLastCheckTime();
    loadUpdateHistory();
  } catch (err) {
    showStatus('Error checking for updates', 'error');
  } finally {
    checkUpdatesBtn.disabled = false;
  }
}

/**
 * Initialize settings page
 */
async function initialize() {
  // Load initial data
  loadCurrentVersion();
  loadLastCheckTime();
  loadUpdateHistory();

  // Setup event listeners
  checkUpdatesBtn.addEventListener('click', handleCheckUpdates);

  // Refresh history every 5 seconds
  setInterval(loadUpdateHistory, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
