/**
 * Navbar.js – Top navigation bar.
 *
 * Displays the app brand (logo + name) on the left
 * and the current user / avatar on the right.
 */

import React from "react";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Brand / logo */}
      <div className="navbar-brand">
        <div className="navbar-logo">HR</div>
        HRMS
      </div>

      {/* User info */}
      <div className="navbar-right">
        <span className="navbar-user">Admin Panel</span>
        <div className="navbar-avatar">A</div>
      </div>
    </nav>
  );
}

export default Navbar;
