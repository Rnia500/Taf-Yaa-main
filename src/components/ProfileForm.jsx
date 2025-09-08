import React, { useState } from 'react';
import { FaEdit, FaGlobe, FaScrewdriver } from 'react-icons/fa';
import './ProfileForm.css'; // Assuming you have a CSS file for styling
import { FaEye, FaGear, FaSchoolCircleCheck } from 'react-icons/fa6';

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
    });
    const [dialect, setDialect] = useState(""); // Add this state

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form data submitted:', formData);
        // You would typically handle form submission here, e.g., send data to an API
    };

    return (
        <>
            <div className="profile-container">
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="header">
                        <h2 className="profile-info">Profile Information</h2>
                        <button type="button" className="edit-button">
                            <FaEdit />
                            Edit
                        </button>
                    </div>
                    <hr />
                    <div className="user-details">
                        <div className="profile-picture-container">
                            <img
                                src="../assets/Logo.png" // Placeholder image URL
                                alt="Profile"
                                className="profile-picture"
                            />
                        </div>
                        <div className="name-email">
                            <h3 className="user-name">{`${formData.firstName} ${formData.lastName}`}</h3>
                            <p className="user-email">{formData.email}</p>
                        </div>
                    </div>
                    <div className="fields-container">
                        <div className="name-fields">
                            <div className="input-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="input-group full-width">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </form>
            </div>
            
            <div className="v-container">
                
                <form className="v-form">
                    <div className="v-header">
                        <><FaEye /></>
                        <h2 className="v-info">Tree Visibility</h2>
                    </div>

                    <div className='v-body'>
                        <p>Control who can view and discover your family tree.</p>
                        <div className='rad-input'>
                            <input type='radio' id='option1' name='options' value="option1" />
                            <label for='option1'>Private</label>
                            <input type='radio' id='option2' name='options' value="option2" />
                            <label for='option1'>Public</label>
                        </div>
                    </div>
                    <div className='allow'>
                        <span><p><strong>Allow opt-in for cross Tree suggestion</strong></p>
                        <p>Let others discover connections to your family tree</p></span>
                        <label className='switch'>
                            <input type='checkbox' />
                            <span className='slider round'></span>
                        </label>
                    </div>
                </form>
            </div>

            <div className="c-container">
                
                <form className="c-form">
                    <div className="c-header">
                        <><FaGlobe /></>
                        <h2 className="c-info"> Cultural/Dialect Tag (Optional)</h2>
                    </div>

                    <div className='c-body'>
                        <p>Add cultural context to help preserve your heritage language.</p>
                        <div className='c-drop'>
                            <label htmlFor="dialect-select">Select Dialect</label>
                            <select
                                id="dialect-select"
                                name="dialect"
                                value={dialect}
                                onChange={e => setDialect(e.target.value)}
                            >
                                <option value="" disabled>Select dialect</option>
                                <option value="Yoruba">Yoruba</option>
                                <option value="Igbo">Igbo</option>
                                <option value="Hausa">Hausa</option>
                                <option value="Tiv">Tiv</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>


            <div className="tree-container">
                
                <form className="tree-form">
                    <div className="tree-header">
                        <><FaGear /></>
                        <h2 className="tree-info"> Tree Structure Setting</h2>
                    </div>

                    <div className='tree-body'>
                        <p>Configure how your family tree handles relationships and connections.</p>
                        <div className='tree-drop'>
                            <span><input type="checkbox" id='myCheckbox' />
                            <label for="myCheckbox">Enable polygamy</label></span>
                            <span><input type="checkbox" id='myCheckbox' />
                            <label for="myCheckbox">Allow unknown parents</label></span>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ProfileForm;