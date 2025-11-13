// src/context/UserContext.js
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <UserContext.Provider value={{ users, setUsers, loading, fetchUsers }}>
            {children}
        </UserContext.Provider>
    );
}

// custom hook for easy use
export const useUsers = () => useContext(UserContext);
