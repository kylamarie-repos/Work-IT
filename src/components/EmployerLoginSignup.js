import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, collection, where, query, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export default function EmployerLoginSignup() {
    const [isSignup, setIsSignup] = useState(true);
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
                if (!employerName || !companyName || !email || !password) {
                    alert("Please fill in all of the fields");
                    return;
                }
    
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log("User created:", user);
                const uid = user.uid;
    
                const logoPlaceholder = new Blob(['placeholder'], { type: 'image/png' });
                await uploadBytes(ref(storage, `${uid}/logos/dummy_logo.png`), logoPlaceholder);
                console.log("Dummy logo uploaded");
    
                const bannerPlaceholder = new Blob(['placeholder'], { type: 'image/png' });
                await uploadBytes(ref(storage, `${uid}/banners/dummy_banner.png`), bannerPlaceholder);
                console.log("Dummy banner uploaded");
    
                const logoUrl = await getDownloadURL(ref(storage, `${uid}/logos/dummy_logo.png`));
                const bannerUrl = await getDownloadURL(ref(storage, `${uid}/banners/dummy_banner.png`));
    
                const employerData = {
                    employerName,
                    email,
                    companyName,
                    logo: logoUrl,
                    banner: bannerUrl
                };
    
                await setDoc(doc(db, "employers", uid), employerData);
                console.log("Employer document created:", employerData);
                navigate('/employer/Dashboard'); 
            } else {
                const q = query(collection(db, "employers"), where("email", "==", email));
                const querySnapshot = await getDocs(q);
    
                if (querySnapshot.empty) {
                    setPromptMessage('No account found with this email. Please sign up.');
                    return;
                }
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/employer/Dashboard');
            }
        } catch (err) {
            console.error("Error during authentication:", err);
            setError(err.message);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "employers", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const employerData = docSnap.data();
                    console.log("Employer data:", employerData);
                } else {
                    console.log("No such document!");
                }

                navigate('/employer/Dashboard');
            }
        });

        return () => unsubscribe();
    }, [auth, db, navigate]);

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
            {error && <div className="alert alert-danger">{error}</div>}
            <button className="btn btn-primary" onClick={handleAuth}>
                {isSignup ? 'Sign Up' : 'Login'}
            </button>
            <button 
                className="btn btn-link" 
                onClick={() => {
                    setIsSignup(!isSignup);
                    setPromptMessage('');
                }}
            >
                {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
        </div>
    );
}
