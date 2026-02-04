import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useActivities } from '../../context/ActivityContext';
import type { TradeActivity, EducationalActivity, ConsultationActivity, ActivityStatus, ActivityLocation } from '../../types';
import { getActivityCategory } from '../../types';
import ChecklistPanel from '../checklist/ChecklistPanel';

interface ActivityDetailProps {
  activityId: string;
  onClose: () => void;
  onDelete: () => void;
}

type TabType = 'overview' | 'checklist' | 'notes';

export default function ActivityDetail({ activityId, onClose, onDelete }: ActivityDetailProps) {
  const { activities, updateActivity, getChecklistForActivity, archiveActivity, unarchiveActivity, getActivityTypeInfo, customActivityTypes } = useActivities();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activity = activities.find((a) => a.id === activityId);
  const checklist = getChecklistForActivity(activityId);

  if (!activity) {
    return (
      <div className="p-6 text-center text-gray-500">
        Activity not found
      </div>
    );
  }

  const activityTypeInfo = getActivityTypeInfo(activity.activityType);
  const activityCategory = getActivityCategory(activity.activityType, customActivityTypes);
  const isTradeActivity = activityCategory === 'trade';
  const isEducationalActivity = activityCategory === 'educational';
  const isConsultationActivity = activityCategory === 'consultation';
  const tradeActivity = activity as TradeActivity;
  const eduActivity = activity as EducationalActivity;
  const consultActivity = activity as ConsultationActivity;

  const handleStatusChange = (newStatus: ActivityStatus) => {
    updateActivity(activityId, { status: newStatus });
  };

  const handleFieldChange = (field: string, value: any) => {
    updateActivity(activityId, { [field]: value });
  };

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'planning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'postponed':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
            {activity.isArchived ? (
              <button
                onClick={() => unarchiveActivity(activityId)}
                className="px-3 py-1.5 text-sm border border-green-200 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Unarchive
              </button>
            ) : (
              <button
                onClick={() => archiveActivity(activityId)}
                className="px-3 py-1.5 text-sm border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Archive
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={activity.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="text-xl font-bold w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none pb-1"
          />
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{activity.name}</h2>
            {activity.isArchived && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                Archived
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2 text-sm">
          <span
            className={`w-3 h-3 rounded-full bg-${activityTypeInfo.color}-500`}
            style={{ backgroundColor: `var(--color-${activityTypeInfo.color}-500, ${
              activityTypeInfo.color === 'blue' ? '#3b82f6' :
              activityTypeInfo.color === 'indigo' ? '#6366f1' :
              activityTypeInfo.color === 'purple' ? '#a855f7' :
              activityTypeInfo.color === 'green' ? '#22c55e' :
              activityTypeInfo.color === 'teal' ? '#14b8a6' :
              activityTypeInfo.color === 'cyan' ? '#06b6d4' :
              activityTypeInfo.color === 'amber' ? '#f59e0b' : '#6b7280'
            })` }}
          />
          <span className="text-gray-600 capitalize">
            {activityTypeInfo.name}
          </span>
          {activity.location && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">{activity.location}</span>
            </>
          )}
        </div>

        {/* Status selector */}
        <div className="mt-3">
          <select
            value={activity.status}
            onChange={(e) => handleStatusChange(e.target.value as ActivityStatus)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(activity.status)}`}
          >
            <option value="draft">Draft</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          {(['overview', 'checklist', 'notes'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'checklist' && checklist && (
                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                  {checklist.completedCount}/{checklist.totalCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Dates */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={activity.startDate}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {activity.startDate
                        ? format(parseISO(activity.startDate), 'MMMM d, yyyy')
                        : 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={activity.endDate}
                      onChange={(e) => handleFieldChange('endDate', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {activity.endDate
                        ? format(parseISO(activity.endDate), 'MMMM d, yyyy')
                        : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              {isEditing ? (
                <textarea
                  value={activity.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Add a description..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {activity.description || 'No description'}
                </p>
              )}
            </div>

            {/* Location & Stops */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Locations / Stops</h3>
                {isEditing && (
                  <button
                    onClick={() => {
                      const newLocation: ActivityLocation = {
                        id: uuidv4(),
                        city: '',
                        country: '',
                        venue: '',
                        notes: '',
                      };
                      handleFieldChange('locations', [...(activity.locations || []), newLocation]);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Stop
                  </button>
                )}
              </div>

              {/* Location Type */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Location Type</label>
                {isEditing ? (
                  <select
                    value={activity.locationType}
                    onChange={(e) => handleFieldChange('locationType', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="domestic">Domestic (US)</option>
                    <option value="international">International</option>
                    <option value="virtual">Virtual</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{activity.locationType}</p>
                )}
              </div>

              {/* Primary Location (for simple activities) */}
              {(!activity.locations || activity.locations.length === 0) && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Primary Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={activity.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., Tokyo, Japan or San Francisco, CA"
                    />
                  ) : (
                    <p className="text-gray-900">{activity.location || 'Not specified'}</p>
                  )}
                </div>
              )}

              {/* Multiple Stops */}
              {activity.locations && activity.locations.length > 0 && (
                <div className="space-y-3">
                  {activity.locations.map((loc, index) => (
                    <div
                      key={loc.id}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Stop {index + 1}
                        </span>
                        {isEditing && (
                          <button
                            onClick={() => {
                              const updated = activity.locations.filter((l) => l.id !== loc.id);
                              handleFieldChange('locations', updated);
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={loc.city}
                            onChange={(e) => {
                              const updated = activity.locations.map((l) =>
                                l.id === loc.id ? { ...l, city: e.target.value } : l
                              );
                              handleFieldChange('locations', updated);
                            }}
                            className="border rounded px-2 py-1.5 text-sm"
                            placeholder="City"
                          />
                          <input
                            type="text"
                            value={loc.country}
                            onChange={(e) => {
                              const updated = activity.locations.map((l) =>
                                l.id === loc.id ? { ...l, country: e.target.value } : l
                              );
                              handleFieldChange('locations', updated);
                            }}
                            className="border rounded px-2 py-1.5 text-sm"
                            placeholder="Country"
                          />
                          <input
                            type="text"
                            value={loc.venue || ''}
                            onChange={(e) => {
                              const updated = activity.locations.map((l) =>
                                l.id === loc.id ? { ...l, venue: e.target.value } : l
                              );
                              handleFieldChange('locations', updated);
                            }}
                            className="border rounded px-2 py-1.5 text-sm col-span-2"
                            placeholder="Venue (optional)"
                          />
                          <input
                            type="date"
                            value={loc.startDate || ''}
                            onChange={(e) => {
                              const updated = activity.locations.map((l) =>
                                l.id === loc.id ? { ...l, startDate: e.target.value } : l
                              );
                              handleFieldChange('locations', updated);
                            }}
                            className="border rounded px-2 py-1.5 text-sm"
                          />
                          <input
                            type="date"
                            value={loc.endDate || ''}
                            onChange={(e) => {
                              const updated = activity.locations.map((l) =>
                                l.id === loc.id ? { ...l, endDate: e.target.value } : l
                              );
                              handleFieldChange('locations', updated);
                            }}
                            className="border rounded px-2 py-1.5 text-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">
                            {loc.city}{loc.country ? `, ${loc.country}` : ''}
                          </p>
                          {loc.venue && (
                            <p className="text-sm text-gray-600">{loc.venue}</p>
                          )}
                          {(loc.startDate || loc.endDate) && (
                            <p className="text-sm text-gray-500 mt-1">
                              {loc.startDate && format(parseISO(loc.startDate), 'MMM d')}
                              {loc.startDate && loc.endDate && ' - '}
                              {loc.endDate && format(parseISO(loc.endDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Hint for trade missions */}
              {isEditing && isTradeActivity && (activity.activityType === 'outbound_trade_mission' || activity.activityType === 'inbound_trade_mission') && (
                <p className="text-xs text-gray-500 mt-3">
                  Tip: Add multiple stops for trade missions that visit several cities.
                </p>
              )}
            </div>

            {/* Type-specific details */}
            {isTradeActivity && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Trade Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Target Market</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tradeActivity.targetMarket}
                        onChange={(e) => handleFieldChange('targetMarket', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Japan, Southeast Asia"
                      />
                    ) : (
                      <p className="text-gray-900">{tradeActivity.targetMarket || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Commodities</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tradeActivity.commodities?.join(', ') || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            'commodities',
                            e.target.value.split(',').map((s) => s.trim())
                          )
                        }
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Almonds, Wine, Dairy"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {tradeActivity.commodities?.join(', ') || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Suppliers</label>
                      <p className="text-gray-900">{tradeActivity.suppliers?.length || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Buyers</label>
                      <p className="text-gray-900">{tradeActivity.buyers?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Meeting Scheduler Integration - Trade Activities Only */}
            {isTradeActivity && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Meeting Scheduler
                </h3>
                <div className="space-y-3">
                  {tradeActivity.meetingSchedulerShareId ? (
                    <>
                      <p className="text-sm text-gray-600">
                        This activity is linked to a meeting schedule.
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={`https://meeting-scheduler-pi-one.vercel.app/?share=${tradeActivity.meetingSchedulerShareId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open Meeting Schedule
                        </a>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleFieldChange('meetingSchedulerShareId', undefined)}
                            className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Unlink
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        Create a meeting schedule to manage B2B meetings for this trade activity.
                      </p>
                      <a
                        href={`https://meeting-scheduler-pi-one.vercel.app/?fromActivity=${activity.id}&activityName=${encodeURIComponent(activity.name)}&startDate=${activity.startDate}&endDate=${activity.endDate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Meeting Schedule
                      </a>
                      {isEditing && (
                        <div className="mt-3 pt-3 border-t">
                          <label className="block text-sm text-gray-600 mb-1">
                            Or link existing schedule (Share ID)
                          </label>
                          <input
                            type="text"
                            placeholder="Enter share ID from Meeting Scheduler"
                            onChange={(e) => handleFieldChange('meetingSchedulerShareId', e.target.value || undefined)}
                            className="w-full border rounded px-3 py-2 text-sm"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Budget Tracker Integration - All Activities */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Budget Tracker
              </h3>
              <div className="space-y-3">
                {activity.budgetId ? (
                  <>
                    <p className="text-sm text-gray-600">
                      This activity is linked to a budget in the Budget Tracker.
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={`https://budget-tracker-three-kappa.vercel.app/activities/${activity.budgetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Budget
                      </a>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleFieldChange('budgetId', undefined)}
                          className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Unlink
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Track expenses and budget utilization for this activity.
                    </p>
                    <a
                      href={`https://budget-tracker-three-kappa.vercel.app/activities/create?cdfa_activity_id=${activity.id}&name=${encodeURIComponent(activity.name)}&start_date=${activity.startDate}&end_date=${activity.endDate}&location=${encodeURIComponent(activity.location || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Budget
                    </a>
                    {isEditing && (
                      <div className="mt-3 pt-3 border-t">
                        <label className="block text-sm text-gray-600 mb-1">
                          Or link existing budget (Activity ID)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter activity ID from Budget Tracker"
                          onChange={(e) => handleFieldChange('budgetId', e.target.value || undefined)}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {isEducationalActivity && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Educational Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Topic</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={eduActivity.topic}
                        onChange={(e) => handleFieldChange('topic', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Export Regulations Overview"
                      />
                    ) : (
                      <p className="text-gray-900">{eduActivity.topic || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Target Audience</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={eduActivity.targetAudience?.join(', ') || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            'targetAudience',
                            e.target.value.split(',').map((s) => s.trim())
                          )
                        }
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Exporters, Producers, Processors"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {eduActivity.targetAudience?.join(', ') || 'Not specified'}
                      </p>
                    )}
                  </div>
                  {eduActivity.seriesInfo && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Series Info</label>
                      <p className="text-gray-900">
                        Session {eduActivity.seriesInfo.currentSession || 1} of {eduActivity.seriesInfo.totalSessions}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Registered</label>
                      <p className="text-gray-900">{eduActivity.registeredCount || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Attended</label>
                      <p className="text-gray-900">{eduActivity.attendedCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isConsultationActivity && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Consultation Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Client</label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={consultActivity.clientName || ''}
                          onChange={(e) => handleFieldChange('clientName', e.target.value)}
                          className="border rounded px-3 py-2"
                          placeholder="Contact Name"
                        />
                        <input
                          type="text"
                          value={consultActivity.clientOrganization || ''}
                          onChange={(e) => handleFieldChange('clientOrganization', e.target.value)}
                          className="border rounded px-3 py-2"
                          placeholder="Organization"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900">
                        {consultActivity.clientName || 'Not specified'}
                        {consultActivity.clientOrganization && ` - ${consultActivity.clientOrganization}`}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Topics Discussed</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={consultActivity.topics?.join(', ') || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            'topics',
                            e.target.value.split(',').map((s) => s.trim())
                          )
                        }
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Market Entry, Regulations, Pricing"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {consultActivity.topics?.join(', ') || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Type</label>
                      <p className="text-gray-900 capitalize">{consultActivity.consultationType?.replace('_', ' ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Duration</label>
                      <p className="text-gray-900">{consultActivity.duration ? `${consultActivity.duration} min` : 'Not specified'}</p>
                    </div>
                  </div>
                  {consultActivity.followUpRequired && consultActivity.followUpDate && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Follow-up Date</label>
                      <p className="text-gray-900">{format(parseISO(consultActivity.followUpDate), 'MMMM d, yyyy')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Metadata</h3>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Fiscal Year: {activity.fiscalYear}</p>
                <p>Created: {format(parseISO(activity.createdAt), 'MMM d, yyyy h:mm a')}</p>
                <p>Updated: {format(parseISO(activity.updatedAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && <ChecklistPanel activityId={activityId} />}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
            <textarea
              value={activity.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={10}
              className="w-full border rounded px-3 py-2"
              placeholder="Add notes about this activity..."
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Activity</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>"{activity.name}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              All associated checklists and data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
