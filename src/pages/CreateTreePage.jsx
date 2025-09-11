import React from 'react'
import FlexContainer from '../layout/containers/FlexContainer'
import Text from '../components/Text'
import Card from '../layout/containers/Card'
import Column from '../layout/containers/Column'
import Row from '../layout/containers/Row'
import Button from '../components/Button'
import AddTreeModal from '../components/AddTree/AddTreeModal'
import useModalStore from '../store/useModalStore'




export const CreateTreePage = () => {
  const { openModal } = useModalStore();

  const handleCreateTree = () => {
    openModal('treeModal', { createdBy: 'user' });
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
        createdBy="user"
        onSuccess={(result) => {
          console.log('Tree created successfully:', result);
          // You can add navigation logic here if needed
        }}
      />
    </FlexContainer>
  )
}
