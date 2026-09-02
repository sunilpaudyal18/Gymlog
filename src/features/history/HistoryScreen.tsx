import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import { isSameWeek, isSameMonth } from 'date-fns';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { WorkoutHistoryCard } from './components/WorkoutHistoryCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { WorkoutSession } from '../../types';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { completedSessions } = useHistoryStore();
  const [filterTab, setFilterTab] = useState<'all' | 'week' | 'month'>('all');

  const now = new Date();

  const filteredSessions = completedSessions.filter((session) => {
    const sessionDate = new Date(session.completedAt || session.startedAt);
    if (filterTab === 'week') {
      return isSameWeek(sessionDate, now, { weekStartsOn: 1 });
    }
    if (filterTab === 'month') {
      return isSameMonth(sessionDate, now);
    }
    return true;
  });

  const handleCardClick = (session: WorkoutSession) => {
    navigate(`/history/${session.id}`);
  };

  return (
    <div className="flex flex-col px-4 pt-6 pb-20 space-y-5 animate-fade-in select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">
            History
          </h1>
          <p className="text-xs text-[#475569] mt-0.5 font-medium">
            {completedSessions.length}{' '}
            {completedSessions.length === 1 ? 'workout' : 'workouts'} completed
          </p>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
            filterTab === 'all'
              ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold'
              : 'bg-white/80 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]'
          }`}
        >
          All ({completedSessions.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('week')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
            filterTab === 'week'
              ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold'
              : 'bg-white/80 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]'
          }`}
        >
          This Week
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('month')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
            filterTab === 'month'
              ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold'
              : 'bg-white/80 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]'
          }`}
        >
          This Month
        </button>
      </div>

      {/* History Grid */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          icon={<History size={36} />}
          title="No workout history yet"
          description={
            filterTab === 'all'
              ? 'Complete your first workout to start logging your training history and track progression.'
              : 'No completed workouts found for this selected timeframe.'
          }
          actionLabel="START A WORKOUT"
          onAction={() => navigate('/workouts')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <WorkoutHistoryCard
              key={session.id}
              session={session}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
