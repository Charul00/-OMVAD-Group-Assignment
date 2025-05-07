"use client";

import { useAuth } from "../utils/authContext";
import { AuthForms } from "../components/AuthForms";
import { Dashboard } from "../components/Dashboard";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user ? <Dashboard /> : <AuthForms />}
    </div>
  );
}
