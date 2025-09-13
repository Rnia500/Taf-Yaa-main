// AddSpouseForm.jsx
import React, { useState, useMemo } from 'react';
import { TextInput, TextArea } from '../../Input';
import '../../../styles/AddRelativeModal.css';
import SelectDropdown from '../../SelectDropdown';
import DateInput from '../../DateInput';
import Checkbox from '../../Checkbox';
import FileUpload from '../../FileUpload';
import AudioUploadCard from '../../AudioUploadCard';
import EventCard from '../../EventCard';
import Row from '../../../layout/containers/Row';
import Button from '../../Button';
import { User, Heart, Shield, BookOpen, Calendar } from 'lucide-react';
import { MarriageModel } from '../../../models/treeModels/MarriageModel';
import countryList from "react-select-country-list";
import Column from '../../../layout/containers/Column';
import Text from '../../Text';
import Card from '../../../layout/containers/Card';

const AddSpouseForm = ({ onSubmit, onCancel, husbandName, isFirstSpouse = false, suggestedWifeOrder = 1, isSubmitting = false }) => {

  const [formData, setFormData] = useState({
    // Section 1: New Spouse's Information
    fullName: '',
    gender: '',
    dateOfBirth: '',
    isDeceased: false,
    dateOfDeath: '',
    phoneNumber: '',
    email: '',
    placeOfBirth: '',
    placeOfDeath: '',
    nationality: '',
    countryOfResidence: '',
    profilePhoto: null,
    biography: '',
    tribe: '',
    language: '',

    // Section 2: Oral History
    storyTitle: '',
    audioFile: null,
    audioURL: null,

    // Section 3: Marriage Information
    marriageType: 'monogamous',
    marriageDate: '',
    marriageLocation: '',
    marriageNotes: '',
    wifeOrder: suggestedWifeOrder,

    // Section 4: Events
    events: [],

    // Section 5: Privacy
    privacyLevel: 'membersOnly',
    allowGlobalMatching: true,


  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEventsChange = (newEventsArray) => {
    setFormData(prev => ({
      ...prev,
      events: newEventsArray
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
    { value: 'private', label: 'Only Me (Highest Privacy)' },
    { value: 'membersOnly', label: 'Family Members Only' },
    { value: 'authenticated', label: 'Registered Users' },
    { value: 'public', label: 'Public (Lowest Privacy)' }
  ];

  const marriageTypeOptions = [
    { value: 'monogamous', label: 'Monogamous' },
    { value: 'polygamous', label: 'Polygamous' }
  ];

  const countryOptions = useMemo(() => countryList().getData(), []);

  return (
    <form onSubmit={handleSubmit} className="premium-form">

      {/* Display the husband's name at the top of the form */}
      {husbandName && (
        <Card margin='0px 0px 20px 0px'>
          <Text variant='heading3' as='p'>Spouse of {husbandName}</Text>
        </Card>
      )}

      {/* Section 1: Personal Information */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <User size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Personal Information</Text>
          </Column>
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

            <Row gap="0.5rem" padding='0px' margin='0px' justifyContent="start">
              <Column gap='0.10rem' padding='0px' margin='0px'>
                <label className="form-label">Date of Birth</label>
                <DateInput
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  placeholder="Select date of birth"
                />
              </Column>
              <Column gap='0.10rem' padding='0px' margin='0px'>
                <label className="form-label">Place of Birth</label>
                <TextInput
                  value={formData.placeOfBirth}
                  onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                  placeholder="Enter place of birth"
                />
              </Column>
            </Row>

          </div>

          <div className="form-group">

            <Row gap="0.5rem" padding='0px' margin='0px' justifyContent="start">
              <Column gap='0.10rem' padding='0px' margin='0px'>
                <label className="form-label">Phone Number</label>
                <TextInput
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                />
              </Column>
              <Column gap='0.10rem' padding='0px' margin='0px'>
                <label className="form-label">Email</label>
                <TextInput
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </Column>
            </Row>

          </div>

          <div className="form-group">

            <Column gap='0.10rem' padding='2px' margin='0px'>
              <label className="form-label">Nationalty</label>
              <SelectDropdown
                options={countryOptions}
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="Enter Nationality"
              />
            </Column>
          </div>
          <div className="form-group">
            <Column gap='0.10rem' padding='2px' margin='0px'>
              <label className="form-label">Country of Residence</label>
              <SelectDropdown
                options={countryOptions}
                value={formData.countryOfResidence}
                onChange={(e) => handleInputChange('countryOfResidence', e.target.value)}
                placeholder="Enter The Country of Residence"
              />
            </Column>

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

            <>
              <div className="form-group">
                <label className="form-label">Date of Death</label>
                <DateInput
                  value={formData.dateOfDeath}
                  onChange={(e) => handleInputChange('dateOfDeath', e.target.value)}
                  placeholder="Select date of death"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Place of Death</label>
                <TextInput
                  value={formData.placeOfDeath}
                  onChange={(e) => handleInputChange('placeOfDeath', e.target.value)}
                  placeholder="Select Place of death"
                />
              </div>
            </>
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
          <Card fitContent margin='0.5rem' className="section-icon">
            <BookOpen size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Oral History</Text>
          </Column>
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

      {/* Section 3: Marriage Information */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <Heart size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Marriage Information {husbandName && `(Spouse of ${husbandName})`}</Text>
          </Column>
        </div>

        <div className="form-grid">

          {/*  CONDITIONAL FIELD: Only show "Marriage Type" for the FIRST spouse */}
          {isFirstSpouse && (
            <div className="form-group">
              <label className="form-label">Marriage Type *</label>
              <SelectDropdown
                value={formData.marriageType}
                onChange={(e) => handleInputChange('marriageType', e.target.value)}
                options={marriageTypeOptions}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Marriage Date</label>
            <DateInput
              value={formData.marriageDate}
              onChange={(e) => handleInputChange('marriageDate', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location of Marriage</label>
            <TextInput
              value={formData.marriageLocation}
              onChange={(e) => handleInputChange('marriageLocation', e.target.value)}
              placeholder="Enter marriage location"
            />
          </div>

          {formData.marriageType === 'polygamous' && (
            <div className="form-group">
              <label className="form-label">Order (position among wives)</label>
              <TextInput
                type="number"
                value={formData.wifeOrder}
                onChange={(e) => handleInputChange('wifeOrder', parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
          )}

          <div className="form-group full-width">
            <label className="form-label">Notes about the Marriage</label>
            <TextArea
              value={formData.marriageNotes}
              onChange={(e) => handleInputChange('marriageNotes', e.target.value)}
              placeholder="Share special memories..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Events */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <Calendar size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Events</Text>
            <Text as='p' variant='caption1'>Birth, Death and Marriage are auto included</Text>
          </Column>
        </div>

        <EventCard
          events={formData.events}
          onEventsChange={handleEventsChange}
        />
      </div>

      {/* Section 5: Privacy */}
      <div className="section-card">
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <Shield size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Privacy Settings</Text>
          </Column>
        </div>

        <div className="form-group">
          <label className="form-label">Profile Visibility</label>
          <SelectDropdown
            value={formData.privacyLevel}
            onChange={(e) => handleInputChange('privacyLevel', e.target.value)}
            options={privacyOptions}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <Checkbox
            checked={formData.allowGlobalMatching}
            onChange={(e) => handleInputChange('allowGlobalMatching', e.target.checked)}
            label="Allow Global Matching"
          />
        </label>
      </div>


      <Row className="button-group">
        <Button fullWidth variant='danger' onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button fullWidth type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Add Spouse"}
        </Button>
      </Row>
    </form>
  );
};

export default AddSpouseForm;
