import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, getDownloadURL, uploadBytes, listAll } from 'firebase/storage';
import { storage } from './firebase';

export default function ProfilePicModal({ show, handleClose, onPictureUpdate }) {
    const [presetImages, setPresetImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState('');
    const [userUploadedImage, setUserUploadedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchPresetImages = async () => {
            const presetRef = ref(storage, 'presetProfilePictures');
            const result = await listAll(presetRef);
            const urls = await Promise.all(result.items.map((itemRef) => getDownloadURL(itemRef)));
            setPresetImages(urls);
        };

        fetchPresetImages();
    }, []);

    useEffect(() => {
        // Clear userUploadedImage when switching to preset image
        if (selectedImage) {
            setUserUploadedImage(null);
        }
    }, [selectedImage]);

    const handlePresetImageSelect = (url) => {
        setSelectedImage(url);
    };

    const handleFileChange = (e) => {
        setUserUploadedImage(e.target.files[0]);
    };

    const handleSave = async () => {
        const user = auth.currentUser;

        if (!user) return;

        setUploading(true);

        try {
            let profilePictureUrl = '';

            if (userUploadedImage) {
                // If user uploads their own image
                const userFolderRef = ref(storage, `${user.uid}/profilePictures/${userUploadedImage.name}`);
                await uploadBytes(userFolderRef, userUploadedImage);
                profilePictureUrl = await getDownloadURL(userFolderRef);
            } else if (selectedImage) {
                // If user selects a preset image
                profilePictureUrl = selectedImage;
            }

            if (profilePictureUrl) {
                // Update user's profile picture in Firestore
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, { profilePictureUrl });
                alert('Profile picture updated successfully!');
                onPictureUpdate(); // Call the parent method to refresh the profile picture
            }
        } catch (error) {
            console.error('Error uploading or updating profile picture:', error);
        } finally {
            setUploading(false);
            handleClose(); // Close the modal after saving
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Choose Profile Picture</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="preset-images">
                    <h5>Choose from preset images:</h5>
                    <div className="d-flex flex-wrap">
                        {presetImages.map((url, idx) => (
                            <img
                                key={idx}
                                src={url}
                                alt="Preset"
                                width="100"
                                height="100"
                                onClick={() => handlePresetImageSelect(url)}
                                className={`rounded-circle ${selectedImage === url ? 'border border-primary' : ''}`}
                                style={{ cursor: 'pointer', margin: '5px' }}
                            />
                        ))}
                    </div>
                </div>

                <div className="upload-own">
                    <h5 className="mt-3">Or upload your own:</h5>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={uploading || (!userUploadedImage && !selectedImage)}>
                    {uploading ? 'Saving...' : 'Save'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
