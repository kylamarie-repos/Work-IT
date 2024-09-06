import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import EmployerJobModal from './EmployerJobModal';
import { getAuth } from 'firebase/auth';
import { formatDate } from "../script";

export default function EmployerJobs() {
    const auth = getAuth();
    const [currentUserUid, setCurrentUserUid] = useState('');
    const [employerData, setEmployerData] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchCurrentUserUid = () => {
            const user = auth.currentUser;
            if (user) {
                setCurrentUserUid(user.uid);
            }
        };

        fetchCurrentUserUid();
    }, [auth]);

    useEffect(() => {
        if (currentUserUid) {
            const fetchEmployerDataAndJobs = async () => {
                try {
                    const employerDocRef = doc(db, 'employers', currentUserUid);
                    const employerDocSnap = await getDoc(employerDocRef);
                    if (employerDocSnap.exists()) {
                        setEmployerData(employerDocSnap.data());
                    }

                    const jobsQuery = query(collection(db, 'employers', currentUserUid, 'jobAdvertisements'));
                    const jobsSnapshot = await getDocs(jobsQuery);
                    const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setJobs(jobsList);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchEmployerDataAndJobs();
        }
    }, [currentUserUid]);

    const handleEditClick = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    const handleAddJobClick = () => {
        setSelectedJob(null); // Ensure that we're adding a new job, not editing an existing one
        setShowModal(true);
    };

    const handleJobUpdate = async (updatedJob) => {
        try {
            if (!currentUserUid || !selectedJob) return;

            const jobDocRef = doc(db, 'employers', currentUserUid, 'jobAdvertisements', selectedJob.id);
            await updateDoc(jobDocRef, updatedJob);
            // Refresh the job list
            const jobsQuery = query(collection(db, 'employers', currentUserUid, 'jobAdvertisements'));
            const jobsSnapshot = await getDocs(jobsQuery);
            const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJobs(jobsList);
        } catch (error) {
            console.error('Error updating job:', error);
        }
    };

    const handleJobDelete = async (jobId) => {
        try {
            if (!currentUserUid) return;

            const jobDocRef = doc(db, 'employers', currentUserUid, 'jobAdvertisements', jobId);
            await deleteDoc(jobDocRef);
            // Refresh the job list
            const jobsQuery = query(collection(db, 'employers', currentUserUid, 'jobAdvertisements'));
            const jobsSnapshot = await getDocs(jobsQuery);
            const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJobs(jobsList);
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    return (
        <div className="mt-4">
            <div className="row mb-3">
                <div className="col-md-4">
                    <div className="card h-100 create-job-card align-items-center justify-content-center shadow" onClick={handleAddJobClick}>
                        <div className="card-body text-center mt-5">
                            <h5 className="card-title">Create New Job Listing</h5>
                            <p className="card-text">Click here to add a new job advertisement.</p>
                            <h1 className='display-3'>+</h1>
                        </div>
                    </div>
                </div>
                {jobs.length > 0 && jobs.map(job => (
                    <div key={job.id} className="col-md-4">
                        <div className="card h-100 job-card shadow">
                            <div className="card-body">
                                <div className='d-flex float-end flex-column m-2'>
                                    <button className="btn btn-secondary" onClick={() => handleEditClick(job)}>Edit</button>
                                    <button className="btn btn-danger mt-2" onClick={() => handleJobDelete(job.id)}>Delete</button>
                                </div>
                                <img src={employerData.logo} className="logo rounded-circle" alt="company logo" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                <h5 className="card-title">{job.title}</h5>
                                <p className="card-text">Posted: {formatDate(job.datePosted)}</p>
                                <ul className='list-group list-group-horizontal'>
                                    <li className='list-group-item'><p className="card-text">Location: {job.location}</p></li>
                                    <li className='list-group-item'><p className="card-text">Experience: {job.experience}</p></li>
                                    <li className='list-group-item'><p className="card-text">Qualification: {job.qualification}</p></li>
                                </ul>
                                <div className="d-flex justify-content-between mt-5">
                                    <span>{job.numApplications} Applications</span>
                                    <span>{job.numApplicationsLastWeek} in the last week</span>
                                </div>
                            </div>
                            <div className="card-line" style={{ borderLeft: '5px solid #ff6600', position: 'absolute', top: 0, bottom: 0, left: 0, width: '5px' }}></div>
                        </div>
                    </div>
                ))}
            </div>
            <EmployerJobModal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                job={selectedJob}
                onJobUpdate={handleJobUpdate}
            />
        </div>
    );
}
