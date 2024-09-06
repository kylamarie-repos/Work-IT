import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


export default function EmployerLoginSignup() {
    const [isSignup, setIsSignup] = useState(true); // Toggle between signup and login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [employerName, setEmployerName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    const handleAuth = async () => {
        try {
            if (isSignup) {
                // Signup logic
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const uid = userCredential.user.uid;

                // Save employer data to Firestore
                const employerData = {
                    employerName,
                    companyName,
                    logo: '', // You can add functionality to upload a logo
                    banner: '' // You can add functionality to upload a banner
                };
                await setDoc(doc(db, "employers", uid), employerData);
                navigate('/employer/Dashboard'); // Redirect to employer dashboard on successful signup
            } else {
                // Login logic
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/employer/Dashboard'); // Redirect to employer dashboard on successful login
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // const handleGoogleSignIn = async () => {
    //     const provider = new GoogleAuthProvider();
    //     try {
    //         const result = await signInWithPopup(auth, provider);
    //         const user = result.user;
    
    //         // Reference to the employer's document
    //         const employerDocRef = doc(db, "employers", user.uid);
    //         const employerDoc = await getDoc(employerDocRef);
    
    //         // If the employer doesn't already exist in Firestore, create a new document
    //         if (!employerDoc.exists()) {
    //             const employerData = {
    //                 employerName: user.displayName || '', // You may pull this from Google account info
    //                 companyName: '', // Manually filled later
    //                 logo: '',
    //                 banner: ''
    //             };
    //             await setDoc(doc(db, "employers", user.uid), employerData);
    //         }
    
    //         navigate('/employer/Dashboard'); // Redirect to dashboard
    //     } catch (error) {
    //         setError(error.message);
    //     }
    // };
    
    

    return (
        <div className="container mt-5">
            <h2>{isSignup ? 'Employer Sign Up' : 'Employer Login'}</h2>
            {isSignup && (
                <>
                    <div className="mb-3">
                        <label htmlFor="employerName" className="form-label">Employer Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="employerName" 
                            value={employerName}
                            onChange={(e) => setEmployerName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="companyName" className="form-label">Company Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="companyName" 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
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
                    required
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
                    required
                />
            </div>
            {/* <button className="btn btn-outline-danger mt-3" onClick={handleGoogleSignIn}>
                Sign in with Google
            </button> */}

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
