import React, { useEffect, useState, useContext } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { formatDate } from "../script.js";
import JobSidebar from "./JobSidebar.js";
import UserContext from '../UserContext';
import "../style.css";

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('alphabetical'); // Default sort by alphabetical order
    const db = getFirestore();

    const { user } = useContext(UserContext);
    
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const [employerData, setEmployerData] = useState(null);
    const [selectedEmployer, setSelectedEmployer] = useState(null);

    const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());


    useEffect(() => {
        const fetchJobs = async () => {
            const jobsList = [];
            const employersSnapshot = await getDocs(collection(db, 'employers'));

            // Create a map for employer data to easily access it later
            const employerDataMap = {};
            employersSnapshot.docs.forEach((employerDoc) => {
                const employerId = employerDoc.id;
                const employerData = employerDoc.data();
                employerDataMap[employerId] = employerData;
            });

            // If the user is logged in, fetch their bookmarked jobs
            if (user) {
                const bookmarkedSnapshot = await getDocs(collection(db, "users", user.uid, "bookmarkedJobs"));
                setBookmarkedJobs(new Set(bookmarkedSnapshot.docs.map(doc => doc.id)));
            }

            // Now set employerData once all employers are fetched
            setEmployerData(employersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch job advertisements for each employer
            for (const employerId in employerDataMap) {
                const jobAdsSnapshot = await getDocs(collection(db, `employers/${employerId}/jobAdvertisements`));

                jobAdsSnapshot.forEach((jobAdDoc) => {
                    jobsList.push({
                        id: jobAdDoc.id,
                        employerId,
                        employer: employerDataMap[employerId], // Attach employer data directly to the job
                        ...jobAdDoc.data(), // Get job data
                        isBookmarked: user ? bookmarkedJobs.has(jobAdDoc.id) : false,  // Check if the job is bookmarked
                    });
                });
            }

            setJobs(jobsList); // Set jobs once all jobs are fetched
        };

        fetchJobs();
    }, [db, user, bookmarkedJobs]);

    const sortJobs = (jobsList) => {
        return [...jobsList].sort((a, b) => {
            switch (sortCriteria) {
                case "alphabetical":
                    return a.title.localeCompare(b.title); // sort alphabetical order
                case 'date':
                    return new Date(b.datePosted) - new Date(a.datePosted); // sort by most recent
                default:
                    return 0;
            }
        });
    };

    const handleSortChange = (e) => {
        setSortCriteria(e.target.value);
    };

    const sortedJobs = sortJobs([...jobs]);

    if (jobs.length === 0) {
        return <div>Loading jobs...</div>;
    }

    const handleJobClick = (job) => {
        setSelectedJob(job);
        const employerId = job.employerId; // Get the employer ID from the clicked job
        const employerInfo = employerData.find(employer => employer.id === employerId); // Find the employer info
        setSelectedEmployer(employerInfo); // Set the selected employer info
        setShowSidebar(true);
    };

    const handleBookmarkClick = async (job) => {
        if (!user) {
            alert("Please log in before bookmarking jobs");
            return;
        }

        const bookmarkJobRef = doc(db, "users", user.uid, "bookmarkedJobs", job.id);

        if (job.isBookmarked) {
            // Remove bookmark
            await deleteDoc(bookmarkJobRef);
            setBookmarkedJobs(prev => {
                const updated = new Set(prev);
                updated.delete(job.id);
                return updated;
            });
        } else {
            // Add bookmark
            const jobInfo = {
                title: job.title,
                description: job.description,
                field: job.field,
                location: job.location,
                salary: job.salary,
                jobType: job.jobType,
                qualifications: job.qualifications,
                experiences: job.experiences,
                responsibilities: job.responsibilities,
                questions: job.questions,
                companyName: job.companyName,
                employerId: job.employerId,
                datePosted: job.datePosted
            };
            await setDoc(bookmarkJobRef, jobInfo);
            setBookmarkedJobs(prev => new Set(prev).add(job.id));
        }
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
                                        <button type="button" className="btn rounded-circle bookmark-btn" onClick={() => handleBookmarkClick(job)}>
                                            <i className={`bi ${job.isBookmarked ? 'bi-bookmark-heart-fill' : 'bi-bookmark-heart'}`}></i>
                                        </button>
                                    </div>
                                    <ul className="list-group list-group-horizontal">
                                        <li className="list-group-item">{job.employer.companyName || 'N/A'}</li>
                                        <li className="list-group-item">{job.jobType}</li>
                                        <li className="list-group-item">Salary: {job.salary}</li>
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
                        employerData={selectedEmployer} // Pass the specific employer data for the selected job
                        handleClose={() => setShowSidebar(false)} 
                    />
                </div>
            </div>
        </>
    );
}
