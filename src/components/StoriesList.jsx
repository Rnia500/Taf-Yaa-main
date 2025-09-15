import React, { useState } from 'react';
import Card from '../layout/containers/Card';
import Text from './Text';
import Button from './Button';
import Row from '../layout/containers/Row';
import AudioStory from './sidebar/ProfileSidebarComponents/audioStory';

const StoriesList = ({ stories = [], handleDelete, onChange, onUploadAudio }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleDeleteSelected = () => {
    if (selectedIndex === null || selectedIndex < 0) return;
    const updated = (stories || []).filter((_, i) => i !== selectedIndex);
    setSelectedIndex(null);
    onChange && onChange(updated);
    if (handleDelete) handleDelete();
  };

  return (
    <>

      <Card padding='0px' margin='0px' backgroundColor='var(--color-transparent)'>
        <AudioStory
          isSideBar={false} 
          stories={stories} 
          showRecordButton={false} 
          selectedIndex={selectedIndex} 
          onSelect={(idx) => setSelectedIndex(idx)}
          onRecord={() => { }} 
        />
      </Card>

      <Row gap="0.5rem" width='100%' padding="0.5rem 20% 0 20%">
        <Button fullWidth variant='primary' onClick={onUploadAudio}>Upload Audio</Button>
        <Button fullWidth variant="danger" onClick={handleDeleteSelected} disabled={selectedIndex === null}>Delete Selected</Button>
      </Row>
    </>
  );
};

export default StoriesList; 