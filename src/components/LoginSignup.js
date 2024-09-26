import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


export default function LoginSignup() {
    const [isSignup, setIsSignup] = useState(true); // Toggle between signup and login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [promptMessage, setPromptMessage] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    const location = useLocation(); // Get the location object
    const fromJob = location.state?.fromJob;

    const storageRef = ref(storage, 'presetProfilePictures/blank-profile-picture.png');

    const handleAuth = async () => {
        try {
            if (isSignup) {
                if (!firstName || !lastName || !email || !password) {
                    setPromptMessage("Please fill out all form fields");
                    return;
                }
    
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
    
                if (!user) {
                    console.error("User not authenticated");
                    return; // Exit if user is not authenticated
                }
    
                const profilePictureUrl = await getDownloadURL(storageRef);
                const userData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: user.email,
                    skills: '',
                    resume: '',
                    profilePictureUrl: profilePictureUrl || ""
                };
    
                // Create the user document in Firestore
                await setDoc(doc(db, "users", user.uid), userData);
                console.log("User document created in Firestore"); // Correct logging here
    
                navigate('/user/Dashboard'); // Redirect on successful signup
            } else {
                // Login logic
                const q = query(collection(db, "users"), where("email", "==", email));
                const querySnapshot = await getDocs(q);
    
                if (querySnapshot.empty) {
                    setPromptMessage('No account found with this email. Please sign up.');
                    return;
                }
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/user/Dashboard'); // Redirect on successful login
            }
    
            if (fromJob) {
                navigate(`/apply/${fromJob.id}`, { state: { job: fromJob } });
            }
    
        } catch (err) {
            setError(err.message);
            console.error("Error during authentication:", err); // Log the error for debugging
        }
    };
    
    

    // const handleGoogleSignIn = async () => {
    //     const provider = new GoogleAuthProvider();
    //     try {
    //         const result = await signInWithPopup(auth, provider);
    //         const user = result.user;
    
    //         // Check if user already exists in Firestore
    //         const userDocRef = doc(db, "users", user.uid);
    //         const userDoc = await getDoc(userDocRef);
    
    //         // If the user doesn't already exist in Firestore, create a new document
    //         if (!userDoc.exists()) {
    //             await setDoc(doc(db, "users", user.uid), {
    //                 firstName: user.displayName.split(' ')[0] || '',
    //                 lastName: user.displayName.split(' ')[1] || '',
    //                 email: user.email,
    //                 skills: '',
    //                 resume: '',
    //                 bookmarkedJobs: [],
    //                 appliedJobs: []
    //             });
    //         }
    
    //         navigate('/user/Dashboard'); // Redirect to profile page
    //     } catch (error) {
    //         setError(error.message);
    //     }
    // };
    

    return (
        <div className="container mt-5">
            <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
            {isSignup && (
                <>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="firstName" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="lastName" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </>
            )}
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {promptMessage && <div className="alert alert-warning m-3">{promptMessage}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            {/* <button className="btn btn-outline-danger mt-3" onClick={handleGoogleSignIn}>
                Sign in with Google
            </button> */}
            <button className="btn btn-primary" onClick={handleAuth}>
                {isSignup ? 'Sign Up' : 'Login'}
            </button>
            <button 
                className="btn btn-link" 
                onClick={() => {
                    setIsSignup(!isSignup);
                    setPromptMessage(''); // Reset the prompt message
                }}
            >
                {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
        </div>
    );
}
