import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import UserTest from "../Components/TestPage/UserTest";

export default function TestPage() {
    const { userTestId } = useParams();
    const [testDetails, setTestDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user-test/test/${userTestId}`);
                setTestDetails(res.data);
            } catch (err) {
                console.error("Error fetching test details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTestDetails();
    }, [userTestId]);

    if (loading) return <p>Loading...</p>;
    if (!testDetails) return <p>No test found.</p>;

    return (
        <div>
            <UserTest
                userId={testDetails.user_id}
                courseId={testDetails.course_id}
                testType={testDetails.test_type}
                stage={testDetails.stage}
                testMode={testDetails.test_mode}
                userTestId={userTestId}
            />
        </div>
    );
}
