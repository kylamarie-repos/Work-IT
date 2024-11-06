import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { formatDate } from '../script';
import "../style.css";

export default function Candidates() {
    const [candidates, setCandidates] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobRoles, setJobRoles] = useState([]);

useEffect(() => {
    const fetchCandidates = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

    try {
        const candidatesCollection = collection(db, 'employers', user.uid, 'candidates');
        const candidateSnapshot = await getDocs(candidatesCollection);
        const candidatesList = candidateSnapshot.docs.map(doc => {
        const candidateData = doc.data();
        const applicationDate = candidateData.applicationDate?.toDate ? candidateData.applicationDate.toDate() : candidateData.applicationDate;
        const datePosted = candidateData.datePosted?.toDate ? candidateData.datePosted.toDate() : candidateData.datePosted;
        return { ...candidateData, id: doc.id, applicationDate, datePosted };
        });
        setCandidates(candidatesList);
        const roles = [...new Set(candidatesList.map(candidate => candidate.appliedRole))];
        setJobRoles(roles);
    } catch (error) {
    console.error('Error fetching candidates:', error);
    }
    };
    fetchCandidates();
}, []);

const handleJobSelection = (role) => {
    setSelectedJob(role);
};

return (
    <div className="candidates-container">
        <nav className="job-nav">
            {jobRoles.map((role) => (
            <button key={role} onClick={() => handleJobSelection(role)} className={`btn ${selectedJob === role ? 'btn-warning' : 'btn-primary'}`}>
                {role}
            </button>
            ))}
        </nav>
        <div className="candidates-list">
            {selectedJob
            ? candidates.filter(candidate => candidate.appliedRole === selectedJob).map((candidate) => (
                <div key={candidate.id} className="candidate-card">
                    <h2>{candidate.name}</h2>
                    <p><strong>Applied Role:</strong> {candidate.appliedRole}</p>
                    <p><strong>Company:</strong> {candidate.companyName}</p>
                    <p><strong>Application Date:</strong> {formatDate(candidate.applicationDate)}</p>
                    <p><strong>Status:</strong> {candidate.status}</p>
                    <p><strong>Cover Letter:</strong> {candidate.coverLetter}</p>
                    <p><strong>Skills:</strong> {candidate.skills.join(", ")}</p>
                    <a href={candidate.resume} target="_blank" rel="noopener noreferrer">View Resume</a>
                    <p><strong>Date Posted:</strong> {formatDate(candidate.datePosted)}</p>
                </div>
                ))
                : <p>Select a job role to see candidates.</p>}
        </div>
    </div>
    );
}
