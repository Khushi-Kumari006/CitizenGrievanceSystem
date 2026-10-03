import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth <= 992) {
      setIsSidebarOpen(false);
    }
  };

  // Auto-close mobile sidebar upon route transition
  useEffect(() => {
    if (window.innerWidth <= 992) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onCloseMobile={closeMobileSidebar} />
      <div className="main-content-wrapper">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
