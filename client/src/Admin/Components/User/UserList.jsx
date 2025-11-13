import React, { useMemo, useState } from "react";
import { useUsers } from "../../Context/UserContext";
import BackButton from "../BackButton";
import DataTable from "react-data-table-component";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "../../Styles/Users/UserList.module.css";

export default function UserList() {
    const { users, setUsers, loading } = useUsers();
    const [filterText, setFilterText] = useState("");

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
                setUsers((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
                );
            } else {
                alert("Failed to update status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // ✅ Filtered users for search
    const filteredUsers = users.filter((user) =>
        Object.values(user)
            .join(" ")
            .toLowerCase()
            .includes(filterText.toLowerCase())
    );

    const columns = useMemo(
        () => [
            { name: "#", selector: (row, i) => i + 1, width: "70px" },
            { name: "Full Name", selector: (row) => row.user_fullname, sortable: true },
            { name: "Username", selector: (row) => row.user_name, sortable: true },
            { name: "Email", selector: (row) => row.user_email, sortable: true },
            { name: "Contact", selector: (row) => row.user_contact, sortable: true },
            {
                name: "Registered On",
                selector: (row) =>
                    new Date(row.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    }),
                sortable: true,
            },
            {
                name: "Status",
                center: true,
                cell: (row) => (
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="form-check form-switch">
                            <input
                                type="checkbox"
                                className={`form-check-input ${row.status === "Active"
                                    ? "bg-success border-success"
                                    : "bg-secondary border-secondary"
                                    }`}
                                checked={row.status === "Active"}
                                onChange={() => handleStatusChange(row.id, row.status)}
                            />
                        </div>
                        <span
                            className={`ms-2 fw-semibold ${row.status === "Active"
                                ? "text-success"
                                : "text-secondary"
                                }`}
                        >
                            {row.status}
                        </span>
                    </div>
                ),
            },
        ],
        []
    );

    const customStyles = {
        table: {
            style: { backgroundColor: "white", borderRadius: "12px", overflow: "hidden" },
        },
        headCells: {
            style: {
                background: "linear-gradient(90deg, #1E3A8A 0%, #1E40AF 100%)",
                color: "white",
                fontWeight: 600,
                fontSize: "15px",
                textTransform: "uppercase",
            },
        },
        cells: {
            style: {
                fontSize: "14px",
                padding: "14px 16px",
                color: "#1E293B",
            },
        },
        rows: {
            highlightOnHoverStyle: {
                backgroundColor: "#EFF6FF",
                borderBottomColor: "#DBEAFE",
                transitionDuration: "0.25s",
            },
        },
        pagination: {
            style: {
                color: "#1E3A8A",
                fontWeight: 500,
                fontSize: "14px",
                borderTop: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
            },
        },
    };

    if (loading) {
        return (
            <div className="text-center py-5 text-muted">
                Loading users...
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.header}>
                <BackButton to="/admin-dashboard" label="Back to Dashboard" />
                <h4 className={styles.pageTitle}>
                    <i className="bi bi-people-fill me-2"></i>User Management
                </h4>
            </div>

            {/* Search */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by name, email, or username..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
                <i className={`bi bi-search ${styles.searchIcon}`}></i>
            </div>

            {/* DataTable */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-3">
                    <DataTable
                        columns={columns}
                        data={filteredUsers}
                        pagination
                        highlightOnHover
                        striped
                        dense
                        customStyles={customStyles}
                        paginationPerPage={8}
                        paginationRowsPerPageOptions={[5, 8, 15, 25]}
                        noDataComponent={
                            <div className="text-muted py-3">
                                No users found matching your search.
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
