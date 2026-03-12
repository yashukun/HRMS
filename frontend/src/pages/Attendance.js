import React, { useState, useEffect, useRef } from "react";
import api from "../api";

function EmployeeSearch({ employees, selectedId, onSelect, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = employees.filter((emp) => {
    const q = query.toLowerCase();
    return (
      emp.full_name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      String(emp.id).includes(q)
    );
  });

  const selected = employees.find((e) => String(e.id) === String(selectedId));

  const handlePick = (emp) => {
    onSelect(String(emp.id));
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="employee-search" ref={ref}>
      <input
        type="text"
        value={open ? query : selected ? `${selected.full_name} (${selected.email})` : ""}
        placeholder={placeholder || "Search by name, email, or ID..."}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); setQuery(""); }}
        autoComplete="off"
      />
      {open && (
        <div className="search-dropdown">
          {filtered.length === 0 ? (
            <div className="search-dropdown-empty">No employees found</div>
          ) : (
            filtered.map((emp) => (
              <div
                key={emp.id}
                className={`search-dropdown-item${String(emp.id) === String(selectedId) ? " active" : ""}`}
                onClick={() => handlePick(emp)}
              >
                <span className="search-dropdown-name">{emp.full_name}</span>
                <span className="search-dropdown-meta">ID: {emp.id} &middot; {emp.email}</span>
              </div>
            ))
          )}
        </div>
      )}
      <input type="hidden" value={selectedId} required />
    </div>
  );
}

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Present");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // View attendance
  const [viewEmployeeId, setViewEmployeeId] = useState("");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/employees").then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const handleMark = async (e) => {
    e.preventDefault();
    if (!employeeId) { setError("Please select an employee"); return; }
    setMessage("");
    setError("");
    try {
      await api.post("/attendance", {
        employee_id: parseInt(employeeId),
        date,
        status,
      });
      setMessage("Attendance marked successfully");
      if (viewEmployeeId === employeeId) {
        fetchRecords(employeeId);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to mark attendance");
    }
  };

  const fetchRecords = async (empId) => {
    try {
      const res = await api.get(`/attendance/${empId}`);
      setRecords(res.data);
    } catch {
      setRecords([]);
    }
  };

  const handleView = (e) => {
    e.preventDefault();
    if (viewEmployeeId) {
      fetchRecords(viewEmployeeId);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Attendance</h2>
      </div>

      {/* Mark Attendance */}
      <div className="form-card">
        <h3>Mark Attendance</h3>
        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleMark}>
          <label>Employee</label>
          <EmployeeSearch
            employees={employees}
            selectedId={employeeId}
            onSelect={setEmployeeId}
            placeholder="Search by name, email, or ID..."
          />
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          <button type="submit" className="btn-primary">Mark Attendance</button>
        </form>
      </div>

      {/* View Attendance */}
      <div className="form-card">
        <h3>View Attendance Records</h3>
        <form onSubmit={handleView}>
          <label>Employee</label>
          <EmployeeSearch
            employees={employees}
            selectedId={viewEmployeeId}
            onSelect={setViewEmployeeId}
            placeholder="Search by name, email, or ID..."
          />
          <button type="submit" className="btn-primary">View Records</button>
        </form>
      </div>

      {/* Attendance Table */}
      {records.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td><span className={`badge ${r.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Attendance;
