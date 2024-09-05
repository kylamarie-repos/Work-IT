import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';

import { formatDate } from "../script";

export default function Dashboard() 
{
    const auth = getAuth();
    const [currentUserUid, setCurrentUserUid] = useState('');
    const [employerData, setEmployerData] = useState(null);
    const [jobs, setJobs] = useState([]);

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

    return(
    <>
        <div className='p-3'>
            <h3 className=''>
                Current Openings
            </h3>
            
            <div>
                {jobs.length > 0 && jobs.map(job => (
                    <div key={job.id} className="col-md-4">
                        <div className="card h-100 job-card shadow">
                            <div className="card-body">
                                <div className='d-flex float-end flex-column m-2'>
                                    <Link to="/employer/Jobs"><button className="btn btn-secondary">Go to</button></Link>
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

            <h3 className='mt-5'>
                Candidates
            </h3>
            <div className='card'>
                <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                    <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked />
                    <label className="btn btn-outline-primary" for="btnradio1">Radio 1</label>

                    <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autocomplete="off" />
                    <label className="btn btn-outline-primary" for="btnradio2">Radio 2</label>

                    <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autocomplete="off" />
                    <label className="btn btn-outline-primary" for="btnradio3">Radio 3</label>
                </div>
            </div>

        </div>
    </>
    );
}
