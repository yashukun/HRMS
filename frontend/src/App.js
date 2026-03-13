/**
 * App.js – Root application component.
 *
 * Defines the top-level layout (Navbar + Sidebar + routed content area)
 * and registers all client-side routes.
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Fixed top navigation bar */}
        <Navbar />

        {/* Fixed left sidebar with nav links */}
        <Sidebar />

        {/* Main content area – renders the active page */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            {/* Catch-all: redirect unknown routes to the dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
