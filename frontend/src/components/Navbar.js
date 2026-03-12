import React from "react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">HR</div>
        HRMS
      </div>
      <div className="navbar-right">
        <span className="navbar-user">Admin Panel</span>
        <div className="navbar-avatar">A</div>
      </div>
    </nav>
  );
}

export default Navbar;
