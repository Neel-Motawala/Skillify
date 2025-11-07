import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    // ✅ reusable fetch function
    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/users");
            const data = await res.json();
            setUsers(data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ✅ handle status change with confirmation and DB update
    const handleStatusChange = async (id, currentStatus) => {
        const confirmChange = window.confirm(
            `Are you sure you want to ${currentStatus === "Active" ? "deactivate" : "activate"} this user?`
        );
        if (!confirmChange) return;

        try {
            const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

            const response = await fetch(`http://localhost:5000/api/users/status/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();
            if (result.success) {
                // alert("Status updated successfully.");
                fetchUsers(); // refresh users after update
            } else {
                alert("Failed to update status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/admin-dashboard`, { replace: true })}
                >
                    <i className="bi bi-arrow-left me-1"></i> Back
                </button>
                <h5 className="fw-semibold text-primary mb-0">User Management</h5>
            </div>

            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body">
                    <table className="table align-middle table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Full Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Contact</th>
                                <th>Registered On</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((u, i) => (
                                    <tr key={u.id}>
                                        <td>{i + 1}</td>
                                        <td className="fw-medium">{u.user_fullname}</td>
                                        <td>{u.user_name}</td>
                                        <td>{u.user_email}</td>
                                        <td>{u.user_contact}</td>
                                        <td>
                                            {new Date(u.timestamp).toLocaleString("en-IN", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </td>
                                        <td className="text-center">
                                            <div className="form-check form-switch d-inline-flex align-items-center">
                                                <input
                                                    className={`form-check-input ${u.status === "Active"
                                                        ? "bg-primary border-primary"
                                                        : "bg-secondary border-secondary"
                                                        }`}
                                                    type="checkbox"
                                                    checked={u.status === "Active"}
                                                    onChange={() =>
                                                        handleStatusChange(
                                                            u.id,
                                                            u.status
                                                        )
                                                    }
                                                />
                                                <span
                                                    className={`ms-2 fw-semibold ${u.status === "Active"
                                                        ? "text-primary"
                                                        : "text-secondary"
                                                        }`}
                                                >
                                                    {u.status === "Active"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
