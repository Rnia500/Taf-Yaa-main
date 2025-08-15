
import React, { useEffect, useState } from 'react';
import FlexContainer from '../../layout/containers/FlexContainer';
import ProfileHeader from './ProfileSidebarComponents/ProfileHeader';
import IdentityOverview from './ProfileSidebarComponents/IdentityOverview';
import ContactMetaInfo from './ProfileSidebarComponents/ContactMetaInfo';
import BiographySection from './ProfileSidebarComponents/BiographySection';
import RolePermissions from './ProfileSidebarComponents/RolePermissions';
import FamilyConnections from './ProfileSidebarComponents/FamilyConnections';
import TimelineEvents from './ProfileSidebarComponents/TimelineEvents';
import AudioStory from './ProfileSidebarComponents/audioStory';
import PhotoMemorySection from './ProfileSidebarComponents/PhotoMemorySection';
import RecordModal from './RecordModal/RecordModal'
import profileDataJson from '../../data/profileData.json';
import useSidebarStore from '../../store/useSidebarStore';
import { people } from '../../data/dummyData.js'; 

export default function ProfileSidebar({ onClose, onDownload }) {
  const [profileData, setProfileData] = useState({});
  const [identityData, setIdentityData] = useState({});
  const [contactData, setContactData] = useState({});
  const [biographyText, setBiographyText] = useState('');
  const [roles, setRoles] = useState([]);
  const [familyConnections, setFamilyConnections] = useState({});
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [audioStories, setAudioStories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const { activeProfileId, closeSidebar } = useSidebarStore();
  

  const handleRecordAudio = () => {
    setIsRecordModalOpen(true);
  };


  useEffect(() => {
    setProfileData(profileDataJson.profileData);
    setIdentityData(profileDataJson.identityData);
    setContactData(profileDataJson.contactData);
    setBiographyText(profileDataJson.biographyText);
    setRoles(profileDataJson.roles);
    setFamilyConnections(profileDataJson.familyConnections);
    setTimelineEvents(profileDataJson.timelineEvents);
    setAudioStories(profileDataJson.audioStory);
    setPhotos(profileDataJson.photos || []);
  }, []);

   useEffect(() => {
    if (activeProfileId) {
      // Find the person in our dummy data array.
      // In a real app, this is where you would make a Firebase call: `getDoc(doc(db, 'people', activeProfileId))`
      const person = people.find(p => p.id === activeProfileId);
      
      if (person) {
        
        setProfileData({
          profileName: person.name,
          birthDate: person.dob,
          deathDate: person.dod,
          profileImage: person.photoUrl,
        });
      } else {
        setProfileData(null); 
      }
    } else {
      setProfileData(null); 
    }
  }, [activeProfileId]);

  if (!profileData) {
    return null;
  }


  return (
    <FlexContainer gap='12px' backgroundColor="var(--color-background)">
      <ProfileHeader
        profileName={profileData.profileName}
        birthDate={profileData.birthDate}
        deathDate={profileData.deathDate}
        profileImage={profileData.profileImage}

        onClose={closeSidebar} 
      />
      <IdentityOverview identity={identityData} />

      <ContactMetaInfo contact={contactData} />

      <BiographySection biographyText={biographyText} onEdit={() => {}} />

      <RolePermissions roles={roles} />

      <FamilyConnections connections={familyConnections} onAddConnection={() => {}} />

      <TimelineEvents events={timelineEvents} onAddEvent={() => {}} />

      <AudioStory 
        stories={audioStories} 
        onRecord={handleRecordAudio} 
        onTranscribe={() => alert('Transcribe clicked')} 
      />

      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />

      <PhotoMemorySection photos={photos} onUpload={() => {}} />
    </FlexContainer>
  );
}
