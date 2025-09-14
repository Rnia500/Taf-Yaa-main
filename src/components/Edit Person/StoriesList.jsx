import React, { useState } from 'react';
import { TextInput } from '../Input';
import AudioUploadCard from '../AudioUploadCard';
import Button from '../Button';
import Card from '../../layout/containers/Card';
import Text from '../Text';
import Row from '../../layout/containers/Row';
import Column from '../../layout/containers/Column';
import { Plus, Trash2 } from 'lucide-react';

const StoriesList = ({ stories, onChange }) => {
  const [newStory, setNewStory] = useState({ title: '', audioFile: null, audioURL: null });

  const addStory = () => {
    if (newStory.title.trim()) {
      onChange([...stories, { ...newStory, id: Date.now() }]);
      setNewStory({ title: '', audioFile: null, audioURL: null });
    }
  };

  const removeStory = (index) => {
    const updated = stories.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateStory = (index, field, value) => {
    const updated = stories.map((story, i) =>
      i === index ? { ...story, [field]: value } : story
    );
    onChange(updated);
  };

  return (
    <div className="stories-list">
      {stories.map((story, index) => (
        <Card key={story.id || index} margin="0.5rem 0" padding="0.5rem">
          <Row justifyContent="space-between" alignItems="center">
            <Column gap="0.5rem" padding="0px" margin="0px">
              <TextInput
                value={story.title}
                onChange={(e) => updateStory(index, 'title', e.target.value)}
                placeholder="Story title"
              />
              <AudioUploadCard
                onAudioUpload={(file, audioURL) => {
                  updateStory(index, 'audioFile', file);
                  updateStory(index, 'audioURL', audioURL);
                }}
                storyTitle={story.title}
              />
            </Column>
            <Button variant="danger" onClick={() => removeStory(index)}>
              <Trash2 size={16} />
            </Button>
          </Row>
        </Card>
      ))}

      <Card margin="1rem 0" padding="0.5rem">
        <Text variant="heading3">Add New Story</Text>
        <Row gap="0.5rem" padding="0px" margin="0px" alignItems="center">
          <TextInput
            value={newStory.title}
            onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
            placeholder="New story title"
          />
          <Button onClick={addStory}>
            <Plus size={16} />
          </Button>
        </Row>
      </Card>
    </div>
  );
};

export default StoriesList;
