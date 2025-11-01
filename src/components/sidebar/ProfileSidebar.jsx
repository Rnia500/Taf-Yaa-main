
import React, { useEffect, useState, useRef } from 'react';
import FlexContainer from '../../layout/containers/FlexContainer';
import ProfileHeader from './ProfileSidebarComponents/ProfileHeader';
import IdentityOverview from './ProfileSidebarComponents/IdentityOverview';
import ContactMetaInfo from './ProfileSidebarComponents/ContactMetaInfo';
import BiographySection from './ProfileSidebarComponents/BiographySection';
import RolePermissions from './ProfileSidebarComponents/RolePermissions';
import FamilyConnections from './ProfileSidebarComponents/FamilyConnections';
import TimelineEvents from './ProfileSidebarComponents/TimelineEvents';
import Stories from './ProfileSidebarComponents/Story';
import PhotoMemorySection from './ProfileSidebarComponents/PhotoMemorySection';
import RecordModal from './RecordModal/RecordModal'
import AddEditEvent from '../AddEditEvent';
import useSidebarStore from '../../store/useSidebarStore';
import useModalStore from '../../store/useModalStore';
import dataService from '../../services/dataService';
import Row from '../../layout/containers/Row';
import Button from '../Button';
import Spacer from '../Spacer';
import { getPrivacyLabel, getCountryLabel } from '../../models/treeModels/PersonModel';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


import PhotoUploadModal from './PhotoUploadModal';

// Download modals
import DownloadProfileModal from './ProfileSidebarComponents/DownloadProfileModal';
import PDFDownloadModal from './ProfileSidebarComponents/PDFDownloadModal';
import PNGDownloadModal from './ProfileSidebarComponents/PNGDownloadModal';

