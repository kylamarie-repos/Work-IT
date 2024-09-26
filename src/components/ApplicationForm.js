import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { useNavigate } from "react-router-dom";

export default function ApplicationForm() {
    const auth = getAuth();
    const db = getFirestore();
    const location = useLocation();
    const navigate = useNavigate();

    const { job } = location.state || {};
    const employerId = job?.employerId;
    const companyName = job?.companyName;
    const datePosted = job?.datePosted;
    const user = auth.currentUser;

    const [uploading, setUploading] = useState(false);
    const [promptMessage, setPromptMessage] = useState('');

    const [skills, setSkills] = useState([]);
    const [applicantName, setApplicantName] = useState('');

    const [coverLetterUrl, setCoverLetterUrl] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [uploadedResume, setUploadedResume] = useState(null);
    const [coverLetterType, setCoverLetterType] = useState('written'); // 'written' or 'uploaded'
    const [uploadedCoverLetter, setUploadedCoverLetter] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {
                const userDoc = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCoverLetterUrl(data.coverLetterUrl || '');
                    setResumeUrl(data.resumeUrl || '');
                    setSkills(data.skills || []);
                    setApplicantName(`${data.firstName || ''} ${data.lastName || ''}`);
                    if (data.resumeUrl) {
                        setResumeUrl(data.resumeUrl);
                    }
                } else {
                    setPromptMessage('Please complete your profile by adding your personal information.');
                }
            }
        };
    
        fetchUserInfo();
    }, [user, db, employerId]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!user || !job) {
            console.error('User or job information is missing.');
            return;
        }
    
        let coverLetterToUpload = coverLetter;
        if (coverLetterType === 'uploaded' && uploadedCoverLetter) {
            await uploadFile(uploadedCoverLetter, 'coverLetter');
            coverLetterToUpload = coverLetterUrl; // Set coverLetterUrl after uploading the file
        }
    
        if (uploadedResume && !resumeUrl) {
            await uploadFile(uploadedResume, 'resume');
        }

        const applicationData = {
            name: applicantName,
            resume: resumeUrl || '',
            coverLetter: coverLetterToUpload,
            status: 'Applied',
            skills,
            appliedRole: job.title,
            companyName,
            applicationDate: new Date(),
            datePosted
        };
    
        try {
            const employerId = job.employerId;
            if (!employerId) {
                console.error('Employer ID is missing!');
                return;
            }
    
            const candidatesRef = doc(db, 'employers', employerId, 'candidates', user.uid);
            await setDoc(candidatesRef, applicationData);

            const appliedJobsRef = doc(db, 'users', user.uid, 'appliedJobs', job.id);
            await setDoc(appliedJobsRef, applicationData);
    
            const jobRef = doc(db, 'employers', employerId, 'jobAdvertisements', job.id);
            await updateDoc(jobRef, {
                numApplications: increment(1) // Increment the number of applications by 1
            });


            navigate("/Applied");
        } catch (error) {
            console.error("Error submitting application:", error);
        }
    };
    

    const uploadFile = async (file, fileType) => {
        if (!file) return;

        setUploading(true);
        try {
            const storagePath = fileType === 'coverLetter'
                ? `${auth.currentUser.uid}coverLetters/${auth.currentUser.uid}/${file.name}`
                : `${auth.currentUser.uid}resumes/${auth.currentUser.uid}/${file.name}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            if (fileType === 'coverLetter') {
                setCoverLetterUrl(url);
                await setDoc(doc(db, "users", auth.currentUser.uid), { coverLetterUrl: url });
            } else {
                setResumeUrl(url);
                await setDoc(doc(db, "users", auth.currentUser.uid), { resumeUrl: url });
            }
        } catch (error) {
            console.error(`Error uploading ${fileType}:`, error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e, fileType) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileName = selectedFile.name || '';
            if (fileType === 'coverLetter') {
                if (fileName.indexOf('.pdf') !== -1 || fileName.indexOf('.docx') !== -1) {
                    setUploadedCoverLetter(selectedFile);
                } else {
                    console.error("Unsupported cover letter file type");
                }
            } else if (fileType === 'resume') {
                if (fileName.indexOf('.pdf') !== -1 || fileName.indexOf('.docx') !== -1) {
                    setUploadedResume(selectedFile);
                } else {
                    console.error("Unsupported resume file type");
                }
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
                                                onChange={(e) => handleFileChange(e, 'coverLetter')}
                                                disabled={uploading}
                                                accept=".pdf, .docx"
                                                required
                                            />
                                            {uploading && <p>Uploading...</p>}
    
                                            <div className='mt-3'>
                                                {uploadedCoverLetter ? (
                                                    <a href={URL.createObjectURL(uploadedCoverLetter)} target="_blank" rel="noopener noreferrer">View Cover Letter</a>
                                                ) : (
                                                    <p>No Cover Letter uploaded.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label>Resume</label>
                            {resumeUrl ? (
                                <ul className="list-group list-group-horizontal">
                                <li className="list-group-item"><p className='mt-2'>Resume already uploaded <br/> <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></p></li>
                                </ul>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".docx,.pdf"
                                        onChange={(e) => handleFileChange(e, 'resume')}
                                        disabled={uploading}
                                        required
                                    />
                                    {uploading && <p>Uploading...</p>}
                                    <div className='mt-3'>
                                        {uploadedResume ? (
                                            <a href={URL.createObjectURL(uploadedResume)} target="_blank" rel="noopener noreferrer">View Resume</a>
                                        ) : (
                                            <p>No Resume uploaded.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className='mt-4'>
                            <button className='btn btn-primary' type="submit">Submit Application</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
