import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import "../style.css"

export default function Sidebar() {
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchCompanyName = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    // Fetch the employer document from the "employers" collection
                    const userDoc = await getDoc(doc(db, "employers", user.uid));
                    if (userDoc.exists()) {
                        setCompanyName(userDoc.data().companyName || 'Employer Dashboard');
                    } else {
                        console.error("Employer document does not exist.");
                    }
                } catch (error) {
                    console.error("Error fetching company name:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCompanyName();
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
            <Link to="/employer/Dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">{loading ? 'Loading...' : companyName}</span>
            </Link>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className={`nav-item mt-3 ${location.pathname === '/employer/Dashboard' ? 'active' : ''}`}>
                    <Link to="/employer/Dashboard" className="sidebar-nav-link">
                        Dashboard
                    </Link>
                </li>
                <li className={`nav-item mt-3 ${location.pathname === '/employer/EmployerJobs' ? 'active' : ''}`}>
                    <Link to="/employer/EmployerJobs" className="sidebar-nav-link">
                        Jobs
                    </Link>
                </li>
                <li className={`nav-item mt-3 ${location.pathname === '/employer/Candidates' ? 'active' : ''}`}>
                    <Link to="/employer/Candidates" className="sidebar-nav-link">
                        Candidates
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
