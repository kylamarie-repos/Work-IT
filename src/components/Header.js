import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "../style.css";

export default function Header() {
    const [user, setUser] = useState(null);
    const [employer, setEmployer] = useState(null);
    const navigate = useNavigate();
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
        <header className="bg-dark text-white py-3 ps-5 pe-5">
            <div className="d-flex justify-content-between align-items-center fixed">
                <Link className="nav-link text-light" aria-current="page" to="/">
                    <img src="../images/clear-logo.png" alt="Logo" id="logo" className="d-inline-block align-text-top" />
                </Link>
                <nav>
                    <ul className="nav">
                        <li className="nav-item">
                            <Link to="/" className="nav-link text-light">Jobs</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/Companies" className="nav-link text-light">Companies</Link>
                        </li>
                        {/* <li className="nav-item">
                            <Link to="/AddField" className="nav-link text-light">Add Field</Link>
                        </li> */}
                        {user && (
                            <li className="nav-item dropdown">
                                <Link className="nav-link dropdown-toggle text-light" to="/ProfilePage" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Profile
                                </Link>
                                <ul className="dropdown-menu bg-dark" aria-labelledby="profileDropdown">
                                    <li><Link className="dropdown-item text-light" to="/ProfilePage">View Profile</Link></li>
                                    <li><Link className="dropdown-item text-light" to="/AppliedJobs">Applied Jobs</Link></li>
                                    <li><Link className="dropdown-item text-light" to="/BookmarkedJobs">Bookmarked Jobs</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-light" onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </li>
                        )}
                        {!user && employer && (
                            <li className="nav-item">
                                <Link className="nav-link text-light" to="/employer/Settings">Settings</Link>
                            </li>
                        )}
                        {!user && employer && (
                            <li className="nav-item">
                                <Link className="icon-link nav-link text-light" to="/employer/Dashboard">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-p-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.5 4.002V12h1.283V9.164h1.668C10.033 9.164 11 8.08 11 6.586c0-1.482-.955-2.584-2.538-2.584zm2.77 4.072c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97z"/>
                                </svg>
                                </Link>
                            </li>
                        )}
                        
                        {!user && !employer && (
                            <li className="nav-item">
                                <Link to="/LoginSignup" className="nav-link text-light border rounded border-primary me-2">Login/Signup</Link>
                            </li>
                        )}
                        {!user && !employer && (
                            <li className="nav-item">
                                <Link to="/EmployerLoginSignup" className="nav-link text-light border rounded border-warning">Employer Login</Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
        </>
    );
}
