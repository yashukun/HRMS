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

  // --- Field-level validation errors ---
  const [fieldErrors, setFieldErrors] = useState({});

  /** Validate form fields client-side. Returns true if valid. */
  const validateForm = () => {
    const errs = {};
    const nameRe = /^[A-Za-z\s'\-]+$/;
    const deptRe = /^[A-Za-z\s&\-]+$/;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Full name
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errs.fullName = "Full name is required";
    } else if (trimmedName.length < 2) {
      errs.fullName = "Full name must be at least 2 characters";
    } else if (!nameRe.test(trimmedName)) {
      errs.fullName = "Full name must contain only letters, spaces, hyphens, or apostrophes";
    }

    // Email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = "Email is required";
    } else if (!emailRe.test(trimmedEmail)) {
      errs.email = "Please enter a valid email address (e.g. user@example.com)";
    }

    // Department
    const trimmedDept = department.trim();
    if (!trimmedDept) {
      errs.department = "Department is required";
    } else if (trimmedDept.length < 2) {
      errs.department = "Department must be at least 2 characters";
    } else if (!deptRe.test(trimmedDept)) {
      errs.department = "Department must contain only letters, spaces, hyphens, or '&'";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /** Handle the "Add Employee" form submission. */
  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Run client-side validation first
    if (!validateForm()) return;
    try {
      await api.post("/employees", {
        full_name: fullName,
        email,
        department,
      });
      setFullName("");
      setEmail("");
      setDepartment("");
      setFieldErrors({});
      setMessage("Employee created successfully");
      await fetchEmployees();
    } catch (err) {
      // Handle backend validation errors (field-level)
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const backendErrs = {};
        for (const e of data.errors) {
          const key = e.field === "full_name" ? "fullName" : e.field;
          backendErrs[key] = e.message;
        }
        setFieldErrors(backendErrs);
        setError(data.detail || "Please fix the errors below");
      } else {
        setError(data?.detail || "Failed to create employee");
      }
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
        <form onSubmit={handleCreate} noValidate>
          <label>Full Name</label>
          <input
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setFieldErrors((p) => ({ ...p, fullName: undefined })); }}
            placeholder="e.g. Jane Doe"
            className={fieldErrors.fullName ? "input-error" : ""}
          />
          {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}

          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="e.g. jane@example.com"
            className={fieldErrors.email ? "input-error" : ""}
          />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

          <label>Department</label>
          <input
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setFieldErrors((p) => ({ ...p, department: undefined })); }}
            placeholder="e.g. Engineering"
            className={fieldErrors.department ? "input-error" : ""}
          />
          {fieldErrors.department && <p className="field-error">{fieldErrors.department}</p>}

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
