import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import Dashboard from './ProfilePage';
import Settings from './UserSettings';
import AppliedJobs from './AppliedJobs';
import BookmarkedJobs from './BookmarkedJobs';

export default function UserLayout() {
  return (
    <>
    <div className="d-flex">
      <UserSidebar /> {/* Render the sidebar */}
      <div className="flex-grow-1 p-3" style={{ marginLeft: '250px' }}>
          <Routes>
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/Settings" element={<Settings />} />
              <Route path="/AppliedJobs" element={<AppliedJobs />} />
              <Route path="/BookmarkedJobs" element={<BookmarkedJobs />} />
          </Routes>
      </div>
    </div>
    </>
  );
}

