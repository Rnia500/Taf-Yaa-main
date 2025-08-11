import React from 'react';
import Card from '../../../layout/containers/Card';
import Text from '../../Text';
import Spacer from '../../Spacer';
import Row from '../../../layout/containers/Row';
import ImageCard from '../../../layout/containers/ImageCard';
import Button from '../../Button';
import { Camera  } from 'lucide-react';


function PhotoMemorySection({ photos = [], onUpload }) {
  return (
    <Card alignItems="start" padding="0rem" backgroundColor="var(--color-background)">
      <Text variant="heading3">Photos & Memories</Text>
      
      <Spacer size="md" />

      <Card alignItems='flex-start' scrolling="horizontal" padding="0px" margin="0px" backgroundColor="var(--color-transparent)" width="350px">
        <Row gap="0.25rem" padding="0.5rem" width="max-content" justifyContent="start" alignItems="center" style={{ overflowY: 'hidden' }}>
          {photos.map((photo, index) => (
            <ImageCard
              key={index}
              borderRadius="6px"
              image={photo.url}
              size="80px"
              alt={photo.alt || `Photo ${index + 1}`}
            />
          ))}
        </Row>
      </Card>

      <Spacer size="sm" />
      
      <Button variant="primary" fullWidth onClick={onUpload}>
        <Camera size={20}/>Upload Photo
      </Button>
    </Card>
  );
}

export default PhotoMemorySection;
