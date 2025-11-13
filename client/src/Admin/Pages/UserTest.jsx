import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../Context/UserContext";
import BackButton from "../Components/BackButton";
import DataTable from "react-data-table-component";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "../Styles/Users/UserTest.module.css";

export default function UserTest() {
    const { users, loading } = useUsers();
    const navigate = useNavigate();
    const [filterText, setFilterText] = useState("");

    const handleViewDetails = (userId) => {
        navigate(`/admin-dashboard/user-tests/${userId}`);
    };

    // ✅ Filter search
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
                name: "Action",
                center: true,
                cell: (row) => (
                    <button
                        className={styles.viewBtn}
                        onClick={() => handleViewDetails(row.id)}
                    >
                        <i className="bi bi-eye me-1"></i> View Details
                    </button>
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
                    <i className="bi bi-clipboard-check me-2"></i> User Test Management
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

            {/* Data Table */}
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
