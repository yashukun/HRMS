/**
 * Login.js – Admin login page.
 *
 * Submits credentials to POST /api/login and passes the returned
 * access token to the parent via the `onLogin` callback.
 */

import React, { useState } from "react";
import api from "../api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /** Submit login credentials to the backend. */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/login", { username, password });
      onLogin(res.data.access_token);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>HRMS Lite</h2>
        {error && <p className="login-error">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
