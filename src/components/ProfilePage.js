import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../UserContext'; // Adjust the path as needed
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import "../style.css";

export default function ProfilePage() {
    const { user } = useContext(UserContext); // Access user from context
    const [userInfo, setUserInfo] = useState(null);
    const [promptMessage, setPromptMessage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [skills, setSkills] = useState([]);
    const [resumeUrl, setResumeUrl] = useState('');

    const db = getFirestore();

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {
                const userDoc = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserInfo(data);
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    setProfilePictureUrl(data.profilePictureUrl || '');
                    setSkills(data.skills || []);
                    setResumeUrl(data.resumeUrl || '');
                    if (!data.firstName || !data.lastName || !data.skills.length || !data.resumeUrl) {
                        setPromptMessage('Please complete your profile by adding your personal information.');
                    }
                } else {
                    setPromptMessage('No user data found. Please complete your profile.');
                }
            } else {
                setUserInfo(null);
            }
        };

        fetchUserInfo();
    }, [user, db]);

    if (!userInfo) {
        return <div>Loading... (try refreshing page)</div>;
    }

    return (
        <div className='me-5 pe-5'>
            <div className="card">
                <div className='profileContainer'>
                    <div className='profileBackgroundImage' style={{ backgroundImage: `url("../images/color-background.jpg")` }}></div>
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
                    {promptMessage ? (
                        <div className="alert alert-info mt-4">
                            {promptMessage}
                            <Link to={"/user/Settings"}>
                                <button className='btn btn-primary float-end'>Edit Profile</button>
                            </Link>
                        </div>
                    ) : (
                        <Link to={"/user/Settings"}>
                            <button className='btn btn-primary float-end'>Edit Profile</button>
                        </Link>
                    )}

                </div>
            </div>
        </div>
    );
}
