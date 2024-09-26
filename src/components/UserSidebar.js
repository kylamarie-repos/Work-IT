import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import "../style.css"

export default function Sidebar() {
    const [firstName, setFirstName] = useState('unknown');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchFirstName = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    // Fetch the user document from the "users" collection
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setFirstName(userDoc.data().firstName);
                    } else {
                        console.error("user document does not exist.");
                    }
                } catch (error) {
                    console.error("Error fetching First name:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFirstName();
    }, [auth, db]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/"); // Redirect to home page after logout
        } catch (error) {
            console.error("Logout Error: ", error);
        }
    };


    return (
    <>
        <div 
            className="sidebar p-3 text-white bg-dark border-top" 
            style={{ width: '250px', height: '100vh', position: 'fixed' }}
        >
            <Link to="/user/Dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">Hello, {loading ? 'Loading...' : firstName}!</span>
            </Link>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className={`nav-item mt-3 ${location.pathname === '/user/Dashboard' ? 'active' : ''}`}>
                    <Link to="/user/Dashboard" className="sidebar-nav-link">
                        Profile Page
                    </Link>
                </li>
                <li className={`nav-item mt-3 ${location.pathname === '/user/AppliedJobs' ? 'active' : ''}`}>
                    <Link to="/user/AppliedJobs" className="sidebar-nav-link">
                        Applied Jobs
                    </Link>
                </li>
                <li className={`nav-item mt-3 ${location.pathname === '/user/BookmarkedJobs' ? 'active' : ''}`}>
                    <Link to="/user/BookmarkedJobs" className="sidebar-nav-link">
                        Bookmarked Jobs
                    </Link>
                </li>
                <li className={`nav-item mt-3 ${location.pathname === '/user/Settings' ? 'active' : ''}`}>
                    <Link to="/user/Settings" className="sidebar-nav-link">
                        Settings
                    </Link>
                </li>
            </ul>
            <hr />
            <div>
                <Link onClick={handleLogout} className="text-white text-decoration-none">
                    Log Out
                </Link>
            </div>
        </div>
    </>
    );
}
