import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase'; 
import ProfilePicModal from "./ProfilePicModal";
import { Link } from "react-router-dom";
import "../style.css";

export default function UserSettingsPage() {
    const [userInfo, setUserInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({});
    const [promptMessage, setPromptMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [skills, setSkills] = useState(['']);

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
                    setUserInfo(data);
                    setProfilePictureUrl(data.profilePictureUrl || '');
                    setResumeUrl(data.resumeUrl || '');
                    setFirstName(data.firstName || '');  
                    setLastName(data.lastName || '');  
                    setSkills(data.skills || ['']);
                    checkMissingFields(data);
                } else {
                    setPromptMessage('Please complete your profile by adding your personal information.');
                }
            }
        };

        fetchUserInfo();
    }, [auth.currentUser, db]);

    useEffect(() => {
        if (userInfo) {
            setEditValues({
                firstName: userInfo.firstName || '',
                lastName: userInfo.lastName || '',
                skills: userInfo.skills || ['']
            });
        }
    }, [userInfo]);

    const checkMissingFields = (data) => {
        if (!data.firstName || !data.lastName || !data.skills || data.skills.length === 0 || !data.resumeUrl) {
            setPromptMessage('Please complete your profile by adding your personal information.');
        } else {
            setPromptMessage('');
        }
    };

    const handleEditChange = (e) => {
        setEditValues({
            ...editValues,
            [e.target.name]: e.target.value,
        });
    };

    const handleSaveChanges = async () => {
        const user = auth.currentUser;
        if (user) {
            const userDoc = doc(db, "users", user.uid);
            await updateDoc(userDoc, {
                ...editValues,
                skills: skills, // Ensure skills are included in the update
            });
            setUserInfo(prev => ({ ...prev, ...editValues, skills })); // Update user info with skills
            setIsEditing(false);
        }
    };
    

    const handleFileChange = async (e, fileType) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            await uploadFile(selectedFile, fileType);
        }
    };

    const handleSkillChange = (index, value) => {
        const newSkills = [...skills];
        newSkills[index] = value;
        setSkills(newSkills);
    };
    
    const handleAddSkill = () => {
        setSkills([...skills, '']);
    };
    
    const handleRemoveSkill = (index) => {
        const newSkills = skills.filter((_, i) => i !== index);
        setSkills(newSkills);
    };
    

    const uploadFile = async (file, fileType) => {
        if (!file) return;
    
        setUploading(true);
        try {
            const userId = auth.currentUser.uid; // Get the user ID
            const storagePath = fileType === 'profilePicture'
                ? `${userId}/profilePictures/${file.name}`
                : `${userId}/resumes/${file.name}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            if (fileType === 'profilePicture') {
                setProfilePictureUrl(url);
                await updateDoc(doc(db, "users", userId), { profilePictureUrl: url });
                setUserInfo(prev => ({ ...prev, profilePictureUrl: url }));
                alert('Profile picture uploaded successfully!');
            } else {
                setResumeUrl(url);
                await updateDoc(doc(db, "users", userId), { resumeUrl: url });
                setUserInfo(prev => ({ ...prev, resumeUrl: url }));
                alert('Resume uploaded successfully!');
            }
        } catch (error) {
            console.error(`Error uploading ${fileType}:`, error);
            alert(`Failed to upload ${fileType}.`);
        } finally {
            setUploading(false);
        }
    };

    // Function to handle profile picture update after modal
    const handlePictureUpdate = () => {
        const user = auth.currentUser;
        if (user) {
            getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfilePictureUrl(data.profilePictureUrl);
                    setUserInfo(prev => ({ ...prev, profilePictureUrl: data.profilePictureUrl }));
                }
            });
        }
    };
    
    return (
        <div className="container mt-5">
            <h2>Profile Page</h2>
            {promptMessage && <div className="alert alert-info">{promptMessage}</div>}
            
            <div className="row">
                {/* User Info Card */}
                <div className="col-md-4 d-flex">
                    <div className="card mb-4 flex-fill">
                        <div className="card-body">
                            <h5 className="card-title text-center">User Information</h5>
                            <hr />
                            {!isEditing ? (
                                <>
                                    <p><strong>First Name:</strong> {userInfo?.firstName || 'N/A'}</p>
                                    <p><strong>Last Name:</strong> {userInfo?.lastName || 'N/A'}</p>
                                    <p><strong>Email:</strong> {userInfo?.email}</p>
                                    <strong>Skills: </strong>
                                    <ul className='list-group-flush d-flex flex-wrap'>
                                        {skills.map((skill, index) => (
                                            <li className='list-group-item no-border p-1 skill-item' key={index}>
                                                <button type="button" className="btn btn-primary rounded-pill" disabled>{skill}</button>
                                            </li>
                                        ))}
                                    </ul>

                                    {!skills.length && <p>N/A</p>}
                                    <button className="btn btn-outline-dark mt-4" onClick={() => setIsEditing(true)}>Edit</button>
                                </>
                            ) : (
                                <div>
                                    <div className="mb-3">
                                        <label htmlFor="firstName" className="form-label">First Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="firstName" 
                                            name="firstName"
                                            value={editValues.firstName || firstName}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="lastName" className="form-label">Last Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="lastName" 
                                            name="lastName"
                                            value={editValues.lastName || lastName}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="skills" className="form-label">Skills</label>
                                        {skills.map((skill, index) => (
                                            <div key={index} className="d-flex mb-2">
                                                <input type="text" className="form-control" value={skill} onChange={(e) => handleSkillChange(index, e.target.value)} />
                                                <button className="btn btn-danger ms-2" onClick={() => handleRemoveSkill(index)}>Remove</button>
                                            </div>
                                        ))}
                                        <button className="btn btn-primary" onClick={handleAddSkill}>Add Skill</button>
                                    </div>
                                    <button className="btn btn-primary mt-3" onClick={handleSaveChanges}>Save Changes</button>
                                    <button className="btn btn-secondary mt-3" onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Picture Card */}
                <div className="col-md-4">
                    <div className="card mb-4 flex-fill">
                        <div className="card-body text-center">
                            <h5 className="card-title text-center">Profile Picture</h5>
                            <hr />
                            {profilePictureUrl ? (
                                <img src={profilePictureUrl} alt="Profile" className='rounded-circle' width="150" height="150" />
                            ) : (
                                <p>No profile picture uploaded.</p>
                            )}
                            <br/>
                            <button className="btn btn-primary mt-3" onClick={() => setShowModal(true)}>
                                Change Profile Picture
                            </button>
                        </div>
                    </div>
                </div>

                {/* Resume Card */}
                <div className="col-md-4">
                    <div className="card mb-4 flex-fill">
                        <div className="card-body">
                            <h5 className="card-title text-center">Resume</h5>
                            <hr />
                            {resumeUrl ? (
                                <Link to={resumeUrl} target="_blank" rel="noopener noreferrer"><button className='btn btn-success'>View Resume</button></Link>
                            ) : (
                                <p>No resume uploaded.</p>
                            )}
                            <div className="mb-3 mt-3">
                                <label htmlFor="resumeUpload" className="form-label">Upload Resume</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    id="resumeUpload" 
                                    onChange={(e) => handleFileChange(e, 'resume')}
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
            {/* Profile Picture Modal */}
            <ProfilePicModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onPictureUpdate={handlePictureUpdate}
            />
        </div>
    );
    
}
