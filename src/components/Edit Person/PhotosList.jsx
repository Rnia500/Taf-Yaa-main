import React, { useState } from 'react';
import FileUpload from '../FileUpload';
import Button from '../Button';
import Card from '../../layout/containers/Card';
import Text from '../Text';
import Row from '../../layout/containers/Row';
import Column from '../../layout/containers/Column';
import { Plus, Trash2 } from 'lucide-react';

const PhotosList = ({ photos, onChange }) => {
  const [newPhoto, setNewPhoto] = useState(null);

  const addPhoto = () => {
    if (newPhoto) {
      onChange([...photos, { file: newPhoto, id: Date.now() }]);
      setNewPhoto(null);
    }
  };

  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="photos-list">
      <Row gap="0.5rem" padding="0px" margin="0px" wrap="wrap">
        {photos.map((photo, index) => (
          <Card key={photo.id || index} margin="0.5rem" padding="0.5rem" style={{ position: 'relative' }}>
            <img
              src={photo.file ? URL.createObjectURL(photo.file) : photo.url}
              alt={`Photo ${index + 1}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <Button
              variant="danger"
              style={{ position: 'absolute', top: '5px', right: '5px' }}
              onClick={() => removePhoto(index)}
            >
              <Trash2 size={12} />
            </Button>
          </Card>
        ))}
      </Row>

      <Card margin="1rem 0" padding="0.5rem">
        <Text variant="heading3">Add New Photo</Text>
        <Row gap="0.5rem" padding="0px" margin="0px" alignItems="center">
          <FileUpload
            onChange={(file) => setNewPhoto(file)}
            accept="image/*"
          />
          <Button onClick={addPhoto} disabled={!newPhoto}>
            <Plus size={16} />
          </Button>
        </Row>
      </Card>
    </div>
  );
};

export default PhotosList;
