import React from 'react';
import { UserProvider } from './context/UserContext';
import { LanguageProvider } from './context/LanguageContext';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <UserProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[#07050d]">
          <Dashboard />
        </div>
      </LanguageProvider>
    </UserProvider>
  );
}

