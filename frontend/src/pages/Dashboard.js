/**
 * Dashboard.js – Home page showing a high-level overview.
 *
 * Fetches the full employee list on mount and derives
 * summary statistics (total count, unique departments).
 */

import React, { useState, useEffect } from "react";
import api from "../api";

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, departments: [] });

  // Fetch employees once on mount to compute dashboard stats
  useEffect(() => {
    api.get("/employees").then((res) => {
      const emps = res.data;
      const depts = [...new Set(emps.map((e) => e.department))];
      setStats({ total: emps.length, departments: depts });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="welcome-card">
        <h2>Welcome back, Admin</h2>
        <p>Here's an overview of your HR management system.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Employees</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className="stat-value">{stats.departments.length}</div>
          <div className="stat-label">Departments</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div className="stat-value">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          <div className="stat-label">Today's Date</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="stat-value">Admin</div>
          <div className="stat-label">Active Role</div>
        </div>
      </div>

      {stats.departments.length > 0 && (
        <div>
          <h3 className="section-title">Departments</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stats.departments.map((d) => (
              <span key={d} className="badge badge-dept">{d}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
