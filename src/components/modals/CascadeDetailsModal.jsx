import React from 'react';
import Modal from '../../layout/containers/Modal';
import Row from '../../layout/containers/Row';
import Column from '../../layout/containers/Column';
import Text from '../Text';
import Button from '../Button';
import Divider from '../Divider';
import DataTable from '../DataTable';

const CascadeDetailsModal = ({
  isOpen,
  onClose,
  title = 'Cascade Details',
  batchId,
  people = [],
  marriages = [],
}) => {
  const personColumns = [
    { key: 'name', header: 'Name' },
    { key: 'gender', header: 'Gender' },
    { key: 'dob', header: 'DOB' },
    { key: 'dod', header: 'DOD' },
  ];

  const marriageColumns = [
    { key: 'spouse1', header: 'Spouse 1' },
    { key: 'spouse2', header: 'Spouse 2' },
    { key: 'marriageType', header: 'Type' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="900px">
      <Column padding="12px" margin="0px" gap="12px">
        <Text variant="h3" color="primary">{title}</Text>
        <Divider />
        {batchId && (
          <Text variant="caption" color="gray-dark">Batch: {batchId}</Text>
        )}

        <Text variant="h6">People ({people.length})</Text>
        <DataTable
          columns={personColumns}
          data={people}
          enablePagination
          initialPageSize={10}
          enableSearch={true}
          enableSort={false}
          enableFilters={false}
          showHeader={false}
          showControlsToggle={false}
        />

        <Text variant="h6">Marriages ({marriages.length})</Text>
        <DataTable
          columns={marriageColumns}
          data={marriages}
          enablePagination
          initialPageSize={10}
          enableSearch={true}
          enableSort={false}
          enableFilters={false}
          showHeader={false}
          showControlsToggle={false}
        />

        <Row padding='0px' justifyContent="flex-end" gap="10px" margin="8px 0 0 0">
          <Button variant="primary" onClick={onClose}>Close</Button>
        </Row>
      </Column>
    </Modal>
  );
};

export default CascadeDetailsModal; 