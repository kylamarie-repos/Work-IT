import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard'; 
import Jobs from './Jobs'; 
import Candidates from "./Candidates";
import Settings from './Settings';

export default function EmployerLayout() {
  return (
    <>
    <div className="d-flex">
      <Sidebar /> {/* Render the sidebar */}
      <div className="flex-grow-1 p-3" style={{ marginLeft: '250px' }}>
          <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/settings" element={<Settings />} />
          </Routes>
      </div>
    </div>
    </>
  );
}

