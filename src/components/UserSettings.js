import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase'; 

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
                    if (!data.firstName || !data.lastName || !data.skills || !data.resumeUrl) {
                        setPromptMessage('Please complete your profile by adding your personal information.');
                    }
                    setFirstName(data.firstName || '');  // Set firstName or default to empty string
                    setLastName(data.lastName || '');  // Set lastName or default to empty string
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
                skills: userInfo.skills || ''
            });
        }
    }, [userInfo]);

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
            await updateDoc(userDoc, editValues);
            setUserInfo(prev => ({ ...prev, ...editValues }));
            setIsEditing(false);
        }
    };

    const handleFileChange = async (e, fileType) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            await uploadFile(selectedFile, fileType);
        }
    };

    const uploadFile = async (file, fileType) => {
        if (!file) return;

        setUploading(true);
        try {
            const storagePath = fileType === 'profilePicture'
                ? `profilePictures/${auth.currentUser.uid}`
                : `resumes/${file.name}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            if (fileType === 'profilePicture') {
                setProfilePictureUrl(url);
                await updateDoc(doc(db, "users", auth.currentUser.uid), { profilePictureUrl: url });
                setUserInfo(prev => ({ ...prev, profilePictureUrl: url }));
                alert('Profile picture uploaded successfully!');
            } else {
                setResumeUrl(url);
                await updateDoc(doc(db, "users", auth.currentUser.uid), { resumeUrl: url });
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

    return (
        <div className="container mt-5">
            <h2>Profile Page</h2>
            {promptMessage && <div className="alert alert-info">{promptMessage}</div>}
            {!isEditing ? (
                <div>
                    {userInfo ? (
                        <>
                            <p><strong>First Name:</strong> {userInfo.firstName || 'N/A'}</p>
                            <p><strong>Last Name:</strong> {userInfo.lastName || 'N/A'}</p>
                            <p><strong>Email:</strong> {userInfo.email}</p>
                            <p><strong>Skills:</strong> {userInfo.skills || 'N/A'}</p>

                            <p><strong>Profile Picture:</strong></p>
                            {profilePictureUrl ? (
                                <img src={profilePictureUrl} alt="Profile" width="150" height="150" />
                            ) : (
                                <p>No profile picture uploaded.</p>
                            )}

                            <p><strong>Resume:</strong></p>
                            {resumeUrl ? (
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
                            ) : (
                                <p>No resume uploaded.</p>
                            )}

                            <div className="mb-3 mt-3">
                                <label htmlFor="profilePictureUpload" className="form-label">Upload Profile Picture</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    id="profilePictureUpload" 
                                    onChange={(e) => handleFileChange(e, 'profilePicture')}
                                    disabled={uploading}
                                />
                                {uploading && <p>Uploading...</p>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="resumeUpload" className="form-label">Upload Resume</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    id="resumeUpload" 
                                    onChange={(e) => handleFileChange(e, 'resume')}
                                    disabled={uploading}
                                />
                                {uploading && <p>Uploading...</p>}
                            </div>
                        </>
                    ) : (
                        <p>Loading user data...</p>
                    )}

                    {!isEditing && (
                        <button className="btn btn-primary mt-4" onClick={() => setIsEditing(true)}>Edit</button>
                    )}
                </div>
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
                        <input 
                            type="text" 
                            className="form-control" 
                            id="skills" 
                            name="skills"
                            value={editValues.skills || userInfo.skills}
                            onChange={handleEditChange}
                        />
                    </div>

                    <button className="btn btn-primary mt-5" onClick={handleSaveChanges}>Save Changes</button>
                    <button className="btn btn-secondary mt-5" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
}
