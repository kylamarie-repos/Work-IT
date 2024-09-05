import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase'; 

export default function ProfilePage() {
    const [userInfo, setUserInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({});
    const [promptMessage, setPromptMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');

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
                    if (data.resumeUrl) {
                        setResumeUrl(data.resumeUrl);
                    }
                    if (!data.firstName || !data.lastName || !data.skills || !data.resumeUrl) {
                        setPromptMessage('Please complete your profile by adding your personal information.');
                    }
                } else {
                    setPromptMessage('Please complete your profile by adding your personal information.');
                }
            }
        };

        fetchUserInfo();
    }, [auth.currentUser, db]);

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

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        
        if (selectedFile) {
            await uploadFile(selectedFile);
        }
    };

    const uploadFile = async (file) => {
        if (!file) return;
    
        setUploading(true);
        try {
            const storageRef = ref(storage, `resumes/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setResumeUrl(url);
            setPromptMessage(''); // Clear prompt message when resume is uploaded

            // Update user info in Firestore
            const user = auth.currentUser;
            if (user) {
                const userDoc = doc(db, "users", user.uid);
                await updateDoc(userDoc, { resumeUrl: url });
                setUserInfo(prev => ({ ...prev, resumeUrl: url }));
                alert('Resume uploaded successfully!');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload resume.');
        } finally {
            setUploading(false);
        }
    };

    const deleteFile = async () => {
        if (!resumeUrl) return;
    
        setUploading(true);
        try {
            const fileName = resumeUrl.split('/').pop(); // Extract the file name from the URL
            const fileRef = ref(storage, `resumes/${fileName}`);
            await deleteObject(fileRef);
            setResumeUrl(''); // Clear the resume URL
            setPromptMessage('Please complete your profile by adding your personal information.');

            // Update user info in Firestore
            const user = auth.currentUser;
            if (user) {
                const userDoc = doc(db, "users", user.uid);
                await updateDoc(userDoc, { resumeUrl: '' });
                setUserInfo(prev => ({ ...prev, resumeUrl: '' }));
                alert('Resume deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete resume.');
        } finally {
            setUploading(false);
        }
    };

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Profile Page</h2>
            {promptMessage && <div className="alert alert-info">{promptMessage}</div>}
            {!isEditing ? (
                <div>
                    <p><strong>First Name:</strong> {userInfo.firstName || 'N/A'}</p>
                    <p><strong>Last Name:</strong> {userInfo.lastName || 'N/A'}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Skills:</strong> {userInfo.skills || 'N/A'}</p>
                    <p><strong>Resume:</strong> {resumeUrl ? <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a> : 'N/A'}</p>
                    {!resumeUrl && !isEditing && (
                        <div className="mb-3">
                            <label htmlFor="resumeUpload" className="form-label">Upload Resume</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                id="resumeUpload" 
                                onChange={handleFileChange}
                            />
                        </div>
                    )}
                    {resumeUrl && !isEditing && (
                        <div className="mt-3">
                            <button 
                                className="btn btn-danger"
                                onClick={deleteFile}
                                disabled={uploading}
                            >
                                {uploading ? 'Deleting...' : 'Delete Resume'}
                            </button>
                        </div>
                    )}
                    {!isEditing && (
                        <button className="btn btn-primary mt-5" onClick={() => setIsEditing(true)}>Edit</button>
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
                            value={editValues.firstName || userInfo.firstName}
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
                            value={editValues.lastName || userInfo.lastName}
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
                    {!resumeUrl && (
                        <div className="mb-3">
                            <label htmlFor="resumeUpload" className="form-label">Upload Resume</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                id="resumeUpload" 
                                onChange={handleFileChange}
                            />
                        </div>
                    )}
                    {uploading && <p>Uploading...</p>}
                    {resumeUrl && (
                        <div className="mt-3">
                            <h4>Uploaded Resume:</h4>
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
                            <button 
                                className="btn btn-danger mt-2"
                                onClick={deleteFile}
                                disabled={uploading}
                            >
                                {uploading ? 'Deleting...' : 'Delete Resume'}
                            </button>
                        </div>
                    )}
                    <button className="btn btn-primary mt-5" onClick={handleSaveChanges}>Save Changes</button>
                    <button className="btn btn-secondary mt-5" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
}
