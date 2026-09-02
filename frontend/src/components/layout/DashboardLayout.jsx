import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onCloseMobile={closeMobileSidebar} />
      <div className="main-content">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
