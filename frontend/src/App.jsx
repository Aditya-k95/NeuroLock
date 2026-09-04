import React from 'react';
import Dashboard from './pages/Dashboard';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-pitch-950">
        <Dashboard />
      </div>
    </LanguageProvider>
  );
}

