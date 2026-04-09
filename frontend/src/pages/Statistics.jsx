import React from 'react';
import { BarChart3 } from 'lucide-react';

const Statistics = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-pink-200/60 bg-white/80 p-8 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/70">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/40">
            <BarChart3 className="text-green-600 dark:text-green-400" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Statistics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your focus progress and study trends.</p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300/80 bg-white/70 p-6 dark:border-gray-600 dark:bg-gray-800/60">
          <p className="text-gray-700 dark:text-gray-300">This page is now routed correctly and ready for feature build-out.</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
