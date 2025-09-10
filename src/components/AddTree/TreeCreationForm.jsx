import React, { useState, useMemo } from 'react';
import { TextInput, TextArea } from '../Input';
import SelectDropdown from '../SelectDropdown';
import DateInput from '../DateInput';
import Checkbox from '../Checkbox';
import FileUpload from '../FileUpload';
import AudioUploadCard from '../AudioUploadCard';
import Row from '../../layout/containers/Row';
import Button from '../Button';
import { TreePine, User, Shield, Globe, Settings } from 'lucide-react';
import Card from '../../layout/containers/Card';
import Text from '../Text';
import Column from '../../layout/containers/Column';
import ToggleSwitch from '../ToggleSwitch';
import countryList from "react-select-country-list";

const TreeCreationForm = ({ onSubmit, onCancel, createdBy, interfaceLanguage = 'en' }) => {
  const [formData, setFormData] = useState({
    // Tree Information
    familyName: '',

    // Root Person Information
    rootPersonName: '',
    rootPersonGender: '',
    rootPersonDob: '',
    rootPersonPlaceOfBirth: '',
    rootPersonPhoto: null,
    rootPersonBiography: '',
    rootPersonStoryTitle: '',
    rootPersonAudioFile: null,
    rootPersonAudioURL: null,

    // Privacy & Visibility
    isPublic: false,
    invitesEnabled: true,

    // Language
    language: interfaceLanguage,

    // Role Assignment
    globalMatchOptIn: false,
    defaultMemberVisibility: 'visible',
    allowMergeRequests: false,
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
    if (!formData.familyName.trim()) {
      newErrors.familyName = 'Tree name is required';
    }
    if (!formData.rootPersonName.trim()) {
      newErrors.rootPersonName = 'Root person name is required';
    }
    if (!formData.rootPersonGender) {
      newErrors.rootPersonGender = 'Root person gender is required';
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

  const visibilityOptions = [
    { value: 'visible', label: 'Visible' },
    { value: 'hidden', label: 'Hidden' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
    { value: 'ar', label: 'Arabic' },
    { value: 'sw', label: 'Swahili' },
    // Add more languages as needed
  ];

  const countryOptions = useMemo(() => countryList().getData(), []);

  return (
    <form onSubmit={handleSubmit} className="premium-form">

      {/* Section 1: Tree Information */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <TreePine size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Tree Information</Text>
          </Column>
        </div>

        <div className="form-group">
          <label className="form-label">Tree Name *</label>
          <TextInput
            value={formData.familyName}
            onChange={(e) => handleInputChange('familyName', e.target.value)}
            required
            placeholder="Enter family tree name"
          />
          {errors.familyName && <span className="error-message">{errors.familyName}</span>}
        </div>
      </div>

      {/* Section 2: Root Person Information */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <User size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Root Person Information</Text>
            <Text as='p' variant='caption1'>This person will be the starting point of your family tree</Text>
          </Column>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <TextInput
              value={formData.rootPersonName}
              onChange={(e) => handleInputChange('rootPersonName', e.target.value)}
              required
              placeholder="Enter full name"
            />
            {errors.rootPersonName && <span className="error-message">{errors.rootPersonName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Gender *</label>
            <SelectDropdown
              value={formData.rootPersonGender}
              onChange={(e) => handleInputChange('rootPersonGender', e.target.value)}
              options={genderOptions}
              required
              placeholder="Select gender"
            />
            {errors.rootPersonGender && <span className="error-message">{errors.rootPersonGender}</span>}
          </div>

          <div className="form-group">
            <Row gap="0.5rem" padding='0px' margin='0px' justifyContent="start">
              <Column gap='0.10rem' padding='0px' margin='0px'>
                <label className="form-label">Date of Birth</label>
                <DateInput
                  value={formData.rootPersonDob}
                  onChange={(e) => handleInputChange('rootPersonDob', e.target.value)}
                  placeholder="Select date of birth"
                />
              </Column>
              <Column gap='0.10rem' padding='0px' margin='0px'>
                <label className="form-label">Place of Birth</label>
                <TextInput
                  value={formData.rootPersonPlaceOfBirth}
                  onChange={(e) => handleInputChange('rootPersonPlaceOfBirth', e.target.value)}
                  placeholder="Enter place of birth"
                />
              </Column>
            </Row>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <FileUpload
              onChange={(file) => handleInputChange('rootPersonPhoto', file)}
              accept="image/*"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Biography</label>
            <TextArea
              value={formData.rootPersonBiography}
              onChange={(e) => handleInputChange('rootPersonBiography', e.target.value)}
              placeholder="Share their life story..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Story Title</label>
            <TextInput
              value={formData.rootPersonStoryTitle}
              onChange={(e) => handleInputChange('rootPersonStoryTitle', e.target.value)}
              placeholder="Enter story title"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Upload Audio Story</label>
            <AudioUploadCard
              onAudioUpload={(file, audioURL) => {
                handleInputChange('rootPersonAudioFile', file);
                handleInputChange('rootPersonAudioURL', audioURL);
              }}
              storyTitle={formData.rootPersonStoryTitle}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Privacy & Visibility */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <Shield size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Privacy & Visibility</Text>
          </Column>
        </div>

        <div className="form-group">
          <label className="form-label">Tree Visibility</label>
          <ToggleSwitch
            checked={formData.isPublic}
            onChange={(checked) => handleInputChange('isPublic', checked)}
            label={formData.isPublic ? "Public" : "Private"}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Allow Invites</label>
          <ToggleSwitch
            checked={formData.invitesEnabled}
            onChange={(checked) => handleInputChange('invitesEnabled', checked)}
            label={formData.invitesEnabled ? "Enabled" : "Disabled"}
          />
        </div>
      </div>

      {/* Section 4: Language Defaults */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <Globe size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Language Defaults</Text>
          </Column>
        </div>

        <div className="form-group">
          <label className="form-label">Primary Language</label>
          <SelectDropdown
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            options={languageOptions}
          />
        </div>
      </div>

      {/* Section 5: Role Assignment */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <Settings size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Role Assignment</Text>
          </Column>
        </div>

        <div className="form-group">
          <label className="form-label">Default Member Visibility</label>
          <SelectDropdown
            value={formData.defaultMemberVisibility}
            onChange={(e) => handleInputChange('defaultMemberVisibility', e.target.value)}
            options={visibilityOptions}
          />
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <Checkbox
              checked={formData.globalMatchOptIn}
              onChange={(e) => handleInputChange('globalMatchOptIn', e.target.checked)}
              label="Global Match Opt-In"
            />
          </label>
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <Checkbox
              checked={formData.allowMergeRequests}
              onChange={(e) => handleInputChange('allowMergeRequests', e.target.checked)}
              label="Allow Merge Requests"
            />
          </label>
        </div>
      </div>

      <Row className="button-group">
        <Button fullWidth variant='danger' onClick={onCancel}>
          Cancel
        </Button>
        <Button fullWidth type="submit">
          Create Tree
        </Button>
      </Row>
    </form>
  );
};

export default TreeCreationForm;
