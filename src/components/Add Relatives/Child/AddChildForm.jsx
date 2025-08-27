import React, { useState } from 'react';
import { TextInput, TextArea } from '../../Input';
import SelectDropdown from '../../SelectDropdown';
import DateInput from '../../DateInput';
import Checkbox from '../../Checkbox';
import FileUpload from '../../FileUpload';
import AudioUploadCard from '../../AudioUploadCard';
import Row from '../../../layout/containers/Row';
import Button from '../../Button';
import { User, BookOpen, Shield } from 'lucide-react';

const AddChildForm = ({ onSubmit, onCancel, parent1Name, parent2Name }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    isDeceased: false,
    dateOfDeath: '',
    profilePhoto: null,
    biography: '',
    tribe: '',
    language: '',
    storyTitle: '',
    audioFile: null,
    audioURL: null,
    privacy: 'membersOnly'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData); 
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  const privacyOptions = [
    { value: 'membersOnly', label: 'Members Only (Highest Privacy)' },
    { value: 'authenticated', label: 'Registered Users' },
    { value: 'public', label: 'Public' }
  ];

  return (
    <form onSubmit={handleSubmit} className="premium-form">
      
      {/* Display the parents' names at the top of the form */}
      {parent1Name && parent2Name && (
        <div className="parents-name-display" style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'}}>
          <h3 style={{margin: 0, color: '#495057', fontSize: '18px', fontWeight: '600'}}>Child of {parent1Name} and {parent2Name}</h3>
        </div>
      )}

      {/* Section 1: Personal Information */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon">
            <User size={20} />
          </div>
          <h3 className="section-title">Personal Information</h3>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <TextInput
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
              placeholder="Enter full name"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Gender *</label>
            <SelectDropdown
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              options={genderOptions}
              required
              placeholder="Select gender"
            />
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <DateInput
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              placeholder="Select date of birth"
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <Checkbox
                checked={formData.isDeceased}
                onChange={(e) => handleInputChange('isDeceased', e.target.checked)}
                label="Is Deceased?"
              />
            </label>
          </div>

          {formData.isDeceased && (
            <div className="form-group">
              <label className="form-label">Date of Death</label>
              <DateInput
                value={formData.dateOfDeath}
                onChange={(e) => handleInputChange('dateOfDeath', e.target.value)}
                placeholder="Select date of death"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <FileUpload
              onChange={(file) => handleInputChange('profilePhoto', file)}
              accept="image/*"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Biography</label>
            <TextArea
              value={formData.biography}
              onChange={(e) => handleInputChange('biography', e.target.value)}
              placeholder="Share their life story..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tribe/Clan</label>
            <TextInput
              value={formData.tribe}
              onChange={(e) => handleInputChange('tribe', e.target.value)}
              placeholder="Enter tribe or clan"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <TextInput
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              placeholder="Primary language"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Oral History */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon">
            <BookOpen size={20} />
          </div>
          <h3 className="section-title">Oral History</h3>
        </div>

        <div className="form-group">
          <label className="form-label">First Audio Story Title</label>
          <TextInput
            value={formData.storyTitle}
            onChange={(e) => handleInputChange('storyTitle', e.target.value)}
            placeholder="Enter story title"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Upload Audio Story</label>
          <AudioUploadCard
            onAudioUpload={(file, audioURL) => {
              handleInputChange('audioFile', file);
              handleInputChange('audioURL', audioURL);
            }}
            storyTitle={formData.storyTitle}
          />
        </div>
      </div>

      {/* Section 3: Privacy */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon">
            <Shield size={20} />
          </div>
          <h3 className="section-title">Privacy Settings</h3>
        </div>

        <div className="form-group">
          <label className="form-label">Profile Visibility</label>
          <SelectDropdown
            value={formData.privacy}
            onChange={(e) => handleInputChange('privacy', e.target.value)}
            options={privacyOptions}
          />
        </div>
      </div>

      <Row className="button-group">
        <Button fullWidth variant='danger' onClick={onCancel}>
          Cancel
        </Button>
        <Button fullWidth type="submit">
          Add Child
        </Button>
      </Row>
    </form>
  );
};

export default AddChildForm;
