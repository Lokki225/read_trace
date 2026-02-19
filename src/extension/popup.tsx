import React, { useEffect, useState } from 'react';

interface PopupState {
  isOnline: boolean;
  lastUpdate: string | null;
  seriesTitle: string | null;
  chapterNumber: number | null;
  scrollPosition: number;
  isSyncing: boolean;
  syncError: string | null;
}

export default function Popup() {
  const [state, setState] = useState<PopupState>({
    isOnline: true,
    lastUpdate: null,
    seriesTitle: null,
    chapterNumber: null,
    scrollPosition: 0,
    isSyncing: false,
    syncError: null,
  });

  useEffect(() => {
    const updateState = () => {
      chrome.runtime.sendMessage(
        { type: 'GET_POPUP_STATE' },
        (response: PopupState) => {
          if (response) {
            setState(response);
          }
        }
      );
    };

    updateState();
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setState((prev) => ({ ...prev, isSyncing: true }));
    chrome.runtime.sendMessage(
      { type: 'MANUAL_SYNC' },
      (response: { success: boolean; error?: string }) => {
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          syncError: response.error || null,
        }));
      }
    );
  };

  const handleOpenDashboard = () => {
    (chrome as any).tabs.create({ url: 'http://localhost:3000/dashboard' });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>📖 ReadTrace</div>
        <div
          style={{
            ...styles.statusBadge,
            backgroundColor: state.isOnline ? '#10b981' : '#ef4444',
          }}
        >
          {state.isOnline ? '🟢 Online' : '🔴 Offline'}
        </div>
      </div>

      {/* Current Reading */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Currently Reading</div>
        {state.seriesTitle ? (
          <div style={styles.readingInfo}>
            <div style={styles.seriesTitle}>{state.seriesTitle}</div>
            <div style={styles.chapterInfo}>
              Chapter {state.chapterNumber}
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${state.scrollPosition}%`,
                }}
              />
            </div>
            <div style={styles.progressText}>
              {Math.round(state.scrollPosition)}% scrolled
            </div>
          </div>
        ) : (
          <div style={styles.emptyState}>
            No reading progress detected.
            <br />
            Open a manga/webtoon page to start tracking.
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Sync Status</div>
        {state.isSyncing ? (
          <div style={styles.syncStatus}>
            <span style={styles.spinner}>⟳</span> Syncing...
          </div>
        ) : state.syncError ? (
          <div style={styles.syncError}>
            ⚠️ Sync failed: {state.syncError}
          </div>
        ) : state.lastUpdate ? (
          <div style={styles.syncSuccess}>
            ✓ Last synced: {state.lastUpdate}
          </div>
        ) : (
          <div style={styles.syncPending}>
            ◐ Waiting for first sync...
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button
          style={{
            ...styles.button,
            ...styles.primaryButton,
            opacity: state.isSyncing ? 0.6 : 1,
          }}
          onClick={handleSync}
          disabled={state.isSyncing}
        >
          {state.isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
        <button
          style={{
            ...styles.button,
            ...styles.secondaryButton,
          }}
          onClick={handleOpenDashboard}
        >
          Dashboard
        </button>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerText}>
          Tracking: MangaDex, Webtoon
        </div>
        <div style={styles.footerText}>
          v1.0.0
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '380px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    padding: '0',
    margin: '0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  logo: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ff7a45',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  readingInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  seriesTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chapterInfo: {
    fontSize: '14px',
    color: '#6b7280',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff7a45',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'right',
  },
  emptyState: {
    fontSize: '13px',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '20px 0',
    lineHeight: '1.5',
  },
  syncStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#3b82f6',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
    fontSize: '16px',
  },
  syncError: {
    fontSize: '13px',
    color: '#ef4444',
    padding: '8px',
    backgroundColor: '#fee2e2',
    borderRadius: '4px',
  },
  syncSuccess: {
    fontSize: '13px',
    color: '#10b981',
    padding: '8px',
    backgroundColor: '#ecfdf5',
    borderRadius: '4px',
  },
  syncPending: {
    fontSize: '13px',
    color: '#f59e0b',
    padding: '8px',
    backgroundColor: '#fffbeb',
    borderRadius: '4px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  button: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#ff7a45',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    border: '1px solid #d1d5db',
  },
  footer: {
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    fontSize: '11px',
    color: '#9ca3af',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    margin: '0',
  },
};
