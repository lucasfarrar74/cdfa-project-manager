import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useActivities } from '../../context/ActivityContext';
import type { AnyActivity, ActivityStatus } from '../../types';
import ActivityDetail from './ActivityDetail';

export default function ActivityList() {
  const {
    filteredActivities,
    filters,
    setFilters,
    clearFilters,
    selectActivity,
    activeActivityId,
    deleteActivity,
    archivedCount,
  } = useActivities();

  const [showFilters, setShowFilters] = useState(false);
  const { getActivityTypeInfo } = useActivities();

  const getActivityTypeColor = (activityType: string) => {
    const typeInfo = getActivityTypeInfo(activityType);
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      indigo: 'bg-indigo-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      teal: 'bg-teal-500',
      cyan: 'bg-cyan-500',
      amber: 'bg-amber-500',
      gray: 'bg-gray-500',
    };
    return colorMap[typeInfo.color] || 'bg-gray-500';
  };

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'planning':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'postponed':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityTypeLabel = (activity: AnyActivity) => {
    const typeInfo = getActivityTypeInfo(activity.activityType);
    return typeInfo.shortName || typeInfo.name;
  };

  return (
    <div className="h-full flex">
      {/* Activity list */}
      <div className={`flex-1 flex flex-col ${activeActivityId ? 'hidden lg:flex lg:w-1/2 lg:border-r' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                showFilters || Object.keys(filters).length > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              {/* Activity Type Chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilters({ ...filters, activityType: undefined, category: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      !filters.activityType && !filters.category
                        ? 'bg-gray-800 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  {/* Trade types */}
                  <button
                    onClick={() => setFilters({ ...filters, activityType: 'outbound_trade_mission', category: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filters.activityType === 'outbound_trade_mission'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Outbound Mission
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, activityType: 'inbound_trade_mission', category: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filters.activityType === 'inbound_trade_mission'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Inbound Mission
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, activityType: 'trade_show', category: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filters.activityType === 'trade_show'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Trade Show
                  </button>
                  {/* Educational types */}
                  <button
                    onClick={() => setFilters({ ...filters, activityType: 'webinar', category: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filters.activityType === 'webinar'
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Webinar
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, activityType: 'seminar', category: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filters.activityType === 'seminar'
                        ? 'bg-teal-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-teal-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    Seminar
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, activityType: 'seminar_series', category: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filters.activityType === 'seminar_series'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-cyan-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Series
                  </button>
                  {/* Consultation */}
                  <button
                    onClick={() => setFilters({ ...filters, activityType: 'consultation', category: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filters.activityType === 'consultation'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-amber-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Consultation
                  </button>
                </div>
              </div>

              {/* Status Chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilters({ ...filters, status: undefined })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      !filters.status
                        ? 'bg-gray-800 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  {[
                    { value: 'draft', label: 'Draft', color: 'gray' },
                    { value: 'planning', label: 'Planning', color: 'yellow' },
                    { value: 'in_progress', label: 'In Progress', color: 'blue' },
                    { value: 'completed', label: 'Completed', color: 'green' },
                    { value: 'cancelled', label: 'Cancelled', color: 'red' },
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setFilters({ ...filters, status: [status.value as ActivityStatus] })}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filters.status?.[0] === status.value
                          ? `bg-${status.color}-600 text-white`
                          : `bg-white border border-gray-300 text-gray-600 hover:bg-${status.color}-50`
                      }`}
                      style={filters.status?.[0] === status.value ? {
                        backgroundColor: status.color === 'gray' ? '#4b5563' :
                          status.color === 'yellow' ? '#ca8a04' :
                          status.color === 'blue' ? '#2563eb' :
                          status.color === 'green' ? '#16a34a' :
                          status.color === 'red' ? '#dc2626' : '#4b5563'
                      } : {}}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.searchQuery || ''}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value || undefined })}
                  placeholder="Search activities..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showArchived || false}
                    onChange={(e) => setFilters({ ...filters, showArchived: e.target.checked || undefined })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Show archived ({archivedCount})
                  </span>
                </label>
                {Object.keys(filters).length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p>No activities found</p>
              <p className="text-sm mt-1">Create a new activity to get started</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => selectActivity(activity.id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    activeActivityId === activity.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-2 ${getActivityTypeColor(activity.activityType)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{activity.name}</h3>
                          <p className="text-sm text-gray-500">
                            {getActivityTypeLabel(activity)}
                            {activity.location && ` • ${activity.location}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {activity.isArchived && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                              archived
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                              activity.status
                            )}`}
                          >
                            {activity.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        {activity.startDate && (
                          <span>{format(parseISO(activity.startDate), 'MMM d, yyyy')}</span>
                        )}
                        <span>{activity.fiscalYear}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity detail */}
      {activeActivityId && (
        <div className="flex-1 lg:w-1/2 overflow-auto bg-gray-50">
          <ActivityDetail
            activityId={activeActivityId}
            onClose={() => selectActivity(null)}
            onDelete={() => {
              deleteActivity(activeActivityId);
              selectActivity(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
