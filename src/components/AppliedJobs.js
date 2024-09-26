import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { formatDate } from "../script";

export default function AppliedJobs() {
    const [jobs, setJobs] = useState([]); // State for applied jobs
    
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDoc);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setJobs(data.AppliedJobs || []); // Set applied jobs from user data
                }

                // Fetch applied jobs separately from the user's appliedJobs collection
                const jobAppsSnapshot = await getDocs(collection(db, `users/${user.uid}/appliedJobs`));
                const jobsList = jobAppsSnapshot.docs.map(jobAppDoc => {
                    const jobData = jobAppDoc.data();
                    return {
                        date: jobData.applicationDate ? jobData.applicationDate.toDate().toLocaleDateString() : "N/A", // Convert Firestore timestamp
                        appliedRole: jobData.appliedRole,
                        coverLetter: jobData.coverLetter,
                        status: jobData.status,
                        companyName: jobData.companyName,
                        ...jobData, // Get additional job data
                    };
                });

                setJobs(jobsList); // Update jobs state with the fetched jobs
            }
        };

        fetchUserInfo();
    }, [auth.currentUser, db]);

    return (
        <div className="container">
            <h3>Applied Jobs:</h3>
            <br />
            {jobs.length === 0 ? (
                <p>No applied jobs found.</p> // Handle case when no jobs are found
            ) : (
                jobs.map((job, index) => (
                    <div className="card" key={index}>
                        <div className="card-body">
                            <h5 className="card-title">{job.appliedRole}</h5>
                            <p className="card-text">Company: {job.companyName ? job.companyName : "N/A"}</p> {/* Company Name */}
                            <p className="card-text">You applied on the: {job.date}</p> {/* Display formatted date */}
                            <p className="card-text">
                                {job.resume ? "Resume was provided" : "No resume provided"} {/* Check if resume exists */}
                            </p>
                            <p className="card-text">
                                {job.coverLetter ? "Cover Letter was provided" : "No cover letter provided"} {/* Check if cover letter exists */}
                            </p>
                            <div className="justify-content-between">
                            <p className="card-text">Status: {job.status}</p>
                            <p className="card-text">Date Posted: {formatDate(job.datePosted)}</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
