import React, { useState } from 'react';
import FileUpload from './FileUpload';
import Card from '../layout/containers/Card';
import Text from './Text';
import Row from '../layout/containers/Row';
import Column from '../layout/containers/Column';
import WaveformPlayer from './WaveformPlayer';
import AudioPlayer from './AudioPLayer';
import { Upload, Music, CheckCircle, X } from 'lucide-react';
import '../styles/AudioUploadCard.css';

function AudioUploadCard({ onAudioUpload, storyTitle }) {
  const [audioFile, setAudioFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPreview, setAudioPreview] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setUploadStatus('uploading');
      
      // Simulate upload process
      setTimeout(() => {
        setUploadStatus('success');
        const audioUrl = URL.createObjectURL(file);
        setAudioPreview(audioUrl);
        
        if (onAudioUpload) {
          onAudioUpload(file, audioUrl);
        }
      }, 1500);
    } else {
      setUploadStatus('error');
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setUploadStatus('idle');
    setAudioPreview(null);
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="audio-upload-card" padding="0.5rem" borderRadius="16px">
      <Column fitContent gap="16px" padding='0.5rem' alignItems="stretch">
        {/* Story Title Display */}
        {storyTitle && (
          <Card className="audio-upload-card__story-title" padding="0.5rem" backgroundColor="var(--color-light-blue)">
            <Text variant="body2" color="var(--color-primary-dark)">
              Story: <strong>{storyTitle}</strong>
            </Text>
          </Card>
        )}

        {/* Upload Area */}
        {!audioFile ? (
          <FileUpload
            onChange={handleFileUpload}
            accept="audio/*"
            label="Upload Audio Story"
            variant="audio"
          />
        ) : (
          <Card className="audio-upload-card__preview" padding="16px" backgroundColor="var(--color-gray-light)">
            <Row padding='0px' fitContent justifyContent="space-between" alignItems="center">
              <Column fitContent gap="4px">
                <Text truncateLines={2} variant="body2" bold>{audioFile.name}</Text>
                <Text variant="caption2" color="var(--color-gray)">
                  {formatFileSize(audioFile.size)}
                </Text>
              </Column>
              
              <Row padding='0px' gap="8px">
                {audioPreview && (
                  <AudioPlayer
                    audioURL={audioPreview}
                    isActive={isPlaying}
                    onActivate={handlePlayPause}
                  />
                )}
                <Card
                  onClick={handleRemoveAudio}
                  rounded
                  size="35px"
                  backgroundColor="var(--color-danger-light)"
                  alignItems="center"
                  justifyContent="center"
                  style={{ cursor: 'pointer' }}
                  title="Remove audio"
                >
                  <X size={16} color="var(--color-danger)" />
                </Card>
              </Row>
            </Row>

            {/* Waveform Player */}
            {audioPreview && uploadStatus === 'success' && (
              <div style={{ marginTop: '12px', width: '100%' }}>
                <WaveformPlayer
                  audioUrl={audioPreview}
                  isPlaying={isPlaying}
                  onTogglePlay={setIsPlaying}
                  onReady={setDuration}
                  onTimeUpdate={setCurrentTime}
                />
                
                {/* Timer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: '0.5rem',
                  }}
                >
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Upload Status */}
            {uploadStatus === 'uploading' && (
              <div className="audio-upload-card__status audio-upload-card__status--uploading">
                <div className="audio-upload-card__progress">
                  <div className="audio-upload-card__progress-bar"></div>
                </div>
                <Text variant="caption2">Uploading...</Text>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="audio-upload-card__status audio-upload-card__status--success">
                <CheckCircle size={16} />
                <Text variant="caption2">Upload successful!</Text>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="audio-upload-card__status audio-upload-card__status--error">
                <X size={16} />
                <Text variant="caption2">Please select a valid audio file</Text>
              </div>
            )}
          </Card>
        )}

        {/* Instructions */}
        <div className="audio-upload-card__instructions">
          <Text variant="caption2" color="var(--color-gray)">
            Supported formats: MP3, WAV, M4A, OGG
          </Text>
          <Text variant="caption2" color="var(--color-gray)">
            Max file size: 50MB
          </Text>
        </div>
      </Column>
    </Card>
  );
}

export default AudioUploadCard;
