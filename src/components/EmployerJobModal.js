import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';

export default function EmployerJobModal({ show, handleClose, job, onJobUpdate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [field, setField] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [jobType, setJobType] = useState('');
    const [qualification, setQualification] = useState('');
    const [experience, setExperience] = useState('');
    const [responsibilities, setResponsibilities] = useState(['']);
    const [questions, setQuestions] = useState(['']);
    const [locations, setLocations] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [fields, setFields] = useState([]);
    const [userUid, setUserUid] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch location data
                const locationSnapshot = await getDocs(collection(db, 'locations'));
                const locationList = locationSnapshot.docs.map(doc => doc.data().city);
                setLocations(locationList);

                // Fetch salary data
                const salarySnapshot = await getDocs(collection(db, 'salaries'));
                const salaryList = salarySnapshot.docs.map(doc => doc.data().salary);
                setSalaries(salaryList);

                // Fetch job type data
                const jobTypeSnapshot = await getDocs(collection(db, 'work-types'));
                const jobTypeList = jobTypeSnapshot.docs.map(doc => doc.data().type);
                setJobTypes(jobTypeList);

                // Fetch fields data for autocomplete
                const fieldsSnapshot = await getDocs(collection(db, 'fields'));
                const fieldList = fieldsSnapshot.docs.map(doc => doc.data().field);
                setFields(fieldList);

                // Get current user's UID
                const auth = getAuth();
                const user = auth.currentUser;
                if (user) {
                    setUserUid(user.uid);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (job) {
            setTitle(job.title || '');
            setDescription(job.description || '');
            setField(job.field || '');
            setLocation(job.location || '');
            setSalary(job.salary || '');
            setJobType(job.jobType || '');
            setQualification(job.qualification || '');
            setExperience(job.experience || '');
            setResponsibilities(job.responsibilities || ['']);
            setQuestions(job.questions || ['']);
        } else {
            // Reset form for new job
            setTitle('');
            setDescription('');
            setField('');
            setLocation('');
            setSalary('');
            setJobType('');
            setQualification('');
            setExperience('');
            setResponsibilities(['']);
            setQuestions(['']);
        }
    }, [job]);

    const handleSave = async () => {
        try {
            if (!userUid) {
                console.error("User not authenticated");
                return;
            }

            // Check if all required fields are filled
            if (!title || !description || !field || !location || !salary || !jobType || !qualification || !experience) {
                console.error("Please fill in all required fields");
                return;
            }

            const jobData = {
                title,
                description,
                field,
                location,
                salary,
                jobType,
                qualification,
                experience,
                responsibilities,
                questions,
                datePosted: new Date().toISOString(),
                numApplications: 0,
                numApplicationsLastWeek: 0
            };

            if (job && job.id) {
                // Update existing job
                const jobDocRef = doc(db, 'employers', userUid, 'jobAdvertisements', job.id);
                await updateDoc(jobDocRef, jobData);
                onJobUpdate(jobData); // Notify parent to refresh job list
            } else {
                // Add new job
                await addDoc(collection(db, 'employers', userUid, 'jobAdvertisements'), jobData);
            }

            handleClose();
        } catch (error) {
            console.error("Error saving job:", error);
        }
    };

    const handleResponsibilityChange = (index, value) => {
        const newResponsibilities = [...responsibilities];
        newResponsibilities[index] = value;
        setResponsibilities(newResponsibilities);
    };

    const handleAddResponsibility = () => {
        setResponsibilities([...responsibilities, '']);
    };

    const handleRemoveResponsibility = (index) => {
        const newResponsibilities = responsibilities.filter((_, i) => i !== index);
        setResponsibilities(newResponsibilities);
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        setQuestions(newQuestions);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, '']);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{job ? 'Edit Job Listing' : 'Add New Job Listing'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formTitle" className='mb-3'>
                        <Form.Label>Job Title</Form.Label>
                        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formDescription" className='mb-3'>
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formField" className='mb-3'>
                        <Form.Label>Field</Form.Label>
                        <Form.Control as="select" value={field} onChange={(e) => setField(e.target.value)}>
                            <option value="">Select Field</option>
                            {fields.map((field, index) => (
                                <option key={index} value={field}>{field}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formLocation" className='mb-3'>
                        <Form.Label>Location</Form.Label>
                        <Form.Control as="select" value={location} onChange={(e) => setLocation(e.target.value)}>
                            <option value="">Select Location</option>
                            {locations.map((location, index) => (
                                <option key={index} value={location}>{location}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formSalary" className='mb-3'>
                        <Form.Label>Salary</Form.Label>
                        <Form.Control as="select" value={salary} onChange={(e) => setSalary(e.target.value)}>
                            <option value="">Select Salary</option>
                            {salaries.map((salary, index) => (
                                <option key={index} value={salary}>{salary}k</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formJobType" className='mb-3'>
                        <Form.Label>Job Type</Form.Label>
                        <Form.Control as="select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                            <option value="">Select Job Type</option>
                            {jobTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formQualification" className='mb-3'>
                        <Form.Label>Qualification Required</Form.Label>
                        <Form.Control type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formExperience" className='mb-3'>
                        <Form.Label>Experience Required</Form.Label>
                        <Form.Control type="text" value={experience} onChange={(e) => setExperience(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formResponsibilities" className='mb-3'>
                        <Form.Label>Responsibilities</Form.Label>
                        {responsibilities.map((responsibility, index) => (
                            <div key={index} className="d-flex mb-2">
                                <Form.Control type="text" value={responsibility} onChange={(e) => handleResponsibilityChange(index, e.target.value)} />
                                <Button variant="danger" onClick={() => handleRemoveResponsibility(index)} className="ms-2">Remove</Button>
                            </div>
                        ))}
                        <Button variant="primary" onClick={handleAddResponsibility}>Add Responsibility</Button>
                    </Form.Group>
                    <Form.Group controlId="formQuestions" className='mb-3'>
                        <Form.Label>Questions</Form.Label>
                        {questions.map((question, index) => (
                            <div key={index} className="d-flex mb-2">
                                <Form.Control type="text" value={question} onChange={(e) => handleQuestionChange(index, e.target.value)} />
                                <Button variant="danger" onClick={() => handleRemoveQuestion(index)} className="ms-2">Remove</Button>
                            </div>
                        ))}
                        <Button variant="primary" onClick={handleAddQuestion}>Add Question</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
}
