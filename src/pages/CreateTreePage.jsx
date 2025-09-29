import React from 'react'
import FlexContainer from '../layout/containers/FlexContainer'
import Text from '../components/Text'
import Card from '../layout/containers/Card'
import Column from '../layout/containers/Column'
import Row from '../layout/containers/Row'
import Button from '../components/Button'
import AddTreeModal from '../components/AddTree/AddTreeModal'
import useModalStore from '../store/useModalStore'
import { useAuth } from '../context/AuthContext'


export const CreateTreePage = () => {
  const { openModal } = useModalStore();
  const { currentUser } = useAuth();

  const handleCreateTree = () => {
    openModal('treeModal', { createdBy: currentUser?.uid || 'placeholder-user-id' });
  };

  return (
    <FlexContainer align='center'>
      <Card backgroundColor='var(--color-background)' ><Text variant='heading1'> Create a new Family Tree </Text></Card>

      <FlexContainer direction='vertical'  justify='center' align='center' padding='20px'>
          <Card backgroundColor='var(--color-ground)'>

            <Button onClick={handleCreateTree}>
              Create a tree now!
            </Button>

          </Card>
          <Card backgroundColor='var(--color-gray)'>

            <Button>
              Tupac!!!
            </Button>

          </Card>
      </FlexContainer>

      <AddTreeModal
        createdBy={currentUser?.uid || 'placeholder-user-id'}
        onSuccess={(result) => {
          console.log('Tree created successfully:', result);
        }}
      />
    </FlexContainer>
  )
}
