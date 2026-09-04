import React from 'react';
import { UserProvider } from './context/UserContext';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-pitch-950">
        <Dashboard />
      </div>
    </UserProvider>
  );
}
