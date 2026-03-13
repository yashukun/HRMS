/**
 * api.js – Pre-configured Axios instance for backend communication.
 *
 * Base URL is read from the REACT_APP_API_URL environment variable
 * (set via .env or Docker) and defaults to the local dev backend.
 */

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
});

export default api;
