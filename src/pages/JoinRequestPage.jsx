import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FlexContainer from '../layout/containers/FlexContainer';
import Text from '../components/Text';
import Card from '../layout/containers/Card';
import Row from '../layout/containers/Row';
import Column from '../layout/containers/Column';
import Button from '../components/Button';
import { TextInput, TextArea } from '../components/Input';
import SelectDropdown from '../components/SelectDropdown';
import DateInput from '../components/DateInput';
import MediaAttachment from '../components/MediaAttachment';
import { submitJoinRequest } from '../services/joinRequestService';
import { validateInviteCode } from '../services/inviteService';
import dataService from '../services/dataService';
import useToastStore from '../store/useToastStore';
import { useAuth } from '../context/AuthContext';
import { getDirectLinePeople, getSpouseOptions } from '../utils/treeUtils/treeLayout';
import { CheckCircle, Upload, User, Users, FileText, Plus, X } from 'lucide-react';
import { ImageAttachmentCard, VideoAttachmentCard, AudioAttachmentCard } from '../components/AttachmentCard.jsx';

const JoinRequestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const { currentUser } = useAuth();

  const [inviteData, setInviteData] = useState(null);
  const [people, setPeople] = useState([]);
  const [marriages, setMarriages] = useState([]);
  const [directLinePeople, setDirectLinePeople] = useState([]);
  const [spouseOptions, setSpouseOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    notes: '',
    claimedFatherId: null,
    claimedMotherId: null,
    selectedParentId: null,
    selectedSpouseId: null,
    proofFiles: []
  });

  // Load invite data and tree information
  useEffect(() => {
    const loadData = async () => {
      try {
        const inviteId = searchParams.get('inviteId');
        const code = searchParams.get('code');

        if (!inviteId || !code) {
          setError('Invalid invitation parameters');
          setLoading(false);
          return;
        }

        
        const result = await validateInviteCode(code);
        if (result.inviteId !== inviteId) {
          throw new Error('Invite ID mismatch');
        }

        setInviteData(result);

        
        const peopleData = await dataService.getPeopleByTreeId(result.invite.treeId);
        const allMarriages = await dataService.getAllMarriages();

       
        const marriagesData = allMarriages.filter(m => {
          if (m.marriageType === 'monogamous') {
            return m.spouses?.some(spouseId => peopleData.some(p => p.id === spouseId));
          } else if (m.marriageType === 'polygamous') {
            return (m.husbandId && peopleData.some(p => p.id === m.husbandId)) ||
                   m.wives?.some(w => peopleData.some(p => p.id === w.wifeId));
          }
          return false;
        });

        setPeople(peopleData || []);
        setMarriages(marriagesData || []);

        // For non-targeted invites, get direct line people for parent selection
        if (result.invite.type === 'nontargeted') {
          const directLine = getDirectLinePeople(peopleData || [], marriagesData || []);
          setDirectLinePeople(directLine);
        } else {
          // For targeted invites, pre-fill parents
          setFormData(prev => ({
            ...prev,
            claimedFatherId: result.invite.fatherId,
            claimedMotherId: result.invite.motherId
          }));
        }

      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.message);
        addToast('Failed to load invitation data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams, addToast]);

  // Handle parent selection change for non-targeted invites
  useEffect(() => {
    if (inviteData?.invite.type === 'nontargeted' && formData.selectedParentId && people.length > 0 && marriages.length > 0) {
      const { spouse, wives } = getSpouseOptions(formData.selectedParentId, people, marriages);
      const spouseOptionsList = spouse ? [spouse] : wives;
      setSpouseOptions(spouseOptionsList);

      // Auto-select spouse if only one option
      if (spouseOptionsList.length === 1) {
        setFormData(prev => ({
          ...prev,
          selectedSpouseId: spouseOptionsList[0].id
        }));
      } else if (spouseOptionsList.length === 0) {
        setFormData(prev => ({
          ...prev,
          selectedSpouseId: null
        }));
      }

      // Set father/mother based on selected parent
      const selectedPerson = people.find(p => p.id === formData.selectedParentId);
      if (selectedPerson) {
        if (selectedPerson.gender === 'male') {
          setFormData(prev => ({
            ...prev,
            claimedFatherId: formData.selectedParentId,
            claimedMotherId: spouse ? spouse.id : null
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            claimedMotherId: formData.selectedParentId,
            claimedFatherId: spouse ? spouse.id : null
          }));
        }
      }
    }
  }, [formData.selectedParentId, people, marriages, inviteData]);

  // Handle spouse selection change
  useEffect(() => {
    if (inviteData?.invite.type === 'nontargeted' && formData.selectedSpouseId && formData.selectedParentId) {
      const selectedPerson = people.find(p => p.id === formData.selectedParentId);
      const selectedSpouse = people.find(p => p.id === formData.selectedSpouseId);
      if (selectedPerson && selectedSpouse) {
        if (selectedPerson.gender === 'male') {
          setFormData(prev => ({
            ...prev,
            claimedFatherId: formData.selectedParentId,
            claimedMotherId: formData.selectedSpouseId
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            claimedMotherId: formData.selectedParentId,
            claimedFatherId: formData.selectedSpouseId
          }));
        }
      }
    }
  }, [formData.selectedSpouseId, formData.selectedParentId, people, inviteData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };





  const removeProofFile = (index) => {
    setFormData(prev => ({
      ...prev,
      proofFiles: prev.proofFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.gender) {
      setError('Gender is required');
      return;
    }

    if (inviteData?.invite.type === 'nontargeted') {
      if (!formData.selectedParentId) {
        setError('Please select a parent from the direct line');
        return;
      }
      // Allow single parent if no spouse available
      if (!formData.claimedFatherId && !formData.claimedMotherId) {
        setError('At least one parent must be selected');
        return;
      }
    }

    if (formData.proofFiles.length === 0) {
      setError('At least one proof document is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitJoinRequest({
        treeId: inviteData.invite.treeId,
        inviteCode: inviteData.invite.code,
        inviteId: inviteData.inviteId,
        submittedBy: currentUser.uid,
        claimedFatherId: formData.claimedFatherId,
        claimedMotherId: formData.claimedMotherId,
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate || null,
        notes: formData.notes || null,
        proofFiles: formData.proofFiles
      });

      addToast('Join request submitted successfully! Please wait for admin approval.', 'success');
      navigate('/my-trees'); // Redirect to user's trees page

    } catch (err) {
      console.error('Failed to submit join request:', err);
      setError(`Failed to submit request: ${err.message}`);
      addToast('Failed to submit join request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <FlexContainer direction="vertical" align="center" justify="center" minHeight="100vh">
        <Text variant="body1">Loading invitation details...</Text>
      </FlexContainer>
    );
  }

  if (error && !inviteData) {
    return (
      <FlexContainer direction="vertical" align="center" justify="center" minHeight="100vh" gap="20px">
        <Text variant="heading2" color="error">Error Loading Invitation</Text>
        <Text variant="body1" color="error">{error}</Text>
        <Button variant="primary" onClick={() => navigate('/join')}>
          Back to Join Page
        </Button>
      </FlexContainer>
    );
  }

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <FlexContainer direction="vertical" padding="20px" gap="20px" align="center" height="100vh" overflow="auto">
      <Card padding="30px" maxWidth="800px" width="100%">
        <Column gap="30px">
          <FlexContainer direction="vertical" align="center" gap="10px">
            <CheckCircle size={48} color="var(--color-success)" />
            <Text variant="heading1" textAlign="center">Complete Your Join Request</Text>
            <Text variant="body1" textAlign="center" color="gray">
              Fill in your information and provide proof documents for admin approval.
            </Text>
          </FlexContainer>

          {/* Invite Summary */}
          <Card backgroundColor="var(--color-success-light)" padding="20px">
            <Row align="center" gap="10px" margin="0px 0px 10px 0px">
              <Users size={20} color="var(--color-primary)" />
              <Text variant="body1" bold>Invitation Details</Text>
            </Row>
            <FlexContainer direction="vertical" gap="8px">
              <Text variant="body2"><strong>Family Name:</strong> {inviteData?.tree?.familyName || 'Unknown Family'}</Text>
              <Text variant="body2"><strong>Role:</strong> {inviteData?.invite.role}</Text>
              <Text variant="body2"><strong>Type:</strong> {inviteData?.invite.type}</Text>
              {inviteData?.invite.notes && (
                <Text variant="body2"><strong>Notes:</strong> {inviteData.invite.notes}</Text>
              )}
            </FlexContainer>
          </Card>

          {/* Personal Information */}
          <Card backgroundColor="var(--color-transparent)" borderColor="var(--color-gray-light)" padding="20px">
            <Row align="center" gap="10px" margin="0px 0px 20px 0px">
              <User size={20} color="var(--color-primary)" />
              <Text variant="body1" bold>Personal Information</Text>
            </Row>
            <Column gap="20px">
              <Row gap="20px" padding="0px" margin="0px">
                <TextInput
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
                <SelectDropdown
                  label="Gender"
                  options={genderOptions}
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  placeholder="Select gender"
                  required
                />
              </Row>
              <DateInput
                label="Birth Date (Optional)"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </Column>
          </Card>

          {/* Parent Selection for Non-Targeted Invites */}
          {inviteData?.invite.type === 'nontargeted' && (
            <Card backgroundColor="var(--color-transparent)" borderColor="var(--color-gray-light)" padding="20px">
              <Row align="center" gap="10px" margin="0px 0px 20px 0px">
                <Users size={20} color="var(--color-primary)" />
                <Text variant="body1" bold>Parent Selection</Text>
              </Row>
              <Column gap="20px">
                <SelectDropdown
                  label="Select Direct Line Parent"
                  options={directLinePeople.map(person => ({
                    value: person.id,
                    label: person.name
                  }))}
                  value={formData.selectedParentId}
                  onChange={(e) => handleInputChange('selectedParentId', e.target.value)}
                  placeholder="Select a parent from the direct line"
                  required
                />
                {spouseOptions.length > 1 && (
                  <SelectDropdown
                    label="Select Spouse (for polygamous relationships)"
                    options={spouseOptions.map(person => ({
                      value: person.id,
                      label: person.name
                    }))}
                    value={formData.selectedSpouseId}
                    onChange={(e) => handleInputChange('selectedSpouseId', e.target.value)}
                    placeholder="Select spouse"
                  />
                )}
                <Text variant="caption" color="gray-dark">
                  Selected Parents: {formData.claimedFatherId ? `Father: ${people.find(p => p.id === formData.claimedFatherId)?.name}` : ''} {formData.claimedMotherId ? `Mother: ${people.find(p => p.id === formData.claimedMotherId)?.name}` : ''}
                </Text>
              </Column>
            </Card>
          )}

          {/* Pre-filled Parents for Targeted Invites */}
          {inviteData?.invite.type === 'targeted' && (
            <Card backgroundColor="var(--color-transparent)" borderColor="var(--color-gray-light)" padding="20px">
              <Row align="center" gap="10px" margin="0px 0px 20px 0px">
                <Users size={20} color="var(--color-primary)" />
                <Text variant="body1" bold>Assigned Parents</Text>
              </Row>
              <Text variant="body2">
                Parents: {formData.claimedFatherId ? `Father: ${people.find(p => p.id === formData.claimedFatherId)?.name}` : ''} {formData.claimedMotherId ? `Mother: ${people.find(p => p.id === formData.claimedMotherId)?.name}` : ''}
              </Text>
            </Card>
          )}

          {/* Proof Documents */}
          <Card backgroundColor="var(--color-transparent)" borderColor="var(--color-gray-light)" padding="20px">
            <Row align="center" gap="10px" margin="0px 0px 20px 0px">
              <Upload size={20} color="var(--color-primary)" />
              <Text variant="body1" bold>Proof Documents</Text>
            </Row>
            <Column gap="20px">
              <MediaAttachment
                onAttachmentAdded={(attachment) => {
                  setFormData(prev => ({
                    ...prev,
                    proofFiles: [...prev.proofFiles, {
                      url: attachment.url,
                      type: attachment.type,
                      name: attachment.caption || attachment.attachmentId,
                      size: attachment.size,
                      attachmentId: attachment.attachmentId,
                      cloudinaryId: attachment.cloudinaryId,
                      format: attachment.format,
                      duration: attachment.duration,
                      width: attachment.width,
                      height: attachment.height
                    }]
                  }));
                }}
              />
              {formData.proofFiles.length > 0 && (
                <Column gap="10px">
                  <Text variant="body2" bold>Attached Files:</Text>
                  <Row gap="10px" padding="0px" margin="0px" wrap="wrap">
                    {formData.proofFiles.map((file, index) => {
                      if (file.type === 'image') {
                        return (
                          <ImageAttachmentCard
                            key={index}
                            src={file.url}
                            alt={file.name}
                            caption={file.name}
                            uploader={currentUser?.uid}
                            onClick={() => {}}
                            onDelete={() => removeProofFile(index)}
                            attachmentId={`proof-${index}`}
                          />
                        );
                      } else if (file.type === 'video') {
                        return (
                          <VideoAttachmentCard
                            key={index}
                            src={file.url.replace(/\.[^/.]+$/, '.jpg')}
                            alt={file.name}
                            caption={file.name}
                            duration={file.duration}
                            uploader={currentUser?.uid}
                            onClick={() => {}}
                            onDelete={() => removeProofFile(index)}
                            attachmentId={`proof-${index}`}
                          />
                        );
                      } else if (file.type === 'audio') {
                        return (
                          <AudioAttachmentCard
                            key={index}
                            thumbnail={null}
                            duration={file.duration}
                            title={file.name}
                            uploader={currentUser?.uid}
                            onClick={() => {}}
                            onDelete={() => removeProofFile(index)}
                            attachmentId={`proof-${index}`}
                          />
                        );
                      } else {
                        // PDF or other file types
                        return (
                          <div key={index} className="relative w-[120px] h-[120px] rounded-xl overflow-hidden shadow-md group cursor-pointer bg-gray-100 flex flex-col items-center justify-center">
                            <div className="absolute top-1 right-1 z-20">
                              <Card
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProofFile(index);
                                }}
                                style={{
                                  padding: '3px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  borderRadius: '50%',
                                  cursor: 'pointer',
                                  border: '1px solid #e5e7eb'
                                }}
                              >
                                <X size={12} color="#dc2626" />
                              </Card>
                            </div>

                            <div className="text-center">
                              <FileText className="w-8 h-8 text-gray-400 mb-1" />
                              <p className="text-[10px] font-semibold text-gray-600 truncate max-w-[100px]">
                                {file.name}
                              </p>
                              <p className="text-[9px] text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </Row>
                </Column>
              )}
            </Column>
          </Card>

          {/* Additional Notes */}
          <Card backgroundColor="var(--color-transparent)" borderColor="var(--color-gray-light)" padding="20px">
            <Row align="center" gap="10px" margin="0px 0px 20px 0px">
              <FileText size={20} color="var(--color-primary)" />
              <Text variant="body1" bold>Additional Notes (Optional)</Text>
            </Row>
            <TextArea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional information that might help with your approval..."
              rows={4}
            />
          </Card>

          {error && (
            <Text variant="body2" color="error" textAlign="center">
              {error}
            </Text>
          )}

          <Row gap="20px" margin="20px 0px 0px 0px">
            <Button
              variant="secondary"
              onClick={() => navigate('/join')}
              disabled={submitting}
              fullWidth
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              fullWidth
            >
              {submitting ? 'Submitting...' : 'Submit Join Request'}
            </Button>
          </Row>
        </Column>
      </Card>


    </FlexContainer>
  );
};

export default JoinRequestPage;
