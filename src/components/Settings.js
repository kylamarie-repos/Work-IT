import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase'; 

export default function SettingsPage() {
    const [employerInfo, setEmployerInfo] = useState(null);
    const [bannerUrl, setBannerUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchEmployerInfo = async () => {
            const user = auth.currentUser;
            if (user) {
                const employerDoc = doc(db, "employers", user.uid);
                const docSnap = await getDoc(employerDoc);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setEmployerInfo(data);
                    setBannerUrl(data.banner || '');
                    setLogoUrl(data.logo || '');
                }
            }
        };

        fetchEmployerInfo();
    }, [auth.currentUser, db]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            try {
                const fileType = file.type.split('/')[1]; // Extract file type (e.g., 'png', 'jpg')
                const storagePath = fileType === 'png' || fileType === 'jpg' ? `banners/${file.name}` : `logos/${file.name}`;
                const storageRef = ref(storage, storagePath);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                const field = storagePath.includes('banners') ? 'banner' : 'logo';

                // Update Firestore document
                const user = auth.currentUser;
                if (user) {
                    const employerDoc = doc(db, "employers", user.uid);
                    await updateDoc(employerDoc, { [field]: url });
                    if (field === 'banner') {
                        setBannerUrl(url);
                    } else {
                        setLogoUrl(url);
                    }
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            } finally {
                setUploading(false);
            }
        }
    };

    if (!employerInfo) {
        return <div>Loading...</div>;
    }

    return (
    <>
        <div className="container mt-5">
            <h2>Settings Page</h2>
            <div className="mb-3">
                <label htmlFor="bannerUpload" className="form-label">Upload Banner</label>
                <input 
                    type="file" 
                    className="form-control" 
                    id="bannerUpload" 
                    onChange={handleFileChange}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="logoUpload" className="form-label">Upload Logo</label>
                <input 
                    type="file" 
                    className="form-control" 
                    id="logoUpload" 
                    onChange={handleFileChange}
                />
            </div>
            <div>
                {bannerUrl && (
                    <div className="mb-3">
                        <a href={bannerUrl} target="_blank" rel="noopener noreferrer">View Banner</a>
                    </div>
                )}
                {logoUrl && (
                    <div className="mb-3">
                        <a href={logoUrl} target="_blank" rel="noopener noreferrer">View Logo</a>
                    </div>
                )}
            </div>
            {uploading && <p>Uploading...</p>}
        </div>
    </>
    );
}
