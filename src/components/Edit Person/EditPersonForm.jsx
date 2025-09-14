import React, { useState, useMemo } from 'react';
import { TextInput, TextArea } from '../Input';
import SelectDropdown from '../SelectDropdown';
import DateInput from '../DateInput';
import Checkbox from '../Checkbox';
import FileUpload from '../FileUpload';
import AudioUploadCard from '../AudioUploadCard';
import EventCard from '../EventCard';
import Row from '../../layout/containers/Row';
import Button from '../Button';
import Card from '../../layout/containers/Card';
import Text from '../Text';
import Column from '../../layout/containers/Column';
import { User, BookOpen, Shield, Calendar, Heart } from 'lucide-react';
import StoriesList from './StoriesList';
import PhotosList from './PhotosList';
import countryList from "react-select-country-list";

const EditPersonForm = ({ initialData, onSubmit, onCancel }) => {
  const { person, marriages, events, stories, photos } = initialData;

  const [formData, setFormData] = useState({
    fullName: person.name || '',
    gender: person.gender || '',
    dateOfBirth: person.dateOfBirth || '',
    isDeceased: person.isDeceased || false,
    phoneNumber: person.phoneNumber || '',
    email: person.email || '',
    dateOfDeath: person.dateOfDeath || '',
    placeOfBirth: person.placeOfBirth || '',
    placeOfDeath: person.placeOfDeath || '',
    nationality: person.nationality || '',
    countryOfResidence: person.countryOfResidence || '',
    profilePhoto: person.profilePhoto || null,
    biography: person.biography || '',
    tribe: person.tribe || '',
    language: person.language || '',
    privacyLevel: person.privacyLevel || 'membersOnly',
    allowGlobalMatching: person.allowGlobalMatching !== undefined ? person.allowGlobalMatching : true,
    events: events || [],
    marriages: marriages || [],
    stories: stories || [],
    photos: photos || [],
  });

  const [errors, setErrors] = useState({});

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

  const countryOptions = useMemo(() => countryList().getData(), []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEventsChange = (newEvents) => {
    setFormData(prev => ({
      ...prev,
      events: newEvents
    }));
  };



  const handleStoriesChange = (newStories) => {
    setFormData(prev => ({
      ...prev,
      stories: newStories
    }));
  };

  const handlePhotosChange = (newPhotos) => {
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
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

  return (
    <form onSubmit={handleSubmit} className="premium-form">

      {/* Section 1: Personal Information */}
      <Card margin='0px 0px 20px 0px'>
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
            <label className="form-label">Date of Birth</label>
            <DateInput
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              placeholder="Select date of birth"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Place of Birth</label>
            <TextInput
              value={formData.placeOfBirth}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
              placeholder="Enter place of birth"
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
                  placeholder="Enter place of death"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <TextInput
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <TextInput
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nationality</label>
            <SelectDropdown
              options={countryOptions}
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Enter nationality"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Country of Residence</label>
            <SelectDropdown
              options={countryOptions}
              value={formData.countryOfResidence}
              onChange={(e) => handleInputChange('countryOfResidence', e.target.value)}
              placeholder="Enter country of residence"
            />
          </div>

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
      </Card>

      {/* Section 2: Marriages */}
      <Card margin='0px 0px 20px 0px'>
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <Heart size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Marriages</Text>
          </Column>
        </div>
        {/* For simplicity, just display marriage count and details */}
        <div className="form-group">
          {formData.marriages.length === 0 ? (
            <Text>No marriages recorded.</Text>
          ) : (
            formData.marriages.map((m, idx) => (
              <Card key={idx} margin="0.5rem 0" padding="0.5rem">
                <Text>Marriage Type: {m.marriageType}</Text>
                <Text>Spouses: {m.spouses ? m.spouses.join(', ') : 'N/A'}</Text>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Section 3: Events */}
      <Card margin='0px 0px 20px 0px'>
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <Calendar size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Events</Text>
          </Column>
        </div>
        <EventCard
          events={formData.events}
          onEventsChange={handleEventsChange}
        />
      </Card>

      {/* Section 4: Stories */}
      <Card margin='0px 0px 20px 0px'>
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <BookOpen size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Stories</Text>
          </Column>
        </div>
        <StoriesList stories={formData.stories} onChange={handleStoriesChange} />
      </Card>

      {/* Section 5: Photos */}
      <Card margin='0px 0px 20px 0px'>
        <div className="section-header">
          <Card fitContent margin='0.5rem' className="section-icon">
            <User size={20} />
          </Card>
          <Column padding='0px' margin='0px' gap='1px'>
            <Text as='p' variant='heading2'>Photos</Text>
          </Column>
        </div>
        <PhotosList photos={formData.photos} onChange={handlePhotosChange} />
      </Card>

      {/* Section 6: Privacy */}
      <Card margin='0px 0px 20px 0px'>
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
        <div className="form-group">
          <label className="form-checkbox">
            <Checkbox
              checked={formData.allowGlobalMatching}
              onChange={(e) => handleInputChange('allowGlobalMatching', e.target.checked)}
              label="Allow Global Matching"
            />
          </label>
        </div>
      </Card>

      <Row className="button-group">
        <Button fullWidth variant='danger' onClick={onCancel}>
          Cancel
        </Button>
        <Button fullWidth type="submit">
          Save Changes
        </Button>
      </Row>
    </form>
  );
};

export default EditPersonForm;
