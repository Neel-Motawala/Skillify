import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../Components/BackButton";
import DataTable from "react-data-table-component";

export default function ViewUserTest() {
    const { userId } = useParams();
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    useEffect(() => {
        const fetchUserTests = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/user-test/user/${userId}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setTests(data);
                    setFilteredTests(data);
                } else {
                    setTests([]);
                    setFilteredTests([]);
                }
            } catch (err) {
                console.error("Error fetching user test data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserTests();
    }, [userId]);

    // ✅ Search filter
    useEffect(() => {
        const lower = searchText.toLowerCase();
        const filtered = tests.filter(
            (t) =>
                String(t.course_id).toLowerCase().includes(lower) ||
                String(t.test_type).toLowerCase().includes(lower) ||
                String(t.test_mode).toLowerCase().includes(lower) ||
                String(t.stage).toLowerCase().includes(lower)
        );
        setFilteredTests(filtered);
        setCurrentPage(1);
    }, [searchText, tests]);

    // Pagination slice
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredTests.slice(start, start + rowsPerPage);
    }, [filteredTests, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(filteredTests.length / rowsPerPage);

    const columns = useMemo(
        () => [
            { name: "#", selector: (row, i) => i + 1, width: "60px" },
            { name: "Course ID", selector: (row) => row.course_id, sortable: true },
            { name: "Test Type", selector: (row) => row.test_type, sortable: true },
            { name: "Test Mode", selector: (row) => row.test_mode, sortable: true },
            { name: "Stage", selector: (row) => row.stage, sortable: true },
            {
                name: "Timestamp",
                selector: (row) =>
                    new Date(row.test_created_at).toLocaleString("en-IN", {
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
                        className="btn btn-sm btn-outline-primary fw-semibold d-flex align-items-center"
                        onClick={() =>
                            window.open(
                                `/admin-dashboard/user-tests/${userId}/details/${row.id}`,
                                "_blank"
                            )
                        }
                    >
                        <i className="bi bi-eye me-1"></i> View Result
                    </button>
                ),
            },
        ],
        [userId]
    );

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: "#1e3a8a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                textTransform: "uppercase",
                padding: "12px 16px",
            },
        },
        cells: {
            style: {
                fontSize: "15px",
                color: "#1e293b",
                paddingTop: "12px",
                paddingBottom: "12px",
            },
        },
        rows: {
            highlightOnHoverStyle: {
                backgroundColor: "#f0f4ff",
                transitionDuration: "0.25s",
                borderBottomColor: "#cbd5e1",
            },
        },
    };

    if (loading) {
        return (
            <div className="text-center py-5 text-muted">Loading user test details...</div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <BackButton to="/admin-dashboard/user-tests" label="Back to Users" />
                <h1 className="fw-bold text-primary mb-0 d-flex align-items-center">
                    <i className="bi bi-list-task me-2"></i> User Test Details
                </h1>
            </div>

            {/* Card */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    {/* Top Controls - arranged in one line */}
                    <div
                        className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 px-1 py-2"
                        style={{
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        {/* Rows per page */}
                        <div className="d-flex align-items-center gap-2">
                            <label className="fw-semibold text-secondary mb-3 ms-3">
                                Rows per page:
                            </label>
                            <select
                                className="form-select form-select-sm"
                                style={{
                                    width: "80px",
                                    borderRadius: "6px",
                                    borderColor: "#cbd5e1",
                                    fontSize: "15px",
                                }}
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="5">5</option>
                                <option value="8">8</option>
                                <option value="15">15</option>
                                <option value="25">25</option>
                            </select>
                        </div>

                        {/* Search */}
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Course, Type, Mode, Stage..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{
                                maxWidth: "350px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                fontSize: "15px",
                                padding: "6px 10px",
                            }}
                        />

                        {/* Pagination */}
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-medium text-secondary me-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                            >
                                ⏮
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                ‹
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                ›
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                            >
                                ⏭
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <DataTable
                        columns={columns}
                        data={paginatedData}
                        highlightOnHover
                        dense
                        striped
                        customStyles={customStyles}
                        noDataComponent={
                            <div className="text-muted py-3">
                                No test records found for this user.
                            </div>
                        }
                        pagination={false}
                    />
                </div>
            </div>
        </div>
    );
}
