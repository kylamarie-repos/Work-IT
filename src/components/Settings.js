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

    // Function to extract the file name from the URL after decoding it
    const getFileNameFromUrl = (url) => {
        const decodedUrl = decodeURIComponent(url); // Decode the URL
        const parts = decodedUrl.split('/'); // Split by '/'
        return parts[parts.length - 1].split('?')[0]; // Get the last part (file name) before any query params
    };



    const handleFileChange = async (e, fileType) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            await uploadFile(selectedFile, fileType);
        }
    };

    const uploadFile = async (file, fileKind) => {
        if (!file) return;
        setUploading(true);
        try {
            const userId = auth.currentUser.uid;
            const fileType = file.type.split('/')[1]; // Extract file type (e.g., 'png', 'jpg')
    
            // Check for supported file types (png or jpg/jpeg)
            if (fileType === "png" || fileType === "jpg" || fileType === "jpeg") {
                // Determine the storage path based on whether it's a banner or logo
                const storagePath = fileKind === "banner"
                    ? `${userId}/banners/${file.name}` // Store Banner in user-specific folder
                    : `${userId}/logos/${file.name}`; // Store Logo in user-specific folder
    
                // Create a reference to the storage location and upload the file
                const storageRef = ref(storage, storagePath);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
    
                // Get a reference to the employer document
                const employerDocRef = doc(db, "employers", userId);
    
                if (fileKind === "banner") {
                    setBannerUrl(url);
                    // Update the bannerUrl in Firestore
                    await updateDoc(employerDocRef, { banner: url });
                    setEmployerInfo(prev => ({ ...prev, bannerUrl: url }));
                    alert('Banner uploaded successfully!');
                } else {
                    setLogoUrl(url);
                    // Update the logoUrl in Firestore
                    await updateDoc(employerDocRef, { logo: url });
                    setEmployerInfo(prev => ({ ...prev, logoUrl: url }));
                    alert('Logo uploaded successfully!');
                }
            } else {
                alert("Unsupported file type. Please upload a PNG or JPG.");
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploading(false);
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
                    onChange={(e) => handleFileChange(e, 'banner')}
                    accept='.png, .jpg'
                />
                {bannerUrl && getFileNameFromUrl(bannerUrl) !== 'dummy_banner.png' && (
                    <div className="mb-3">
                        <a href={bannerUrl} target="_blank" rel="noopener noreferrer">View Banner</a>
                    </div>
                )}
            </div>
            <div className="mb-3">
                <label htmlFor="logoUpload" className="form-label">Upload Logo</label>
                <input 
                    type="file" 
                    className="form-control" 
                    id="logoUpload" 
                    onChange={(e) => handleFileChange(e, 'logo')}
                    accept='.png, .jpg'
                />
                
                {logoUrl && getFileNameFromUrl(logoUrl) !== 'dummy_logo.png' && (
                    <div className="mb-3">
                        <a href={logoUrl} target="_blank" rel="noopener noreferrer">View Logo</a>
                    </div>
                )}
            </div>
            <div>
            {uploading && <p>Uploading...</p>}
            </div>
        </div>
    </>
    );
}
