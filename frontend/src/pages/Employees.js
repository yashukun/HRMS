/**
 * Employees.js – Employee management page.
 *
 * Features:
 *  - Add a new employee (form at the top)
 *  - View all employees in a table
 *  - Expand a row to view that employee’s attendance inline
 *  - Delete an employee (with confirmation)
 */

import React, { useState, useEffect } from "react";
import api from "../api";

function Employees() {
  // --- State ---
  const [employees, setEmployees] = useState([]);        // all employees
  const [fullName, setFullName] = useState("");           // form: name
  const [email, setEmail] = useState("");                 // form: email
  const [department, setDepartment] = useState("");       // form: department
  const [message, setMessage] = useState("");             // success banner
  const [error, setError] = useState("");                 // error banner
  const [expandedId, setExpandedId] = useState(null);     // expanded row ID
  const [attendanceRecords, setAttendanceRecords] = useState([]); // inline attendance

  /** Fetch the full employee list from the API. */
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch {
      setError("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /** Handle the "Add Employee" form submission. */
  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/employees", {
        full_name: fullName,
        email,
        department,
      });
      setFullName("");
      setEmail("");
      setDepartment("");
      setMessage("Employee created successfully");
      await fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create employee");
    }
  };

  /** Toggle the inline attendance panel for a given employee. */
  const toggleAttendance = async (empId) => {
    if (expandedId === empId) {
      setExpandedId(null);
      setAttendanceRecords([]);
      return;
    }
    try {
      const res = await api.get(`/attendance/${empId}`);
      setAttendanceRecords(res.data);
      setExpandedId(empId);
    } catch {
      setAttendanceRecords([]);
      setExpandedId(empId);
    }
  };

  /** Delete an employee after user confirmation. */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      setMessage("Employee deleted");
      fetchEmployees();
    } catch {
      setError("Failed to delete employee");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Employees</h2>
      </div>

      {/* Add Employee Form */}
      <div className="form-card">
        <h3>Add Employee</h3>
        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleCreate}>
          <label>Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Department</label>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} required />
          <button type="submit" className="btn-primary">Add Employee</button>
        </form>
      </div>

      {/* Employee Table */}
      {employees.length === 0 ? (
        <p className="empty-msg">No employees found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <React.Fragment key={emp.id}>
                <tr>
                  <td>{emp.id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td><span className="badge badge-dept">{emp.department}</span></td>
                  <td>
                    <div className="btn-group">
                      <button className="btn-secondary" onClick={() => toggleAttendance(emp.id)}>
                        {expandedId === emp.id ? "Hide" : "View"} Attendance
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(emp.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === emp.id && (
                  <tr>
                    <td colSpan="5" className="expanded-row">
                      {attendanceRecords.length === 0 ? (
                        <p className="attendance-inline-empty">No attendance records found.</p>
                      ) : (
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceRecords.map((r) => (
                              <tr key={r.id}>
                                <td>{r.date}</td>
                                <td><span className={`badge ${r.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>{r.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Employees;
