import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ApplicationForm() {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();
    const location = useLocation();
    const navigate = useNavigate();

    const { job } = location.state || {};
    const companyName = job?.companyName;
    const datePosted = job?.datePosted;
    const user = auth.currentUser;

    const [promptMessage, setPromptMessage] = useState('');
    const [skills, setSkills] = useState([]);
    const [applicantName, setApplicantName] = useState('');
    const [coverLetterUrl, setCoverLetterUrl] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [coverLetterType, setCoverLetterType] = useState('written'); // 'written' or 'uploaded'
    const [resumeUrl, setResumeUrl] = useState(''); // State for resume URL

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {
                const userDoc = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCoverLetterUrl(data.coverLetterUrl || '');
                    setResumeUrl(data.resumeUrl || ''); // Get resume URL from user profile
                    setSkills(data.skills || []);
                    setApplicantName(`${data.firstName || ''} ${data.lastName || ''}`);
                } else {
                    setPromptMessage('Please complete your profile by adding your personal information.');
                }
            }
        };

        fetchUserInfo();
    }, [user, db]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !job) {
            console.error('User or job information is missing.');
            return;
        }

        // Check if resume URL is valid before submitting
        if (!resumeUrl) {
            alert("You must upload a resume before applying.");
            return;
        }

        let coverLetterToUpload = coverLetter;
        if (coverLetterType === 'uploaded' && coverLetterUrl) {
            coverLetterToUpload = coverLetterUrl; // Use the uploaded cover letter URL
        }

        const applicationData = {
            name: applicantName,
            resume: resumeUrl,  // Use resume URL from user's profile
            coverLetter: coverLetterToUpload,
            status: 'Applied',
            skills,
            appliedRole: job.title,
            companyName,
            applicationDate: new Date(),
            datePosted,
            email: user.email // Store the user's email in the application data
        };

        try {
            const employerId = job?.employerId;
            if (!employerId) {
                console.error('Employer ID is missing!');
                return;
            }

            const candidatesRef = doc(db, 'employers', employerId, 'candidates', `${user.uid}_${job.id}`);
            await setDoc(candidatesRef, applicationData);

            const appliedJobsRef = doc(db, 'users', user.uid, 'appliedJobs', job.id);
            await setDoc(appliedJobsRef, applicationData);

            // First, resolve the cover letter URL if it's not already resolved
            let coverLetterResolved = coverLetterToUpload;
            if (coverLetterType === 'uploaded' && coverLetterUrl) {
                // Resolve the cover letter URL from storage
                const coverLetterRef = ref(storage, coverLetterUrl);
                coverLetterResolved = await getDownloadURL(coverLetterRef);
            }

            // Ensure the applicants data is set correctly
            const jobRef = doc(db, 'employers', employerId, 'jobAdvertisements', job.id);

            await updateDoc(jobRef, {
                numApplications: increment(1),
                applicants: {
                    [`${user.uid}`]: {
                        email: user.email,
                        name: applicantName,
                        resume: resumeUrl,
                        coverLetter: coverLetterResolved, // Ensure the resolved cover letter is used
                        appliedRole: job.title,
                        applicationDate: new Date()
                    }
                }
            });

            navigate("/Applied");
        } catch (error) {
            console.error("Error submitting application:", error);
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileName = selectedFile.name || '';
            if (fileName.indexOf('.pdf') !== -1 || fileName.indexOf('.docx') !== -1) {
                // Handle cover letter upload
                const filePath = `${auth.currentUser.uid}/coverLetters/${selectedFile.name}`;
                const storageRef = ref(storage, filePath);
                await uploadBytes(storageRef, selectedFile);
                const url = await getDownloadURL(storageRef);
                setCoverLetterUrl(url);
            } else {
                console.error("Unsupported file type");
            }
        }
    };

    return (
        <div className='container'>
            <div className="card">
                <div className="card-body">
                    <h1>Apply for {job?.title}</h1>
                    <form onSubmit={handleSubmit}>
                        {promptMessage && <p>{promptMessage}</p>}
                        
                        {/* Resume Section */}
                        <div className='resume-box mt-4'>
                            <div>
                                <label>Resume</label>
                                <div>
                                    {resumeUrl ? (
                                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
                                    ) : (
                                        <p>No Resume uploaded.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cover Letter Section */}
                        <div className='coverletter-box mt-4'>
                            <div>
                                <ul className="list-group list-group-horizontal">
                                    <li className="list-group-item">
                                        <input
                                            type="radio"
                                            id="flexRadioDefault1"
                                            className='form-check-input'
                                            value="written"
                                            checked={coverLetterType === 'written'}
                                            onChange={() => setCoverLetterType('written')}
                                        />
                                        <label htmlFor="flexRadioDefault1" className='form-check-label ms-2'>
                                            Write Cover Letter
                                        </label>
                                    </li>
                                    <li className="list-group-item">
                                        <input
                                            type="radio"
                                            id="flexRadioDefault2"
                                            className='form-check-input'
                                            value="uploaded"
                                            checked={coverLetterType === 'uploaded'}
                                            onChange={() => setCoverLetterType('uploaded')}
                                        />
                                        <label htmlFor="flexRadioDefault2" className='form-check-label ms-2'>
                                            Upload Cover Letter
                                        </label>
                                    </li>
                                </ul>
                                {coverLetterType === 'written' ? (
                                    <div className='mt-4'>
                                        <label className='me-4'>Cover Letter</label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Write your cover letter here"
                                            id="floatingTextarea"
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className='mt-4'>
                                        <label>Upload Cover Letter</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            accept=".pdf, .docx"
                                            required
                                        />
                                        <div className='mt-3'>
                                            {coverLetterUrl ? (
                                                <a href={coverLetterUrl} target="_blank" rel="noopener noreferrer">View Cover Letter</a>
                                            ) : (
                                                <p>No Cover Letter uploaded.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <button type="submit" className="btn btn-primary">Apply Now</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
