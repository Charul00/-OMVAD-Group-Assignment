"use client";

import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://omvad-group-assignment-backend.onrender.com/api";

export const useApiTester = () => {
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    details?: any;
  }>({
    status: 'idle',
    message: 'API connection test not started'
  });

  const testApiConnection = async () => {
    setTestResult({
      status: 'loading',
      message: 'Testing connection to API...'
    });

    try {
      // First try to access the server root to check if it's online
      const rootResponse = await axios.get(`${API_URL.split('/api')[0]}`, {
        timeout: 5000
      });
      
      // Then try the health endpoint if available
      try {
        const healthResponse = await axios.get(`${API_URL}/health`, {
          timeout: 5000
        });
        
        setTestResult({
          status: 'success',
          message: 'Successfully connected to the API and verified health',
          details: {
            rootStatus: rootResponse.status,
            healthStatus: healthResponse.status,
            healthData: healthResponse.data
          }
        });
      } catch (healthError) {
        // We connected to the server but health endpoint might not exist
        setTestResult({
          status: 'success',
          message: 'Connected to API server, but health check endpoint not available',
          details: {
            rootStatus: rootResponse.status,
            error: axios.isAxiosError(healthError) ? {
              status: healthError.response?.status,
              data: healthError.response?.data
            } : String(healthError)
          }
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: axios.isAxiosError(error)
          ? `Connection failed: ${error.message}`
          : `Unknown error: ${String(error)}`,
        details: axios.isAxiosError(error) ? {
          code: error.code,
          message: error.message,
          config: {
            url: error.config?.url,
            timeout: error.config?.timeout,
            headers: error.config?.headers
          }
        } : error
      });
    }
  };

  return {
    testResult,
    testApiConnection
  };
};