"use client";

import React from 'react';
import { useApiTester } from '../utils/apiTester';

export const ConnectionTest = () => {
  const { testResult, testApiConnection } = useApiTester();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
        API Connection Test
      </h3>
      
      <div className="mb-4">
        <button
          onClick={testApiConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          disabled={testResult.status === 'loading'}
        >
          {testResult.status === 'loading' ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
      
      {testResult.status !== 'idle' && (
        <div className={`p-3 rounded ${
          testResult.status === 'loading' ? 'bg-gray-100 dark:bg-gray-700' :
          testResult.status === 'success' ? 'bg-green-100 dark:bg-green-900' :
          'bg-red-100 dark:bg-red-900'
        }`}>
          <p className={`font-medium ${
            testResult.status === 'loading' ? 'text-gray-700 dark:text-gray-300' :
            testResult.status === 'success' ? 'text-green-700 dark:text-green-300' :
            'text-red-700 dark:text-red-300'
          }`}>
            {testResult.message}
          </p>
          
          {testResult.details && (
            <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-auto">
              {JSON.stringify(testResult.details, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Current API URL: {process.env.NEXT_PUBLIC_API_URL || "https://omvad-group-assignment-backend.onrender.com/api"}</p>
        <p className="mt-1">If youre experiencing connection issues:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Check if the backend server is running</li>
          <li>Check for CORS configuration issues</li>
          <li>Verify your internet connection</li>
          <li>Try running the backend locally</li>
        </ul>
      </div>
    </div>
  );
};