import React, { useState } from 'react';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import DateInput from '../components/DateInput';
import Divider from '../components/Divider';
import FileUpload from '../components/FileUpload';
import Slider from '../components/Slider';
import { TextInput, SearchInput, TextArea } from '../components/Input';
import SelectDropdown from '../components/SelectDropdown';
import Spacer from '../components/Spacer';
import StepperInput from '../components/StepperInput';
import Text from '../components/Text';
import ToggleSwitch from '../components/ToggleSwitch';
import Row from '../layout/containers/Row';
import Column from '../layout/containers/Column';
import Grid from '../layout/containers/Grid';
import Card from '../layout/containers/Card';
import FlexContainer from '../layout/containers/FlexContainer';
import { CircleUser } from 'lucide-react';
import AudioPlayer from '../components/AudioPLayer';
import WaveformPlayer from '../components/WaveformPlayer';
import Pill from '../components/pill';
import ClampText from '../components/ClampText';
import ImageCard from '../layout/containers/ImageCard';
import PersonCardContainer from '../layout/containers/PersonCardContainer';
import RecordingIcon from '../components/RecordingIcon';
import PersonCardSVG from '../layout/containers/PersonCardSVG';
import PersonCard from '../components/PersonCard';



const ComponentDemo = ({setSidebarOpen}) => {
  const [checked, setChecked] = useState(false);
  const [date, setDate] = useState('');
  const [step, setStep] = useState(1);
  const [dropdown, setDropdown] = useState('');
  const [toggle, setToggle] = useState(false);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [textarea, setTextarea] = useState('');
  const [sliderValue, setSliderValue] = useState(50);
  const [activeAudioIndex, setActiveAudioIndex] = useState(null);
  const [audioDurations, setAudioDurations] = useState({});
  const [audioTimes, setAudioTimes] = useState({});


  const handleAudioActivate = (index) => {
    setActiveAudioIndex(prev => (prev === index ? null : index));
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Components Demo</h1>
      <Divider />

      <h2>Texts</h2>
      <Text variant="heading1" bold color="primary-text" align="center">
        Welcome to Taf'Yaa
      </Text>

      <Text variant="caption2" italic color="danger">
        * This is a warning
      </Text>

      <Text as="p" color="gray-dark">
        This is a paragraph rendered as a paragraph element.
      </Text>

      <Divider />

      <h2>Clamp Text</h2>
      <Card padding="16px" backgroundColor="#f5f5f5" borderRadius="8px">
        <ClampText lines={2}>
          This is a sample text that will be truncated after two lines. Click "Show more" to expand the text and see the full content. This is useful for displaying long text in a limited space while still allowing users to access the full content if needed. The component automatically handles the truncation and provides a toggle button for expanding/collapsing the text.
        </ClampText>
      </Card>
      <Divider />

      <RecordingIcon isRecording={true}></RecordingIcon>

      <h2>Button</h2>
      <Button onClick={() => alert('Clicked!')}>Primary Button</Button>
      <Spacer />
      <Button variant="secondary">Secondary</Button>
      <Spacer />
      <Button loading>Loading</Button>
      <Spacer />
      <Button disabled>Disabled</Button>
      <Spacer />
      <Button size='sm'>Small button</Button>
      <Spacer />
      <Button size='md'>Medium button</Button>
      <Spacer />
      <Button size='lg'>Large button</Button>
      <Spacer />
      <Button variant='link'>Learn more</Button>
      <Spacer />
      <Button fullWidth>Full Width</Button>
      <Divider />

      <h2>Checkbox</h2>
      <Checkbox label="Accept Terms" checked={checked} onChange={() => setChecked(!checked)} />
      <Divider />

      <h2>DateInput</h2>
      <DateInput label="Pick a date" value={date} onChange={e => setDate(e.target.value)} />
      <Divider />

      <h2>Divider</h2>
      <Divider />
      <Divider color="red" thickness="2px" borderRadius='2px' />
      <Divider vertical style={{ height: 40 }} />
      <Divider />

      <h2>FileUpload</h2>
      <FileUpload onChange={() => {}} />
      <Divider />

      <h2>Input</h2>
      <TextInput label="Name" value={text} onChange={e => setText(e.target.value)} placeholder="Enter name" />
      <Spacer />
      <SearchInput
        placeholder="Search for a Tree..."
        value={search}
        onChange={setSearch}
        onSearch={val => alert('Searching for:'+' '+ val)}
      />
      <Spacer />
      <TextArea label="Description" value={textarea} onChange={e => setTextarea(e.target.value)} />
      <Divider />

      <h2>Slider</h2>
      <Slider
        label="Volume"
        min={0}
        max={100}
        step={2}
        value={sliderValue}
        onChange={setSliderValue}
      />
      <Divider />

      <h2>SelectDropdown</h2>
      <SelectDropdown
        label="Choose"
        options={[{ label: 'One', value: 1 }, { label: 'Two', value: 2 }]}
        value={dropdown}
        onChange={e => setDropdown(e.target.value)}
      />
      <Divider />

      <h2>Spacer</h2>
      <Spacer size="md" />
      <Spacer size="28px" />
      <Spacer size="lg" vertical={false} />
      <Divider />

      <h2>StepperInput</h2>
      <StepperInput value={step} onChange={setStep} />
      <Divider />

      <h2>ToggleSwitch</h2>
        <ToggleSwitch
          checked={toggle}
          onChange={newValue => {
            setToggle(newValue);
            // setTimeout(() => {
            //   alert(newValue ? "this is On" : "this is Off");
            // }, 0);
          }}
        /> 
      <Divider />

      <h2>Pill</h2>
      <Row gap="10px" alignItems="center">
        <Pill backgroundColor="#e0e0e0" color="#333">Default Pill</Pill>
        <Pill backgroundColor="#007bff" color="white">Primary Pill</Pill>
        <Pill backgroundColor="#28a745" color="white" icon={<CircleUser size={20} />}>
        </Pill>
      </Row>
      <Divider />

      <h2>Row</h2>
      <Row gap="1rem" padding="1rem" justifyContent='space-between'  >
        <Card backgroundColor='#7c0786' height='50px' width='150px'>Card 2</Card>
        <Card backgroundColor='#7c0786' height='50px' width='150px'>Card 2</Card>
      </Row>
      <Divider />

      <h2>Column</h2>
      <FlexContainer direction="column" height='400px'>
        <Column gap="1rem" padding="1rem" justifyContent='space-between' height='100%'>
          <Card backgroundColor='#1F724A' height='50px'> Card 1 </Card>
          <Card backgroundColor='#1F724A' height='50px'> Card 2 </Card>
        </Column>
      </FlexContainer>
      <Divider />

      <h2>Flexible Container</h2>
       <FlexContainer direction="column" responsiveDirection="row" gap="1rem">
        <Card backgroundColor='#1F724A' height='50px'> Card 1 </Card>
        <Card backgroundColor='#1F724A' height='50px'> Card 2 </Card>
       </FlexContainer>
      <Divider />

      <h2>Grid</h2>
      <Grid columns={2} gap="10px">
        <Card backgroundColor='#1F724A' height='50px' borderRadius='5px'> Card 1 </Card>
        <Card backgroundColor='#1F724A' height='50px'> Card 2 </Card>
        <Card backgroundColor='#1F724A' height='50px'> Card 3 </Card>
      </Grid>
      <Divider />

      <h2>Card</h2>
      <Card padding="24px" shadow borderRadius="12px" backgroundColor='black' positionType='Relative'>
        <h3>Card Title</h3>
        <p>Card content goes here.</p>
        <Card rounded positionType='Absolute' position='top-right' backgroundColor='white' onClick={() => {}} margin='5px 5px 0px 0px' ><CircleUser strokeWidth={2} size={50} color='#1F724A'/></Card>
        <Card width='100px'  positionType='Absolute' position='bottom-right' onClick={() => {}} margin='0px 10px 10px 0px' ><Text variant='caption1' color='danger'> others</Text></Card>
        <Card width='100px' positionType='Absolute' position='bottom-left' onClick={() => {}} margin='0px 0px 10px 10px' ><Text variant='caption1' color='link'> others</Text></Card>
      </Card>

      <h2>Image Card</h2>
      <Row gap="16px" justifyContent="start">
        <ImageCard 
          image="/Images/image1.png" 
          alt="Sample image 1" 
          width="150px" 
          height="150px"
          borderRadius="10px" 
        />
        <ImageCard 
          image="/Images/image3.png" 
          alt="Sample image 3" 
          width="150px" 
          height="150px" 
          borderRadius="10px"
        />
        <ImageCard 
          alt="Fallback icon" 
          width="150px" 
          height="150px" 
          rounded
        />
      </Row>
      <Divider />

      <h2>Audio Player</h2>
      <Card padding="16px" backgroundColor="#f0f0f0" borderRadius="8px">
        <Text variant="body1" bold>Sample Audio Player</Text>
        <Spacer size="sm" />
        <AudioPlayer
          audioURL="/Audio/Gorillaz_-_Feel_Good_Inc.__Official_Video_(140).m4a"
          isActive={activeAudioIndex === 0}
          onActivate={() => handleAudioActivate(0)}
        />
      </Card>
      <Divider />

      <h2>Waveform Player</h2>
      <Card padding="16px" backgroundColor="#f0f0f0" borderRadius="8px">
        <Text variant="body1" bold>Sample Waveform Player</Text>
        <Spacer size="sm" />
        <div style={{ width: '100%' }}>
          <WaveformPlayer
            audioUrl="/Audio/Gorillaz_-_Feel_Good_Inc.__Official_Video_(140).m4a"
            isPlaying={activeAudioIndex === 1}
            onTogglePlay={(playing) => {
              if (playing) setActiveAudioIndex(1);
              else setActiveAudioIndex(null);
            }}
            onReady={(duration) => {
              setAudioDurations(prev => ({ ...prev, 1: duration }));
            }}
            onTimeUpdate={(time) => {
              setAudioTimes(prev => ({ ...prev, 1: time }));
            }}
          />
        </div>
        <Spacer size="sm" />
        <Text variant="caption1">
          {formatTime(audioTimes[1] || 0)} / {formatTime(audioDurations[1] || 0)}
        </Text>
      </Card>
      <Divider />

      <h2>Person Card</h2>
      <Row alignItems='center' padding="0px" gap="1rem" margin='0px'>
          <PersonCard
            variant="root"
            name="Vishanti"
            sex="F"
            birthDate="01/01/1880"
            profileImage="/Images/image5.jpg" 
            onClick={() => setSidebarOpen(true)}
            onAdd={() => {}}
          />

           <PersonCard
            variant="dead"
            name="Vishanti Vlad Tepes"
            sex="F"
            role='admin'
            birthDate="01/01/1880" 
            deathDate="01/01/1950"
            profileImage="/Images/image6.jpg" 
            onClick={() => setSidebarOpen(false)}
            onAdd={() => {}}
          />

           <PersonCard
            variant="directline"
            name="Vishanti Vlad Tepes"
            sex="F"
            role='moderator'
            birthDate="01/01/1880"
            profileImage="/Images/image7.jpg" 
            onClick={() => setSidebarOpen(true)}
            onAdd={() => {}}
          />

           <PersonCard
            variant="spouce"
            role='editor'
            name="Vishanti Vlad Tepes"
            sex="F"
            birthDate="01/01/1880"
            profileImage="/Images/image8.jpg"
            onClick={() => setSidebarOpen(false)} 
            onAdd={() => {}}
          />
      </Row>
        
      

    </div>
  );
};

export default ComponentDemo;
