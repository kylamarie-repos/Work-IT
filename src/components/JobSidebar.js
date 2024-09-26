import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../UserContext'; // Adjust the path as needed
import '../style.css'; 
import { formatDate } from '../script';

export default function JobSidebar({ show, job, employerData, handleClose }) {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    
    const handleApplyClick = (job) => {
        console.log("Applying for job:", job);

        if (!user) {
            // Store the job details in state or directly pass it in the navigate
            alert("Please login before applying for jobs");
            navigate('/LoginSignUp', { state: { fromJob: job } });
        } else {
            if (job && job.id && job.employer && employerData.id) {
                navigate(`/apply/${job.id}`, { state: { job: { 
                    id: job.id, 
                    title: job.title, 
                    employerId: employerData.id, 
                    employer: job.employer, 
                    companyName: employerData.companyName, 
                    datePosted: job.datePosted 
                } } });
            } else {
                console.error("Job ID or Employer ID is missing!", { jobId: job?.id, employerId: employerData.id });
            }
        }
    };

    const qualifications = Array.isArray(job?.qualifications) ? job.qualifications : [];
    const experiences = Array.isArray(job?.experiences) ? job.experiences : [];
    const responsibilities = Array.isArray(job?.responsibilities) ? job.responsibilities : [];
    const questions = Array.isArray(job?.questions) ? job.questions : [];

    return (
        <div className={`sidebar p-3 text-dark bg-light right-sidebar ${show ? 'show' : ''}`}>
            <div className="right-sidebar-content container">
                <div className='float-end close-btn rounded-circle'>
                    <button type="button" className="btn btn-lg" onClick={handleClose} aria-label="Close Sidebar">&times;</button>
                </div>
                {job && job.title ? (
                    <div className='container' key={job.id}>
                        <h2>{job.title || 'Job Title Unavailable'}</h2>
                        <h5>{job.employer?.companyName}</h5>
                        <p className='float-end'>Date Posted: {formatDate(job.datePosted) || 'Unknown'}</p>
                        <div className='row'>
                            <div className='col-md-2'>
                                {job.employer?.logo ? (
                                    <img 
                                        src={job.employer.logo} 
                                        className="logo" 
                                        alt="company logo" 
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <div 
                                        className="logo-placeholder" 
                                        style={{ width: '50px', height: '50px', backgroundColor: '#ddd' }}
                                    >
                                        <span className="placeholder-text">No Logo</span>
                                    </div>
                                )}
                            </div>
                            <div className='col-md-7'>
                                <ul className="list-group list-group-horizontal">
                                    <li className="list-group-item">
                                        <p>{employerData?.companyName || 'Unknown Company'}</p>
                                    </li>
                                    <li className="list-group-item">
                                        <p>{job.location || 'Location Unavailable'}</p>
                                    </li>
                                </ul>
                                <ul className="list-group list-group-horizontal">
                                    <li className="list-group-item">
                                        <p>{job.jobType || 'Job Type Unavailable'}</p>
                                    </li>
                                    <li className="list-group-item">
                                        <p>{job.salary ? `${job.salary}` : 'Salary Unavailable'}</p>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <p>Description: {job.description || 'Description Unavailable'}</p>

                        <div className="list-group list-group-flush">
                            <p>Qualifications</p>
                            <ul>
                                {qualifications.length > 0 ? qualifications.map((qualification, index) => (
                                    <li className='list-group-item' key={qualification}>{qualification}</li>
                                )) : <li className='list-group-item'>No qualifications listed</li>}
                            </ul>
                        </div>

                        <div className="list-group list-group-flush">
                            <p>Experience:</p>
                            <ul>
                                {experiences.length > 0 ? experiences.map((experience, index) => (
                                    <li className='list-group-item' key={experience}>{experience}</li>
                                )) : <li className='list-group-item'>No experience listed</li>}
                            </ul>
                        </div>

                        <div className="list-group list-group-flush">
                            <p>Responsibilities</p>
                            <ul>
                                {responsibilities.length > 0 ? responsibilities.map((responsibility, index) => (
                                    <li className='list-group-item' key={responsibility}>{responsibility}</li>
                                )) : <li className='list-group-item'>No responsibilities listed</li>}
                            </ul>
                        </div>
                        
                        <div className="list-group list-group-flush">
                            <p>Employer Questions</p>
                            <code>Please answer in your cover letter</code>
                            <ul>
                                {questions.length > 0 ? questions.map((question, index) => (
                                    <li className='list-group-item' key={question}>{question}</li>
                                )) : <li className='list-group-item'>No questions provided</li>}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p>Job details not available.</p>
                )}
                <div className='text-center sticky-bottom mx-auto p-2'>
                    <button className='btn btn-primary' onClick={() => handleApplyClick(job)} disabled={!job || !job.id}>
                        Apply Now!
                    </button>
                </div>
            </div>
        </div>
    );
}
