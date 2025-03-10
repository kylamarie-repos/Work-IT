import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import "../style.css";
import UserContext from '../UserContext';

export default function Sidebar() {
	const [firstName, setFirstName] = useState('unknown');
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const location = useLocation();
	const auth = getAuth();
	const db = getFirestore();

	const { user } = useContext(UserContext);

	useEffect(() => {
		const fetchFirstName = async () => {
			if (user) {
				try {
					const userDoc = await getDoc(doc(db, "users", user.uid));
					if (userDoc.exists()) {
						setFirstName(userDoc.data().firstName);
					} else {
						console.error("User document does not exist. Reloading the page...");
						window.location.reload();
					}
				} catch (error) {
					console.error("Error fetching First name:", error);
				} finally {
					setLoading(false);
				}
			}
		};

		fetchFirstName();
	}, [db, user]);

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
			<div className="sidebar p-3 text-white bg-dark border-top d-none d-md-block" style={{ width: '250px', height: '100vh', position: 'fixed' }}>
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
			<div className="d-md-none fixed-bottom bg-dark p-2">
				<div className="nav justify-content-around">
					<Link to="/user/Dashboard" className="nav-link text-white">
						<i className="bi bi-person-circle"></i>
					</Link>
					<Link to="/user/AppliedJobs" className="nav-link text-white">
						<i className="bi bi-briefcase"></i>
					</Link>
					<Link to="/user/BookmarkedJobs" className="nav-link text-white">
						<i className="bi bi-bookmark"></i>
					</Link>
					<Link to="/user/Settings" className="nav-link text-white">
						<i className="bi bi-gear"></i>
					</Link>
					<Link onClick={handleLogout} className="nav-link text-white">
						<i className="bi bi-box-arrow-right"></i>
					</Link>
				</div>
			</div>
		</>
	);
}
