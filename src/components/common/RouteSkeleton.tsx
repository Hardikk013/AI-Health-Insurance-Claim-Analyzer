import React from 'react';

export const RouteSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-cream py-10 px-4 sm:px-6 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="h-8 bg-line/60 rounded-xl w-1/3 mx-auto sm:mx-0" />
          <div className="h-4 bg-line/40 rounded-lg w-2/3 mx-auto sm:mx-0" />
        </div>

        {/* Card Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-surface border border-line rounded-2xl p-4 space-y-3 shadow-soft">
            <div className="h-3 bg-line/50 rounded w-1/2" />
            <div className="h-7 bg-line/70 rounded w-3/4" />
          </div>
          <div className="h-28 bg-surface border border-line rounded-2xl p-4 space-y-3 shadow-soft">
            <div className="h-3 bg-line/50 rounded w-1/2" />
            <div className="h-7 bg-line/70 rounded w-3/4" />
          </div>
          <div className="h-28 bg-surface border border-line rounded-2xl p-4 space-y-3 shadow-soft">
            <div className="h-3 bg-line/50 rounded w-1/2" />
            <div className="h-7 bg-line/70 rounded w-3/4" />
          </div>
        </div>

        {/* Main Body Skeleton */}
        <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8 space-y-4 shadow-soft">
          <div className="h-5 bg-line/60 rounded w-1/4" />
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-line/40 rounded w-full" />
            <div className="h-4 bg-line/40 rounded w-5/6" />
            <div className="h-4 bg-line/40 rounded w-4/6" />
          </div>
          <div className="h-36 bg-cream border border-line rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
};
