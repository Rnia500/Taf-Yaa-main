import { React, useState } from 'react';
import Card from '../../../layout/containers/Card';
import Text from '../../Text';
import Spacer from '../../Spacer';
import ImageCard from '../../../layout/containers/ImageCard';
import Row from '../../../layout/containers/Row';
import Column from '../../../layout/containers/Column';
import Button from '../../Button';
import WaveformPlayer from '../../WaveformPlayer';
import AudioPlayer from '../../AudioPLayer';

function AudioStory({ stories = [], onRecord, onTranscribe }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [durations, setDurations] = useState({});
  const [times, setTimes] = useState({});



  const handleActivate = (index) => {
    setActiveIndex(prev => (prev === index ? null : index));
  };


  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  

  return (
    <Card alignItems='start' padding='0rem' backgroundColor="var(--color-background)">
      <Text variant='heading3'>Audio Story</Text>
      <Spacer size='md' />

      <Card alignItems='flex-start' scrolling="horizontal" padding="0px 0px 0px 10px" margin='0px' backgroundColor="var(--color-transparent)" width='100%'>
        <Row margin='0px 0px 10px 0px' gap="0.5rem" padding="0" width="max-content" justifyContent="start" alignItems="start">
          {stories.map((story, index) => (
            <Card
              key={index}
              positionType='relative'
              backgroundColor="var(--color-light-blue)"
              borderRadius='10px'
              height='90px'
              padding='8px 8px 0px 8px'
              width='270px'
              margin='0px'
            >
              {/* Top Row */}
              <Row padding='0px' width='100%' gap='0.5rem' justifyContent='space-between' fitContent alignItems='center'>
                <Row padding='0px' gap='0.5rem' alignItems='center' fitContent>
                  <ImageCard borderRadius='10px' image={story.thumbnail} size="55px" />
                  <Column alignItems='start' gap='0px' padding='0px' >
                    <Text ellipsis variant='body1' bold>{story.title}</Text>
                    <Text as='p' ellipsis variant='caption1'>{story.subTitle || 'Oral History Recording'}</Text>
                  </Column>
                </Row>
                <AudioPlayer
                  audioURL={story.audioURL}
                  isActive={activeIndex === index}
                  onActivate={() => handleActivate(index)}
                />
              </Row>

              {/* Bottom Row: Waveform + Duration */}
              <Row fitContent gap='0.5rem' justifyContent='space-between' alignItems='center' width='100%' padding='0px'>
                <Card
                  padding='0px'
                  margin='0px'
                  width='180px'
                  height='8px'
                  backgroundColor="var(--color-transparent)"
                >
                  <WaveformPlayer
                    audioUrl={story.audioURL}
                    isPlaying={activeIndex === index}
                    onTogglePlay={(playing) => {
                      if (playing) setActiveIndex(index);
                      else setActiveIndex(null);
                    }}
                    onReady={(duration) => {
                      setDurations(prev => ({ ...prev, [index]: duration }));
                    }}
                    onTimeUpdate={(time) => {
                      setTimes(prev => ({ ...prev, [index]: time }));
                    }}
                  />
                </Card>

                <Card
                  padding='0px'
                  margin='0px'
                  fitContent
                  backgroundColor="var(--color-transparent)"
                >
                  <Text variant='caption1'>
                    {formatTime(times[index] || 0)} / {formatTime(durations[index] || 0)}
                  </Text>
                </Card>
              </Row>
            </Card>
          ))}
        </Row>
      </Card>

      <Spacer size='sm' />
      <Row gap='1rem' padding='0.5rem'>
        <Button variant='primary' fullWidth onClick={onRecord}>
          Record
        </Button>
        {/* <Button variant='primary' fullWidth onClick={onTranscribe}>
          Transcribe
        </Button> */}
      </Row>
    </Card>
  );
}

export default AudioStory