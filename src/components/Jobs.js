import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { formatDate } from "../script.js";
import JobSidebar from "./JobSidebar.js";
import "../style.css";

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('alphabetical'); // Default sort by alphabetical order
    const db = getFirestore();
    const [employerData, setEmployerData] = useState(null);

    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            const jobsList = [];
            const employersSnapshot = await getDocs(collection(db, 'employers'));

            for (const employerDoc of employersSnapshot.docs) {
                const employerId = employerDoc.id;
                setEmployerData(employerDoc.data());

                // Fetch job advertisements for each employer
                const jobAdsSnapshot = await getDocs(collection(db, `employers/${employerId}/jobAdvertisements`));

                jobAdsSnapshot.forEach((jobAdDoc) => {
                    jobsList.push({
                        employerId,
                        ...jobAdDoc.data(), // Get job data
                    });
                });
            }

            setJobs(jobsList);
        };

        fetchJobs();
    }, [db]);

    const sortJobs = (jobsList) => {
        switch (sortCriteria) {
            case "alphabetical":
                return jobsList.sort((a, b) => a.title.localeCompare(b.title)); // sort alphabetical order
            case 'date':
                return jobsList.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted)); // sort by most recent
            default:
                return jobsList;
        }
    }

    const handleSortChange = (e) => {
        setSortCriteria(e.target.value);
    };

    const sortedJobs = sortJobs([...jobs]);

    if (jobs.length === 0) {
        return <div>Loading jobs...</div>;
    }

    const handleJobClick = (job) => {
        setSelectedJob(job);
        setShowSidebar(true);
    };

    return (
        <>
            <div className="container mt-5">
                <div className="m-2 d-flex justify-content-between align-items-center text-end">
                    <h1>All Job Listings</h1>
                    <div>
                        <label className="me-2" htmlFor="sort">Sort by: </label>
                        <select id="sort" value={sortCriteria} onChange={handleSortChange}>
                            <option value="alphabetical">Alphabetical (A-Z)</option>
                            <option value="date">Date (Newest First)</option>
                        </select>
                    </div>
                </div>

                <div className={`job-container mt-2 ${showSidebar ? 'sidebar-visible' : ''}`}>
                    {sortedJobs.length > 0 ? (
                        sortedJobs.map((job, index) => (
                            <div className="card job-list-card mb-3" onClick={() => handleJobClick(job)} key={index}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <h5 className="card-title">{job.title}</h5>
                                        <button type="button" className="btn rounded-circle bookmark-btn">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bookmark-heart" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"></path>
                                                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <ul className="list-group list-group-horizontal">
                                        <li className="list-group-item">{employerData?.companyName || 'N/A'}</li>
                                        <li className="list-group-item">{job.jobType}</li>
                                        <li className="list-group-item">Salary: {job.salary}k</li>
                                        <li className="list-group-item">{job.location}</li>
                                    </ul>
                                    <p className="card-text mt-5 p-2 float-end">Posted: {formatDate(job.datePosted)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No job listings found.</p>
                    )}
                    {/* Sidebar Component */}
                    <JobSidebar 
                        show={showSidebar} 
                        job={selectedJob} 
                        employerData={employerData} 
                        handleClose={() => setShowSidebar(false)} 
                    />
                </div>
            </div>
        </>
    );
}
