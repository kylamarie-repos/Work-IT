import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import "../style.css";

export default function ProfilePage() {
    const [userInfo, setUserInfo] = useState(null);
    const [promptMessage, setPromptMessage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [skills, setSkills] = useState(['']);
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
                    if (!data.firstName || !data.lastName || !data.skills || !data.resumeUrl) {
                        setPromptMessage('Please complete your profile by adding your personal information.');
                    }
                    setFirstName(data.firstName || '');  // Set firstName or default to empty string
                    setLastName(data.lastName || '');  // Set lastName or default to empty string
                    setProfilePictureUrl(data.profilePictureUrl || '');  // Set profile picture or default to empty string
                    setSkills(data.skills || ['']);
                    setResumeUrl(data.resumeUrl || '');
                } else {
                    setPromptMessage('Please complete your profile by adding your personal information.');
                }
            }
            else
            {
                alert("No user found.");
            }
        };

        fetchUserInfo();
    }, [auth.currentUser, db]);

    


    if (!userInfo) {
        return <div>Loading...</div>;
    }

    return (
        <>
        <div className='me-5 pe-5'>
            <div className="card">
                <div className='profileContainer'>
                    <div className='profileBackgroundImage' alt="profile background"  style={{ backgroundImage: `url("../images/color-background.jpg")` }} ></div>
                    <div className='profilePicture'>
                        <img className='img-thumbnail rounded-circle' src={profilePictureUrl} alt='profile' />
                    </div>
                </div>
                <div className="card-body">
                    <h5 className="card-title">{firstName && lastName ? `${firstName} ${lastName}` : 'Incomplete Name'}</h5>
                    <p className="card-text">
                        <div>
                            <strong>Skills: </strong>
                            <ul className='list-group list-group-horizontal'>
                                {skills.map((skill, index) => (
                                    <li className='list-group-item no-border' key={index}>
                                        <button type="button" className="btn btn-primary rounded-pill" disabled>{skill}</button>
                                    </li>
                                ))}
                            </ul>
                            {!skills.length && <p>N/A</p>}
                        </div>
                        <div className='mt-3'>
                        {resumeUrl ? (
                        <Link to={resumeUrl} target="_blank" rel="noopener noreferrer"><button className='btn btn-success'>View Resume</button></Link>
                            ) : (
                                <p>No resume uploaded.</p>
                            )}
                        </div>
                    
                    </p>
                    <Link to={"/user/Settings"}><button className='btn btn-primary float-end'>Edit Profile</button></Link>
                    {promptMessage && <div className="alert alert-info mt-4">{promptMessage}</div>}
                </div>
            </div>
        </div>
        </>
    );
}