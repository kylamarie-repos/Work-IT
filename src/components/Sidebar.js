import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import "../style.css";

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
					const employerDocRef = doc(db, "employers", user.uid);
					const docSnap = await getDoc(employerDocRef);

					if (docSnap.exists()) {
						setCompanyName(docSnap.data().companyName || 'Employer Dashboard');
						setLoading(false);
					} else {
						console.error("Employer document does not exist.");

						// Check sessionStorage to prevent infinite reload
						const hasReloaded = sessionStorage.getItem('hasReloaded');
						if (!hasReloaded) {
							// Poll for document creation every 5 seconds
							const intervalId = setInterval(async () => {
								const docSnap = await getDoc(employerDocRef);
								if (docSnap.exists()) {
									console.log('Employer document detected, reloading...');
									clearInterval(intervalId); // Stop polling
									sessionStorage.setItem('hasReloaded', 'true'); // Mark reload
									window.location.reload(); // Force page reload
								}
							}, 5000); // Poll every 5 seconds
						}
					}
				} catch (error) {
					console.error("Error fetching company name:", error);
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
			{/* Sidebar for large screens */}
			<div className="sidebar p-3 text-white bg-dark border-top d-none d-md-block"
				style={{ width: '250px', height: '100vh', position: 'fixed' }}>
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

			{/* Sidebar for mobile devices */}
			<div className="d-md-none fixed-bottom bg-dark p-2">
				<div className="nav justify-content-around">
					<Link to="/employer/Dashboard" className="nav-link text-white">
						<i className="bi bi-house-door"></i>
					</Link>
					<Link to="/employer/EmployerJobs" className="nav-link text-white">
						<i className="bi bi-briefcase"></i>
					</Link>
					<Link to="/employer/Candidates" className="nav-link text-white">
						<i className="bi bi-person-fill"></i>
					</Link>
					<Link onClick={handleLogout} className="nav-link text-white">
						<i className="bi bi-box-arrow-right"></i>
					</Link>
				</div>
			</div>
		</>
	);
}
