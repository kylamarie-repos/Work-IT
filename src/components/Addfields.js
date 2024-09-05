import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export default function AddField() {
    const [fieldName, setFieldName] = useState('');
    const [message, setMessage] = useState('');
    const db = getFirestore();

    const addFieldToDatabase = async () => {
        if (fieldName === '') {
            setMessage('Field name cannot be empty');
            return;
        }

        try {
            // Add a new document with an auto-generated ID
            await addDoc(collection(db, 'salaries'), { salary: fieldName });
            
            setMessage('Field added successfully!');
            setFieldName(''); // Clear the input
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission or other default behaviors
            addFieldToDatabase();
        }
    };

    return (
        <div className="container mt-5">
            <h2>Add New Field</h2>
            <div className="mb-3">
                <label htmlFor="fieldName" className="form-label">Field Name</label>
                <input
                    type="text"
                    className="form-control"
                    id="fieldName"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    onKeyDown={handleKeyDown} // Add this line to listen for the Enter key
                />
            </div>
            <button className="btn btn-primary" onClick={addFieldToDatabase}>Add Field</button>
            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    );
}
