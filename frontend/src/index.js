/**
 * index.js – Application entry point.
 *
 * Mounts the root <App /> component into the DOM.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
