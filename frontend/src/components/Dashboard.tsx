"use client";

import React, { useState } from 'react';
import { useAuth } from '../utils/authContext';
import { BookmarkForm } from './BookmarkForm';
import { BookmarkList } from './BookmarkList';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBookmarkAdded = () => {
    // Trigger a refresh of the bookmark list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Link Saver</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Welcome, {user?.email}
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <BookmarkForm onBookmarkAdded={handleBookmarkAdded} />
      
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Your Saved Links
      </h2>
      
      <BookmarkList key={refreshTrigger} />
    </div>
  );
};
