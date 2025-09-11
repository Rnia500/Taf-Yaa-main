import React from 'react'
import FlexContainer from '../layout/containers/FlexContainer'
import Text from '../components/Text'
import Card from '../layout/containers/Card'
import Column from '../layout/containers/Column'
import Row from '../layout/containers/Row'
import Button from '../components/Button'

export const CreateTreePage = () => {
  return (
    <FlexContainer  align='center'>
      <Card backgroundColor='var(--color-background)' ><Text variant='heading1'> Create a new Family Tree </Text></Card>
      <Row padding='0px' margin='0px'>
        <Card backgroundColor='var(--color-ground)'>

          <Button>
            Create a tree now!
          </Button>

        </Card>
        <Card backgroundColor='var(--color-gray)'>

          <Button>
            Tupac!!!
          </Button>

        </Card>
      </Row>
    </FlexContainer>
  )
}
