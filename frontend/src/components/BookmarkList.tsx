"use client";

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/authContext';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://omvad-group-assignment-backend.onrender.com/api";

interface Bookmark {
  id: number;
  url: string;
  title: string;
  favicon: string;
  summary: string;
  created_at: string;
}

// Helper function to extract domain safely
const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export const BookmarkList = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Record<number, boolean>>({});
  const { token } = useAuth();

  const toggleSummary = (id: number) => {
    setExpandedSummaries(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookmarks(response.data.bookmarks);
    } catch (err: unknown) {
      setError('Failed to load bookmarks');
      console.error('Error loading bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBookmarks();
    }
  }, [token, fetchBookmarks]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/bookmarks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted bookmark from state
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting bookmark:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-md shadow-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Please try again later or contact support if the issue persists.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <motion.div 
        className="text-center p-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No bookmarks saved yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Add your first one with the form above!</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {bookmarks.map((bookmark, index) => (
        <motion.div 
          key={bookmark.id} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ y: -4 }}
        >
          <div className="p-5">
            <div className="flex items-start mb-3">
              {bookmark.favicon && (
                <img 
                  src={bookmark.favicon} 
                  alt=""
                  className="w-6 h-6 mr-3 mt-1 rounded-sm"
                  onError={(e) => {
                    // If favicon fails to load, replace with a default icon
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/globe.svg';
                  }}
                />
              )}
              {!bookmark.favicon && (
                <div className="w-6 h-6 mr-3 mt-1 bg-gray-200 dark:bg-gray-700 rounded-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
              )}
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex-grow line-clamp-2">
                {bookmark.title || extractDomain(bookmark.url)}
              </h3>
            </div>
            
            <div className="flex items-center mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-600 transition-colors">
                {bookmark.url}
              </a>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
              <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                </svg>
                Summary
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {expandedSummaries[bookmark.id] ? bookmark.summary || "No summary available." : (bookmark.summary || "No summary available.").slice(0, 100)}
                {bookmark.summary && bookmark.summary.length > 100 && (
                  <button 
                    onClick={() => toggleSummary(bookmark.id)} 
                    className="text-blue-600 dark:text-blue-400 hover:underline ml-2"
                  >
                    {expandedSummaries[bookmark.id] ? "Show less" : "Show more"}
                  </button>
                )}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex justify-between items-center">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Visit
            </a>
            
            <motion.button 
              onClick={() => handleDelete(bookmark.id)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Delete
            </motion.button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
