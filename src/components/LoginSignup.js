import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function LoginSignup() {
    const [isSignup, setIsSignup] = useState(true); // Toggle between signup and login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    const handleAuth = async () => {
        try {
            if (isSignup) {
                // Signup logic
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Create a document with user information
                await setDoc(doc(db, "users", user.uid), {
                    firstName: firstName || '',
                    lastName: lastName || '',
                    email: user.email,
                    skills: '',
                    resume: '',
                    bookmarkedJobs: [],
                    appliedJobs: []
                });

                navigate('/ProfilePage'); // Redirect to profile page on successful signup
            } else {
                // Login logic
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/ProfilePage'); // Redirect to profile page on successful login
            }
        } catch (err) {
            setError(err.message);
        }
    };

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
            {error && <div className="alert alert-danger">{error}</div>}
            <button className="btn btn-primary" onClick={handleAuth}>
                {isSignup ? 'Sign Up' : 'Login'}
            </button>
            <button 
                className="btn btn-link" 
                onClick={() => setIsSignup(!isSignup)}
            >
                {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
        </div>
    );
}
