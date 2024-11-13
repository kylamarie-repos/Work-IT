import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard'; 
import EmployerJobs from './EmployerJobs'; 
import Candidates from "./Candidates";
import Settings from './Settings';

export default function EmployerLayout() {
  return (
    <>
    <div className="d-flex">
      <Sidebar />
      <div className="content-wrapper flex-grow-1 p-3">
          <Routes>
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/Employerjobs" element={<EmployerJobs />} />
              <Route path="/Candidates" element={<Candidates />} />
              <Route path="/Settings" element={<Settings />} />
          </Routes>
      </div>
    </div>
    </>
  );
}

