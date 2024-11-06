import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "../style.css";

export default function Header() {
    const [user, setUser] = useState(null);
    const [employer, setEmployer] = useState(null);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUser(user);
                        setEmployer(null);
                    } else {
                        const employerDoc = await getDoc(doc(db, "employers", user.uid));
                        if (employerDoc.exists()) {
                            setEmployer(user);
                            setUser(null);
                        } else {
                            setUser(null);
                            setEmployer(null);
                        }
                    }
                } catch (error) {
                    console.error("Error checking user or employer:", error);
                }
            } else {
                setUser(null);
                setEmployer(null);
            }
        });
        return () => unsubscribe();
    }, [auth, db]);

    return (
        <header className="bg-dark text-white py-3 ps-5 pe-5">
            <nav className="navbar navbar-expand-md navbar-dark">
                <Link className="navbar-brand" to="/">
                    <img src="../images/clear-logo.png" alt="Logo" id="logo" className="d-inline-block align-text-top" />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to="/job-listings" className="nav-link text-light">Search</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/Jobs" className="nav-link text-light">Jobs</Link>
                        </li>
                        {user && (
                            <li className="nav-item ms-4">
                                <Link className="icon-link nav-link text-light" to="/user/Dashboard">
                                    <i id="profileIcon" class="bi bi-person-circle"></i> 
                                </Link>
                            </li>
                        )}
                        {!user && employer && (
                            <li className="nav-item">
                                <Link className="nav-link text-light" to="/employer/Settings">Settings</Link>
                            </li>
                        )}
                        {!user && employer && (
                            <li className="nav-item ms-4">
                                <Link className="icon-link nav-link text-light" to="/employer/Dashboard">
                                    <i id="profileIcon" class="bi bi-person-circle"></i> 
                                </Link>
                            </li>
                        )}
                        {!user && !employer && (
                            <>
                                <li className="nav-item">
                                    <Link to="/LoginSignup" className="nav-link text-light border rounded border-primary me-2">Login/Signup</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/EmployerLoginSignup" className="nav-link text-light border rounded border-warning">Employer Login</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
}
