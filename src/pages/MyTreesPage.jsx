import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlexContainer from '../layout/containers/FlexContainer';
import Text from '../components/Text';
import Card from '../layout/containers/Card';
import Column from '../layout/containers/Column';
import Row from '../layout/containers/Row';
import Button from '../components/Button';
import Grid from '../layout/containers/Grid';
import { useAuth } from '../context/AuthContext';
import dataService from '../services/dataService';
import ImageCard from '../layout/containers/ImageCard';
import { SearchInput } from '../components/Input';
import useModalStore from '../store/useModalStore';
import AddTreeModal from '../components/AddTree/AddTreeModal';
import Toast from '../components/toasts/Toast';
import useToastStore from '../store/useToastStore';

const MyTreesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { openModal } = useModalStore();
  const [trees, setTrees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const  addToast  = useToastStore(state => state.addToast);

  useEffect(() => {
    const fetchTrees = async () => {
      if (!currentUser) return;
      try {
        const userTrees = await dataService.getTreesByUserId(currentUser.uid);
        setTrees(userTrees);
      } catch (error) {
        console.error('Failed to fetch trees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, [currentUser]);

  const filteredTrees = trees.filter(tree =>
    tree.familyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTree = () => {
    openModal('treeModal', { createdBy: currentUser?.uid });
  };

  const handleJoinTree = () => {
    addToast(`join tree functionslity not yet implemented on tree but it is on the way no worries`, 'error') 
  }


  const handleTreeClick = (treeId) => {
    navigate(`/family-tree/${treeId}`);
  };

  if (loading) {
    return (
      <FlexContainer justify="center" align="center" padding="20px">
        <Text>Loading your trees...</Text>
      </FlexContainer>
    );
  }

  return (
    <FlexContainer direction="vertical" padding="20px" gap="20px">
      <Row justifyContent="space-between" fitContent align="center">
        <Text variant="heading1">My Trees</Text>
        <Row padding='0px' margin='0px' fitContent>
          <Button onClick={handleCreateTree}>Create Tree</Button>
          <Button onClick={handleJoinTree}>Join Tree</Button>
        </Row>

      </Row>

      <Row justify="space-between" align="center">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search for a tree"
          style={{
            flex: 1,
            maxWidth: '300px'
          }}
        />
      </Row>

      {filteredTrees.length === 0 ? (
        <FlexContainer justify="center" align="center" padding="40px">
          <Column gap="10px" align="center">
            <Text>No trees found. Create your first family tree!</Text>
          </Column>
        </FlexContainer>
      ) : (
        <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" gap="20px">
          {filteredTrees.map((tree) => (
            <Card
              key={tree.id}
              onClick={() => handleTreeClick(tree.id)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ position: 'relative', height: '200px' }}>
                <ImageCard
                  image={tree.familyPhoto}
                  alt={tree.familyName}
                  width="100%"
                  height="200px"
                  borderRadius="8px"
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '4px'
                  }}
                >
                  <Text variant="body2" style={{ margin: 0 }}>
                    {tree.members?.length || 0} members
                  </Text>
                </div>
              </div>
              <Column padding="15px" gap="5px">
                <Text variant="heading3">{tree.familyName}</Text>
                <Text variant="body1">
                  Root: {tree.currentRootId ? 'Known' : 'Not set'}
                </Text>
              </Column>
            </Card>
          ))}
        </Grid>
      )}

      <AddTreeModal
        createdBy={currentUser?.uid }
        onSuccess={(result) => {
          console.log('Tree created successfully:', result);
          // Refresh the trees list after successful creation
          setTrees(prevTrees => [...prevTrees, result.tree]);
        }}
      />
    </FlexContainer>
  );
};

export default MyTreesPage;
