import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col px-4 pt-6 pb-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#1F1F1F] rounded-lg" />
          <div className="h-4 w-60 bg-[#1A1A1A] rounded-md" />
        </div>
        <div className="w-12 h-12 rounded-full bg-[#1F1F1F]" />
      </div>

      {/* Hero Card Skeleton */}
      <div className="bg-[#141414] border border-[#242424] rounded-2xl p-5 space-y-4">
        <div className="h-5 w-28 bg-[#1A1A1A] rounded-md" />
        <div className="space-y-2">
          <div className="h-7 w-56 bg-[#1F1F1F] rounded-lg" />
          <div className="h-4 w-40 bg-[#1A1A1A] rounded-md" />
        </div>
        <div className="h-14 w-full bg-[#1F1F1F] rounded-xl" />
      </div>

      {/* Weekly Progress Skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-32 bg-[#1A1A1A] rounded-md" />
          <div className="h-5 w-12 bg-[#1A1A1A] rounded-md" />
        </div>
        <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 h-20" />
      </div>

      {/* Quick Access Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-28 bg-[#1A1A1A] rounded-md" />
        <div className="grid grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#141414] border border-[#242424] rounded-2xl h-24" />
          ))}
        </div>
      </div>
    </div>
  );
};
