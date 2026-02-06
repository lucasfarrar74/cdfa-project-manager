/**
 * Activity Bridge for CDFA Hub integration
 * Handles activity creation/sync from Activity Links page
 */

import type { Activity, ActivityStatus } from '../types';

interface CreateActivityMessage {
  type: 'CDFA_ACTIVITY';
  action: 'CREATE_ACTIVITY';
  payload: {
    id: string;
    name: string;
    fiscalYear: string;
    startDate: string;
    endDate: string;
    location?: string;
  };
}

interface ActivityResultMessage {
  type: 'CDFA_ACTIVITY_RESULT';
  success: boolean;
  activityId?: string;
  error?: string;
}

type CreateActivityCallback = (activity: Partial<Activity>) => Activity | null;

/**
 * Initialize the activity bridge listener
 */
export function initializeActivityBridge(
  onCreateActivity: CreateActivityCallback
): () => void {
  const handleMessage = (event: MessageEvent) => {
    const data = event.data;

    console.log('[ActivityBridge] Received message:', data?.type, data?.action);

    // Validate message structure
    if (data?.type !== 'CDFA_ACTIVITY' || data?.action !== 'CREATE_ACTIVITY') {
      return;
    }

    console.log('[ActivityBridge] Processing CREATE_ACTIVITY:', data.payload);

    const message = data as CreateActivityMessage;
    const { id, name, fiscalYear, startDate, endDate, location } = message.payload;

    // Validate required fields
    if (!id || !name) {
      sendResult(event, {
        type: 'CDFA_ACTIVITY_RESULT',
        success: false,
        error: 'Missing required fields: id and name',
      });
      return;
    }

    try {
      // Create the activity with data from Hub
      const activity = onCreateActivity({
        id, // Use the same ID as Activity Links for linking
        name,
        fiscalYear: fiscalYear || 'FY2025-26',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || startDate || new Date().toISOString().split('T')[0],
        location: location || '',
        locationType: 'international',
        activityType: 'trade_show', // Default type
        status: 'planning' as ActivityStatus,
        description: `Activity created from CDFA Hub Activity Links`,
      });

      if (!activity) {
        sendResult(event, {
          type: 'CDFA_ACTIVITY_RESULT',
          success: false,
          error: 'Failed to create activity',
        });
        return;
      }

      sendResult(event, {
        type: 'CDFA_ACTIVITY_RESULT',
        success: true,
        activityId: activity.id,
      });
    } catch (error) {
      sendResult(event, {
        type: 'CDFA_ACTIVITY_RESULT',
        success: false,
        error: error instanceof Error ? error.message : 'Activity creation failed',
      });
    }
  };

  window.addEventListener('message', handleMessage);

  // Send ready signal to parent window
  console.log('[ActivityBridge] Checking if in iframe:', window.parent !== window);
  if (window.parent && window.parent !== window) {
    console.log('[ActivityBridge] Sending READY signal to parent');
    window.parent.postMessage({ type: 'CDFA_ACTIVITY_BRIDGE_READY' }, '*');
  }

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}

/**
 * Send result back to the parent window
 */
function sendResult(event: MessageEvent, result: ActivityResultMessage): void {
  if (event.source && typeof (event.source as Window).postMessage === 'function') {
    (event.source as Window).postMessage(result, '*');
  }

  if (window.parent && window.parent !== window) {
    window.parent.postMessage(result, '*');
  }
}
