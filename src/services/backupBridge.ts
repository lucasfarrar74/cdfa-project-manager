/**
 * Backup Bridge Service for Project Manager
 * Handles backup/restore requests from the CDFA Hub
 */

const STORAGE_KEY = 'cdfa-project-manager-data';
const TOOL_ID = 'project-manager';
const TOOL_NAME = 'Project Manager';

interface BackupData {
  activities: unknown[];
  checklistInstances: unknown[];
  staffMembers: unknown[];
  customActivityTypes: unknown[];
  currentUserId: string | null;
  theme: string | null;
}

/**
 * Export all Project Manager data
 */
function exportData(): BackupData {
  let data: Partial<BackupData> = {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      data = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to read storage for backup:', e);
  }

  return {
    activities: data.activities || [],
    checklistInstances: data.checklistInstances || [],
    staffMembers: data.staffMembers || [],
    customActivityTypes: data.customActivityTypes || [],
    currentUserId: data.currentUserId || null,
    theme: localStorage.getItem('theme'),
  };
}

/**
 * Import data into Project Manager
 */
function importData(data: BackupData): boolean {
  try {
    const toSave = {
      activities: data.activities || [],
      checklistInstances: data.checklistInstances || [],
      staffMembers: data.staffMembers || [],
      customActivityTypes: data.customActivityTypes || [],
      currentUserId: data.currentUserId || null,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

    if (data.theme) {
      localStorage.setItem('theme', data.theme);
    }

    return true;
  } catch (e) {
    console.error('Failed to import backup data:', e);
    return false;
  }
}

/**
 * Initialize backup bridge - listens for messages from Hub
 */
export function initBackupBridge(): () => void {
  const handleMessage = (event: MessageEvent) => {
    const data = event.data;

    // Handle backup request from Hub
    if (data?.type === 'CDFA_BACKUP_REQUEST' && data?.action === 'EXPORT_DATA') {
      const backupData = exportData();

      // Send response back to Hub
      window.parent.postMessage(
        {
          type: 'CDFA_BACKUP_RESPONSE',
          toolId: TOOL_ID,
          toolName: TOOL_NAME,
          data: backupData,
        },
        '*'
      );
    }

    // Handle restore request from Hub
    if (data?.type === 'CDFA_RESTORE_REQUEST' && data?.action === 'IMPORT_DATA') {
      const success = importData(data.data as BackupData);

      // Send response back to Hub
      window.parent.postMessage(
        {
          type: 'CDFA_RESTORE_RESPONSE',
          toolId: TOOL_ID,
          success,
        },
        '*'
      );

      // Reload the page to apply restored data
      if (success) {
        window.location.reload();
      }
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}

/**
 * Get current data statistics for display
 */
export function getDataStats(): { activities: number; checklists: number; staff: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        activities: data.activities?.length || 0,
        checklists: data.checklistInstances?.length || 0,
        staff: data.staffMembers?.length || 0,
      };
    }
  } catch {
    // Ignore errors
  }
  return { activities: 0, checklists: 0, staff: 0 };
}