export default function ProfileSidebar() {
  const [profileData, setProfileData] = useState({});
  const [identityData, setIdentityData] = useState({});
  const [contactData, setContactData] = useState({});
  const [biographyText, setBiographyText] = useState('');
  const [roles, setRoles] = useState([]);
  const [familyConnections, setFamilyConnections] = useState({});
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [audioStories, setAudioStories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [peopleNameMap, setPeopleNameMap] = useState({});
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAddEditEventModalOpen, setIsAddEditEventModalOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);

  const [currentEditingEvent, setCurrentEditingEvent] = useState(null);
  const [isAddingDescriptionMode, setIsAddingDescriptionMode] = useState(false);
  const { activeProfileId, closeSidebar } = useSidebarStore();
  const { openModal } = useModalStore();
  const { treeId } = useParams();
  const { currentUser } = useAuth();

  // Download modal states
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isPNGModalOpen, setIsPNGModalOpen] = useState(false);
  const [selectedProfileName, setSelectedProfileName] = useState("");
  
  // Ref for capturing the profile sidebar
  const profileSidebarRef = useRef(null);


  const handleRecordAudio = () => {
    setIsRecordModalOpen(true);
  };

  const handleAddEvent = () => {
    setIsAddEditEventModalOpen(true);
  };

  const handleAddDescription = () => {
    setIsAddEditEventModalOpen(true);
  };

  const handleCloseAddEditEventModal = () => {
    setIsAddEditEventModalOpen(false);
  };

  const handleEditPerson = () => {
    openModal('editPerson', { personId: activeProfileId });
  };

  // Download handlers
  const handleDownload = () => {
    setSelectedProfileName(profileData.profileName || "profile");
    setIsDownloadModalOpen(true);
  };

  const handleDownloadSelect = (format) => {
    setIsDownloadModalOpen(false);
    if (format === "pdf") {
      setIsPDFModalOpen(true);
    } else if (format === "png") {
      setIsPNGModalOpen(true);
    }
  };



  const handleEventsChange = (newEventsArray) => {
    setTimelineEvents(newEventsArray);
  };

  const handleEditEvent = (event) => {
    setCurrentEditingEvent(event);
    setIsAddingDescriptionMode(false);
    setIsAddEditEventModalOpen(true);
  };


  // populate sidebar from the dummy data (people, marriages, stories, events)
  useEffect(() => {
    let mounted = true;

    if (!activeProfileId) {
      setProfileData(null);
      setIdentityData({});
      setContactData({});
      setBiographyText('');
      setRoles([]);
      setFamilyConnections({});
      setTimelineEvents([]);
      setAudioStories([]);
      setPhotos([]);
      return;
    }

    async function loadFromDB() {
      console.debug('ProfileSidebar: loadFromDB start', activeProfileId);
      let person = null;
      try {
        person = await dataService.getPerson(activeProfileId);
      } catch (err) {
        console.error('ProfileSidebar: loadFromDB error', err);
        if (!mounted) return;
        setProfileData(null);
        return;
      }
      if (!mounted) return;
      if (!person) {
        console.debug('ProfileSidebar: person not found in DB for id', activeProfileId);
        setProfileData(null);
        return;
      }
      console.debug('ProfileSidebar: person loaded', person);

      // Basic profile header
      setProfileData({
        profileName: person.name,
        birthDate: person.dob,
        deathDate: person.dod,
        profileImage: person.photoUrl,
      });

      // Fetch user role for this tree (of the person being viewed, if linked)
      let userRole = person.linkedUserId ? 'Member' : 'Not Linked'; // default to Member if linked
      if (person.linkedUserId) {
        try {
          const treeData = await dataService.getTree(treeId);
          const member = treeData?.members?.find(m => m.userId === person.linkedUserId);
          if (member?.role) {
            userRole = member.role;
          }
        } catch (error) {
          console.error('Error fetching tree role:', error);
          // Keep default 'Member' on error
        }
      }

     
      setIdentityData({
        gender: person.gender ? String(person.gender).charAt(0).toUpperCase() + String(person.gender).slice(1) : 'UnKnown',
        tribe: person.tribe || 'Unknown',
        language: person.language || 'Unknown',
        status: person.isDeceased ? 'Deceased' : 'Living',
        countryOfResidence: getCountryLabel(person.countryOfResidence) || 'Unknown',
        nationality: getCountryLabel(person.nationality) || 'Unknown',
        placeOfBirth : person.placeOfBirth || 'Unknown',
        placeOfDeath : person.dod ?  person.placeOfDeath || 'Unknown' : null,
        role: userRole,
        linkedAccount: person.linkedUserId || 'Not linked'

      });

      // Contact mapping
      setContactData({
        phoneNumber: person.phoneNumber || 'Unknown',
        email: person.email || 'Unknown',
        privacyStatus: getPrivacyLabel(person.privacyLevel) || 'Unknown',
      });

      // Biography
      setBiographyText(person.bio || '');

      // Roles
      const inferredRoles = [];
      if (person.linkedUserId) inferredRoles.push('Linked Account');
      if (person.isSpouse) inferredRoles.push('Spouse');
      setRoles(inferredRoles);

     
      const connections = { spouses: [], children: [], parents: [], siblings: [] };

      const [allPeople, allMarriages] = await Promise.all([
        dataService.getAllPeople(),
        dataService.getAllMarriages(),
      ]);
      if (!mounted) return;
      const peopleMap = new Map((allPeople || []).map(p => [p.id, p]));
      const peopleNameMapLocal = Object.fromEntries(allPeople.map(p => [p.id, p.name]));
      setPeopleNameMap(peopleNameMapLocal);
      
      (allMarriages || []).forEach(m => {
        // MONOGAMOUS: spouses in m.spouses, children in m.childrenIds
        if (m.marriageType === 'monogamous') {
          // if person is a spouse in this marriage
          if (Array.isArray(m.spouses) && m.spouses.includes(person.id)) {
            (m.spouses || []).forEach(sid => {
              if (sid !== person.id) {
                const spousePerson = peopleMap.get(sid);
                if (spousePerson) connections.spouses.push({ name: spousePerson.name, image: spousePerson.photoUrl });
              }
            });
            (m.childrenIds || []).forEach(cid => {
              const child = peopleMap.get(cid);
              if (child) connections.children.push({ name: child.name, image: child.photoUrl });
            });
          }

          // if person is a child in this marriage -> parents and siblings
          if (Array.isArray(m.childrenIds) && m.childrenIds.includes(person.id)) {
            // parents are the spouses
            (m.spouses || []).forEach(pid => {
              const pperson = peopleMap.get(pid);
              if (pperson) connections.parents.push({ name: pperson.name, image: pperson.photoUrl });
            });
            // siblings are other children in the same marriage
            (m.childrenIds || []).forEach(cid => {
              if (cid !== person.id) {
                const sib = peopleMap.get(cid);
                if (sib) connections.siblings.push({ name: sib.name, image: sib.photoUrl });
              }
            });
          }
        }

        // POLYGAMOUS: husbandId + wives[] where each wife has childrenIds
        if (m.marriageType === 'polygamous') {
          // husband or one of the wives is the person -> get spouses & children
          if (m.husbandId === person.id) {
            (m.wives || []).forEach(w => {
              const spousePerson = peopleMap.get(w.wifeId);
              if (spousePerson) connections.spouses.push({ name: spousePerson.name, image: spousePerson.photoUrl });
              (w.childrenIds || []).forEach(cid => {
                const child = peopleMap.get(cid);
                if (child) connections.children.push({ name: child.name, image: child.photoUrl });
              });
            });
          } else if ((m.wives || []).some(w => w.wifeId === person.id)) {
            // person is one of the wives
            const husband = peopleMap.get(m.husbandId);
            if (husband) connections.spouses.push({ name: husband.name, image: husband.photoUrl });
            // this wife's children
            const myWife = (m.wives || []).find(w => w.wifeId === person.id) || { childrenIds: [] };
            (myWife.childrenIds || []).forEach(cid => {
              const child = peopleMap.get(cid);
              if (child) connections.children.push({ name: child.name, image: child.photoUrl });
            });
          }

          // if person is a child in any wife's children list -> parents and siblings
          (m.wives || []).forEach(w => {
            if ((w.childrenIds || []).includes(person.id)) {
              const father = peopleMap.get(m.husbandId);
              if (father) connections.parents.push({ name: father.name, image: father.photoUrl });
              // mother is the wife that contains the child
              const mother = peopleMap.get(w.wifeId);
              if (mother) connections.parents.push({ name: mother.name, image: mother.photoUrl });
              // siblings: all children from all wives in this marriage except the person
              (m.wives || []).forEach(w2 => {
                (w2.childrenIds || []).forEach(sibId => {
                  if (sibId !== person.id) {
                    const sib = peopleMap.get(sibId);
                    if (sib) connections.siblings.push({ name: sib.name, image: sib.photoUrl });
                  }
                });
              });
            }
          });
        }
      });

      // de-duplicate
      const uniqueByName = arr => Array.from(new Map((arr || []).map(a => [a.name, a])).values());
      connections.spouses = uniqueByName(connections.spouses);
      connections.children = uniqueByName(connections.children);
      connections.parents = uniqueByName(connections.parents);
      connections.siblings = uniqueByName(connections.siblings);

      setFamilyConnections(connections);

      // Timeline events: read directly from events collection
      // (birth/death/marriage should be stored as Event documents elsewhere)
      const events = await dataService.getEventsByPersonId(person.id);
      if (!mounted) return;
      // sort events by date (earliest first) - events without date go last
      const sorted = (events || []).slice().sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      setTimelineEvents(sorted);

      // Audio stories from DB
      const personStories = await dataService.getStoriesByPersonId(person.id);
      if (!mounted) return;
      setAudioStories(personStories || []);

      // Photos - include person's photo and persisted photos
      const personPhotos = [];
      if (person.photoUrl) personPhotos.push({ url: person.photoUrl, alt: person.name });
      if (Array.isArray(person.photos)) {
        person.photos.forEach(p => {
          if (p?.url) personPhotos.push({ url: p.url, alt: p.alt || person.name });
        });
      }
      setPhotos(personPhotos);
    }

    // initial load
    loadFromDB();

    // re-load when underlying local DB changes
    const onFamilyDataChanged = () => {
      loadFromDB();
    };
    window.addEventListener('familyDataChanged', onFamilyDataChanged);

    return () => {
      mounted = false;
      window.removeEventListener('familyDataChanged', onFamilyDataChanged);
    };
  }, [activeProfileId]);

  if (!profileData) {
    return null;
  }


  return (
    <FlexContainer gap='12px' backgroundColor="var(--color-background)" ref={profileSidebarRef} className="profile-sidebar">
      <ProfileHeader
        profileName={profileData.profileName}
        birthDate={profileData.birthDate}
        deathDate={profileData.deathDate}
        profileImage={profileData.profileImage}
        onClose={closeSidebar}
        onDownload={handleDownload}
      />

      
      <IdentityOverview identity={identityData} />
      <Spacer size='md' />

      <ContactMetaInfo contact={contactData} />
      <Spacer size='md' />

      <BiographySection biographyText={biographyText} onEdit={() => {}} />
      <Spacer size='md' />

      <RolePermissions roles={roles} />
      <Spacer size='md' />

      <FamilyConnections connections={familyConnections} />
      <Spacer size='md' />

      <TimelineEvents 
        events={timelineEvents} 
        onAddEvent={handleAddEvent} 
        onAddDescription={handleAddDescription}
        peopleNameMap={peopleNameMap}
        onEditEvent={handleEditEvent}
      />
      <Spacer size='md' />

      <Stories
        stories={audioStories}
        onRecord={handleRecordAudio}
        onTranscribe={() => alert('Transcribe clicked')}
        personId={activeProfileId}
        treeId={treeId}
        addedBy={currentUser?.uid || "user1"}
      />
      <Spacer size='md' />

      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        personId={activeProfileId}
        treeId={treeId} // pass actual tree id
      />

      <PhotoMemorySection photos={photos} onUpload={() => setIsPhotoUploadOpen(true)} />
      <Spacer size='md' />

      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        personId={activeProfileId}
      />


      <Spacer size='lg'/>
      <Row padding='0px' margin='0px'>
        <Button fullWidth variant='secondary' onClick={handleEditPerson}>Edit </Button>
        <Button fullWidth variant='danger'>Delete </Button>
      </Row>


      {/* Download Modals */}
      <DownloadProfileModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onSelect={handleDownloadSelect}
      />

      <PDFDownloadModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        profileName={selectedProfileName}
        profileRef={profileSidebarRef}
      />

      <PNGDownloadModal
        isOpen={isPNGModalOpen}
        onClose={() => setIsPNGModalOpen(false)}
        profileName={selectedProfileName}
        profileRef={profileSidebarRef}
      />

      <AddEditEvent
        isOpen={isAddEditEventModalOpen}
        onClose={handleCloseAddEditEventModal}
        events={timelineEvents}
        onEventsChange={handleEventsChange}
        editingEvent={currentEditingEvent}
        isAddingDescription={isAddingDescriptionMode}
      />
    </FlexContainer>
  );
}
