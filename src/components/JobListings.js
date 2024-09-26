import React, { useState, useContext, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import "../style.css";
import SearchBar from "./SearchBar";
import { formatDate } from "../script";
import JobSidebar from "./JobSidebar.js";

import { getFirestore, setDoc, deleteDoc, doc, collection, getDocs } from "firebase/firestore";
import UserContext from '../UserContext';


export default function JobListings() {
    const location = useLocation();
    const { jobListings = [], keyword = "", location: searchLocation = "", workType = "", salary = "" } = location.state || {};
    
    const [sortCriteria, setSortCriteria] = useState('alphabetical'); // Default sort by alphabetical order
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
    const { user } = useContext(UserContext);
    const db = getFirestore();

    // Sort job listings based on criteria
    const sortJobs = (jobs) => {
        switch (sortCriteria) {
            case "alphabetical":
                return jobs.sort((a, b) => a.title.localeCompare(b.title)); // sort alphabetical order
            case 'date':
                return jobs.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted)); // sort by most recent
            default:
                return jobs;
        }
    };

    useEffect(() => {
        const fetchBookmarkedJobs = async () => {
            if (user) {
                try {
                    const bookmarkedSnapshot = await getDocs(collection(db, "users", user.uid, "bookmarkedJobs"));
                    const fetchedBookmarkedJobs = new Set(bookmarkedSnapshot.docs.map(doc => doc.id));
                    console.log("Fetched Bookmarked Jobs:", fetchedBookmarkedJobs); // Log the fetched jobs
                    setBookmarkedJobs(fetchedBookmarkedJobs);
                } catch (error) {
                    console.error("Error fetching bookmarked jobs:", error); // Log any errors
                }
            }
        };
    
        fetchBookmarkedJobs();
    }, [user, db]);
    
    

    // Handle sort change
    const handleSortChange = (e) => {
        setSortCriteria(e.target.value);
    };

    // Get sorted job listings
    const sortedJobs = sortJobs([...jobListings]);

    // Handle job click to show sidebar
    const handleJobClick = (job) => {
        console.log('Selected Job:', job);  // Add this to verify the job object
        setSelectedJob(job);
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
            // Ensure employerId is defined, set to null if not
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
                employerId: job.employerId || null, // Set to null if undefined
                datePosted: job.datePosted
            };
            
            console.log("Job Info to Bookmark:", jobInfo); // Log jobInfo to check values
            
            await setDoc(bookmarkJobRef, jobInfo);
            setBookmarkedJobs(prev => new Set(prev).add(job.id));
        }
    };
    

    return (
    <> 
        <div className="job-listings">
            {/* Search Bar Section */}
            <div className="searchContainer">
                <div className="searchBackgroundImage" alt="search background" style={{ backgroundImage: `url("../images/white-background.jpg")` }}></div>
                <div className="container text-dark p-5">
                    <SearchBar
                        initialKeyword={keyword}
                        initialLocation={searchLocation}
                        initialWorkType={workType}
                        initialSalary={salary}
                    />
                </div>
            </div>

            {/* Job Listings Section */}
            <div className="container mt-5">
                <div className="m-2 d-flex justify-content-between align-items-center text-end">
                    <h1>Jobs</h1>
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
                    sortedJobs.map((job, index) => {
                        // Determine if the job is bookmarked
                        const isBookmarked = user ? bookmarkedJobs.has(job.id) : false;

                        return (
                            <div className="card job-list-card mb-3" key={index} onClick={() => handleJobClick(job)}>
                                <div className="card-body">
                                    {job.employer.logo ? (
                                        <img 
                                            src={job.employer.logo} 
                                            className="logo rounded-circle" 
                                            alt="company logo" 
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <div 
                                            className="logo-placeholder rounded-circle" 
                                            style={{ width: '50px', height: '50px', backgroundColor: '#ddd' }}
                                        >
                                            <span className="placeholder-text">No Logo</span>
                                        </div>
                                    )}
                                    <div className="fs-2 mb-3 float-end">
                                        <button type="button" className="btn rounded-circle bookmark-btn" onClick={() => handleBookmarkClick({...job, isBookmarked})}>
                                            <i className={`bi ${isBookmarked ? 'bi-bookmark-heart-fill' : 'bi-bookmark-heart'}`}></i>
                                        </button>
                                    </div>
                                    <div className="mx-auto p-2">
                                        <h5 className="card-title">{job.title}</h5>
                                        <ul className="list-group list-group-horizontal">
                                            <li className="list-group-item"><p className="card-text">{job.employer.companyName}</p></li>
                                            <li className="list-group-item"><p className="card-text">{job.jobType}</p></li>
                                            <li className="list-group-item"><p className="card-text">Salary: {job.salary}</p></li>
                                            <li className="list-group-item"><p className="card-text">{job.location}</p></li>
                                        </ul>
                                        <p className="card-text mt-5 p-2 float-end">Posted: {formatDate(job.datePosted)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                        <p>No job listings found.</p>
                    )}

                    {/* Sidebar Component */}
                    <JobSidebar 
                        show={showSidebar} 
                        job={selectedJob} 
                        employerData={selectedJob?.employer} 
                        handleClose={() => setShowSidebar(false)} 
                    />
                </div>
            </div>
        </div>
    </>
    );
}
