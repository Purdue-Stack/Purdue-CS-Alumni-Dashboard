import React, { useState } from 'react';
import axios from 'axios';

const RequestForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        purdueId: '',
        mentorshipConsent: '',
        email: '',
        linkedin: '',
        mentorshipAreas: []
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData((prev) => ({
                ...prev,
                mentorshipAreas: checked
                    ? [...prev.mentorshipAreas, value]
                    : prev.mentorshipAreas.filter((v) => v !== value)
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/request', formData);
            alert('Form submitted successfully!');
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form.');
        }
    };

    return (
        <div>
            <h1>Alumni Request Form</h1>
            <form onSubmit={handleSubmit}>
                <label>First Name*: <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required /></label><br/>
                <label>Last Name*: <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required /></label><br/>
                <label>Purdue ID (8 digits)*: <input type="number" name="purdueId" value={formData.purdueId} onChange={handleChange} required /></label><br/>

                <p>Would you like to enroll in the Mentorship Program?*</p>
                <label><input type="radio" name="mentorshipConsent" value="Yes" onChange={handleChange} required /> Yes</label>
                <label><input type="radio" name="mentorshipConsent" value="No" onChange={handleChange} /> No</label><br/>

                <label>Email Address*: <input type="email" name="email" value={formData.email} onChange={handleChange} required /></label><br/>
                <label>LinkedIn*: <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} required /></label><br/>

                <p>Which of the following would you be willing to help students with?*</p>
                <label><input type="checkbox" name="mentorshipAreas" value="Career Chats" onChange={handleChange} /> Career Chats</label><br/>
                <label><input type="checkbox" name="mentorshipAreas" value="Resume Reviews" onChange={handleChange} /> Resume Reviews</label><br/>
                <label><input type="checkbox" name="mentorshipAreas" value="Mock Interviews" onChange={handleChange} /> Mock Interviews</label><br/>
                <label><input type="checkbox" name="mentorshipAreas" value="Project Collaboration" onChange={handleChange} /> Project Collaboration</label><br/>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default RequestForm;
