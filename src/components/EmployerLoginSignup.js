import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore, doc, setDoc, getDocs, collection, where, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { FirebaseError } from 'firebase/app';


export default function EmployerLoginSignup() {
    const [isSignup, setIsSignup] = useState(true); // Toggle between signup and login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [employerName, setEmployerName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [promptMessage, setPromptMessage] = useState('');
    const auth = getAuth();
    const db = getFirestore();

    const handleAuth = async () => {
        try {
            if (isSignup) {

                if (!employerName || !companyName || !email || !password)
                {
                    alert("Please fill in all of the fields");
                    return;
                }

                // Signup logic
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const uid = user.uid;

                const logoStorageRef = ref(storage, `${user.uid}/logos`);
                const bannerStorageRef = ref(storage, `${user.uid}/logos`);

                const logoUrl = await getDownloadURL(logoStorageRef);
                const bannerUrl = await getDownloadURL(bannerStorageRef);

                try {
                    // Save employer data to Firestore
                    const employerData = {
                        employerName,
                        email,
                        companyName,
                        logo: logoUrl, 
                        banner: bannerUrl 
                    };
                    await setDoc(doc(db, "employers", uid), employerData);
                } catch {
                    console.log("Error creating firestore document.");
                    setError("Failed to create employer document in firestore. Please try again.", FirebaseError);
                    return;
                }

                
                navigate('/employer/Dashboard'); // Redirect to employer dashboard on successful signup
            } else {
                // Login logic
                const q = query(collection(db, "employers"), where("email", "==", email));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setPromptMessage('No account found with this email. Please sign up.');
                    return;
                }
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
            {promptMessage && <div className="alert alert-warning m-3">{promptMessage}</div>}
            {/* <button className="btn btn-outline-danger mt-3" onClick={handleGoogleSignIn}>
                Sign in with Google
            </button> */}

            {error && <div className="alert alert-danger">{error}</div>}
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
