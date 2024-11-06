import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import EmployerJobModal from './EmployerJobModal';
import { getAuth } from 'firebase/auth';
import { formatDate } from "../script";

export default function EmployerJobs() {
	const auth = getAuth();
	const [userUid, setUserUid] = useState('');
	const [employerData, setEmployerData] = useState(null);
	const [jobs, setJobs] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedJob, setSelectedJob] = useState(null);

	useEffect(() => {
		const fetchUserUid = () => {
			const user = auth.currentUser;
			if (user) {
				setUserUid(user.uid);
			}
		};
		fetchUserUid();
	}, [auth]);

	useEffect(() => {
		if (userUid) {
			const fetchEmployerDataAndJobs = async () => {
				try {
					const employerDocRef = doc(db, 'employers', userUid);
					const employerDocSnap = await getDoc(employerDocRef);
					if (employerDocSnap.exists()) {
						setEmployerData(employerDocSnap.data());
					}
					const jobsQuery = query(collection(db, 'employers', userUid, 'jobAdvertisements'));
					const jobsSnapshot = await getDocs(jobsQuery);
					const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
					setJobs(jobsList);
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchEmployerDataAndJobs();
		}
	}, [userUid]);

	const handleEditClick = (job) => {
		setSelectedJob(job);
		setShowModal(true);
	};

	const handleAddJobClick = () => {
		setSelectedJob(null);
		setShowModal(true);
	};

	const handleJobUpdate = async (updatedJob) => {
		try {
			if (!userUid || !selectedJob) return;
			const jobDocRef = doc(db, 'employers', userUid, 'jobAdvertisements', selectedJob.id);
			await updateDoc(jobDocRef, updatedJob);
			const jobsQuery = query(collection(db, 'employers', userUid, 'jobAdvertisements'));
			const jobsSnapshot = await getDocs(jobsQuery);
			const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			setJobs(jobsList);
		} catch (error) {
			console.error('Error updating job:', error);
		}
	};

	const handleJobDelete = async (jobId) => {
		try {
			if (!userUid) return;
			const jobDocRef = doc(db, 'employers', userUid, 'jobAdvertisements', jobId);
			await deleteDoc(jobDocRef);
			const jobsQuery = query(collection(db, 'employers', userUid, 'jobAdvertisements'));
			const jobsSnapshot = await getDocs(jobsQuery);
			const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			setJobs(jobsList);
		} catch (error) {
			console.error('Error deleting job:', error);
		}
	};

	const handleAddJob = async () => {
		try {
			if (!userUid) return;
			const jobsQuery = query(collection(db, 'employers', userUid, 'jobAdvertisements'));
			const jobsSnapshot = await getDocs(jobsQuery);
			const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			setJobs(jobsList);
		} catch (error) {
			console.error('Error fetching jobs:', error);
		}
	};

	return (
		<div className="mt-4">
			<div className="row mb-3">
				<div className="col-md-4 mt-2">
					<div className="card h-100 create-job-card align-items-center justify-content-center shadow" id='job-listing-card' onClick={handleAddJobClick}>
						<div className="card-body text-center mt-5">
							<h5 className="card-title">Create New Job Listing</h5>
							<p className="card-text">Click here to add a new job advertisement.</p>
							<h1 className='display-3'>+</h1>
						</div>
					</div>
				</div>
				{jobs.length > 0 && jobs.map(job => (
					<div key={job.id} className="col-md-4 mt-2" id='job-listing-card'>
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
				employerData={employerData}
				onJobUpdate={handleJobUpdate}
				onJobAdd={handleAddJob}
			/>
		</div>
	);
}
