import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase';

export default function FeaturedJobs()
{
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const fetchJobs = async () => {
            const querySnapshot = await getDocs(collection(db, "job-advertisements"));
            const jobsList = querySnapshot.docs.map(doc => doc.data());
            setJobs(jobsList);
        };

        fetchJobs();
    }, []);


    return(
        <>
        <section className="container mt-5">
            <h2 className="mb-4">Featured Jobs</h2>
            <sub>not yet implemented</sub>
            <div className="row">
                {jobs.map((job, index) => (
                    <div key={index} className="col-md-4 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{job.name}</h5>
                                <p className="card-text">{job.company}</p>
                                <p className="card-text"><small className="text-muted">{job.location}</small></p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
        </>
    );
}