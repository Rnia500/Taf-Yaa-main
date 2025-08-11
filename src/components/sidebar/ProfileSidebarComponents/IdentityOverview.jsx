import React from 'react';
import Card from '../../../layout/containers/Card'
import Text from '../../Text';
import Divider from '../../Divider';
import Spacer from '../../Spacer';
import Row from '../../../layout/containers/Row';

export default function IdentityOverview({ identity }) {
  return (
    <Card alignItems='start' margin='0px 0px 0px 0px' padding='0px' backgroundColor="var(--color-background)" >
      <Text align='left' variant='heading3' >Identity Overview</Text>
      <Spacer size='md' />
      <Divider color="var(--color-gray)" thickness='2px' borderRadius='3px' />
      <Row padding='0px'>
        <Card alignItems='start' padding='0px' margin='0px 0px' backgroundColor='var(--color-transparent)'>
          <Text align='top' variant='caption1' color='tertiary-text'>Gender</Text>
          <Text variant='caption1' color='secondary'>{identity.gender}</Text>
        </Card>
        <Card alignItems='start' padding='0px' margin='0px 0px' backgroundColor='var(--color-transparent)'>
          <Text align='flex-left' variant='caption1' color='tertiary-text'>Family Role</Text>
          <Text variant='caption1' color='secondary'>{identity.familyRole}</Text>
        </Card>
      </Row>
      <Divider color="var(--color-gray)" thickness='2px' borderRadius='3px' style={{ margin: '15px 0' }} />
      <Row padding='0px'>
        <Card alignItems='start' padding='0px' margin='0px 0px' backgroundColor='var(--color-transparent)'>
          <Text align='top' variant='caption1' color='tertiary-text'>Tribe</Text>
          <Text variant='caption1' color='secondary'>{identity.tribe}</Text>
        </Card>
        <Card alignItems='start' padding='0px' margin='0px 0px' backgroundColor='var(--color-transparent)'>
          <Text align='flex-left' variant='caption1' color='tertiary-text'>Language</Text>
          <Text variant='caption1' color='secondary'>{identity.language}</Text>
        </Card>
      </Row>
      <Divider color="var(--color-gray)" thickness='2px' borderRadius='3px' style={{ margin: '15px 0' }} />
      <Card alignItems='start' padding='0px' margin='0px 0px' backgroundColor='var(--color-transparent)'>
        <Text align='flex-left' variant='caption1' color='tertiary-text'>Status</Text>
        <Text variant='caption1' color='secondary'>{identity.status}</Text>
      </Card>
    </Card>
  );
}
