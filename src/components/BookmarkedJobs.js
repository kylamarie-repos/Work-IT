import React, { useEffect, useState, useContext } from "react";
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs, collection, getDoc, doc, deleteDoc } from "firebase/firestore";
import JobSidebar from "./JobSidebar.js";
import { formatDate } from "../script.js";
import UserContext from '../UserContext';

export default function BookmarkedJobs() {
    const [jobs, setJobs] = useState([]);
    const auth = getAuth();
    const db = getFirestore();

    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedEmployer, setSelectedEmployer] = useState(null);

    const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());

    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const employersSnapshot = await getDocs(collection(db, 'employers'));
                    const employerDataMap = {};
                    employersSnapshot.docs.forEach((employerDoc) => {
                        employerDataMap[employerDoc.id] = employerDoc.data();
                    });

                    const jobAppsSnapshot = await getDocs(collection(db, `users/${user.uid}/bookmarkedJobs`));
                    const jobsList = jobAppsSnapshot.docs.map((jobAppDoc) => {
                        const jobData = jobAppDoc.data();
                        const employer = employerDataMap[jobData.employerId] || null;

                        console.log("Job Data:", jobData);
                        return {
                            ...jobData,
                            id: jobAppDoc.id,
                            employer,
                            datePosted: jobData.datePosted || null
                        };
                    });

                    console.log("Fetched Jobs:", jobsList);
                    setJobs(jobsList);
                } catch (error) {
                    console.error("Error fetching bookmarked jobs: ", error);
                }
            } else {
                setJobs([]);
            }
        };

        fetchUserInfo();
    }, [auth, db]);
    

    const handleJobClick = async (job) => {
        if (!job.employerId) {
            console.log("Cannot find employerID");
            return;
        } else if (!job.employer) {
            console.log("Cannot find employer");
            return;
        }else if (!job.id) {
            console.log("Cannot find job id");
            return;
        } else {
            setSelectedJob(job);
            
            try {
                const employerDocRef = doc(db, "employers", job.employerId);
                const employerDoc = await getDoc(employerDocRef);
                
                if (employerDoc.exists()) {
                    const employerInfo = employerDoc.data();
                    setSelectedEmployer({ id: employerDoc.id, ...employerInfo });
                } else {
                    console.log("No such employer found!");
                }
            } catch (error) {
                console.error("Error fetching employer data: ", error);
            }

            console.log(selectedEmployer);
    
            setShowSidebar(true);
        }
    };

    const handleBookmarkClick = async (job) => {
        if (!user) {
            alert("Please log in before bookmarking jobs");
            return;
        }

        const bookmarkJobRef = doc(db, "users", user.uid, "bookmarkedJobs", job.id);
    
        try {
            if (bookmarkedJobs.has(job.id)) {
                // If already bookmarked, remove it
                await deleteDoc(bookmarkJobRef);
                setBookmarkedJobs(prev => {
                    const updated = new Set(prev);
                    updated.delete(job.id);
                    return updated;
                });
            } else {
                console.log("Cannot find a valid bookmarked job");
            }

            setJobs(prevJobs => prevJobs.filter((j) => j.id !== job.id));
        } catch {
            console.error("Error trying to toggle bookmark");
        }
    };
    
    
    
    return (
        <>
            <div className="container">
                <h3>Bookmarked Jobs</h3>
                <br />
                {jobs.length === 0 ? (
                    <p>No bookmarked jobs found.</p>
                ) : (
                    jobs.map((job, index) => (
                        <div className="card" onClick={() => handleJobClick(job)} key={job.id}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <h5 className="card-title">{job.title}</h5>
                                    <button 
                                        type="button" 
                                        className="btn rounded-circle bookmark-btn" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents click event from bubbling up to the card
                                            handleBookmarkClick({ ...job });
                                        }}
                                    >
                                        <i className="bi bi-bookmark-heart-fill"></i>
                                    </button>

                                </div>
                                <h6 className="card-text">{job.companyName}</h6>
                                <p className="card-text">{job.jobType}</p>
                                <p className="card-text">{job.location}</p>
                                <p className="card-text">{job.salary}</p>
                                <p className="card-text">{job.field}</p>
                                <p className="card-text mt-5 p-2 float-end">Posted: {formatDate(job.datePosted)}</p>

                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Sidebar Component */}
            <JobSidebar 
                show={showSidebar} 
                job={selectedJob} 
                employerData={selectedEmployer}
                handleClose={() => setShowSidebar(false)} 
            />
        </>
    );
}
