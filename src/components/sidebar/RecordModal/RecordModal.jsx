// components/Audio/RecordModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../layout/containers/Modal';
import { TextInput, TextArea } from '../../Input';
import RecordingControls from './RecordingControl';
import RecordingTimer from './RecordingTimer';
import RecordingPreview from './RecordingPreview';
import AudioHook from './AudioHook';
import Text from '../../Text';
import Card from '../../../layout/containers/Card';

const RecordModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [resetKey, setResetKey] = useState(Date.now());

  const {
    status,
    audioURL,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  } = AudioHook();

  const handleStart = () => {
    if (status === 'paused') resumeRecording();
    else startRecording();
  };

  const handleClose = () => {
    resetRecording();
    setTitle('');
    setSubtitle('');
    setResetKey(Date.now());
    onClose();
  };

  const handleUpload = () => {
    console.log('Uploading:', { title, subtitle, audioURL });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="record-modal-container">
        <Card fitContent padding='5px' margin='20px 0px' backgroundColor="var(--color-transparent)" position='left'>
          <Text variant='heading2'>New Recordings</Text>
        </Card>

        <TextInput
          label="Title"
          value={title}
          backgroundColor="var(--color-gray)"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter recording title"
        />

        <TextArea
          label="Subtitle"
          value={subtitle}
          backgroundColor="var(--color-gray)"
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Enter recording subtitle"
        />

        <div className="recording-section">
          <RecordingTimer
            isPaused={status === 'paused' || status === 'idle'}
            isStopped={status === 'stopped'}
            resetKey={resetKey}
          />

          <RecordingControls
            onStart={handleStart}
            onPause={pauseRecording}
            onStop={stopRecording}
            onRestart={() => {
              resetRecording();
              setResetKey(Date.now());
              setTitle('');
              setSubtitle('');
            }}
            onUpload={handleUpload}
            status={status}
          />

          {audioURL && <RecordingPreview audioUrl={audioURL} />}
        </div>

        {error && (
          <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</div>
        )}
      </div>
    </Modal>
  );
};

export default RecordModal;
