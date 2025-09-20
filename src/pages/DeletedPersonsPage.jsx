import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../layout/containers/Card';
import Text from '../components/Text';
import Button from '../components/Button';
import DeletionCountdown from '../components/DeletionCountdown';
import Spacer from '../components/Spacer';
import Row from '../layout/containers/Row';
import Column from '../layout/containers/Column';
import { personServiceLocal } from '../services/data/personServiceLocal';
import { marriageServiceLocal } from '../services/data/marriageServiceLocal';
import useToastStore from '../store/useToastStore';
import useModalStore from '../store/useModalStore';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import WarningModal from '../components/modals/WarningModal';

const DeletedPersonsPage = () => {
  const { treeId } = useParams();
  const [deletedPersons, setDeletedPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const addToast = useToastStore(state => state.addToast);
  const { openModal, closeModal } = useModalStore();

  useEffect(() => {
    loadDeletedPersons();
  }, [treeId]);

  const loadDeletedPersons = async () => {
    try {
      setLoading(true);
      const persons = treeId 
        ? await personServiceLocal.getDeletedPersonsByTreeId(treeId)
        : await personServiceLocal.getDeletedPersons();
      
      // Get additional data for each person
      const personsWithDetails = await Promise.all(
        persons.map(async (person) => {
          let affectedCount = 0;
          let marriageCount = 0;

          if (person.deletionMode === 'cascade' && person.deletionBatchId) {
            // For cascade deletions, count all people and marriages in the same batch
            const allDeleted = treeId 
              ? await personServiceLocal.getDeletedPersonsByTreeId(treeId)
              : await personServiceLocal.getDeletedPersons();
            
            const batchPersons = allDeleted.filter(p => p.deletionBatchId === person.deletionBatchId);
            affectedCount = batchPersons.length - 1; // -1 to exclude the person themselves
            
            // Count marriages in the same batch
            const marriages = await marriageServiceLocal.getAllMarriages();
            const batchMarriages = marriages.filter(m => 
              m.deletionBatchId === person.deletionBatchId && m.pendingDeletion
            );
            marriageCount = batchMarriages.length;
          } else {
            // For soft deletions, only the person themselves are affected
            affectedCount = 0;
            marriageCount = 0;
          }

          return {
            ...person,
            affectedCount,
            marriageCount
          };
        })
      );

      setDeletedPersons(personsWithDetails);
    } catch (error) {
      console.error('Failed to load deleted persons:', error);
      addToast('Failed to load deleted persons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (person) => {
    try {
      setActionLoading(prev => ({ ...prev, [person.id]: true }));
      
      const result = await personServiceLocal.undoDelete(person.id);
      
      addToast(
        `Successfully restored ${person.name}${result.restoredIds?.length > 1 ? ` and ${result.restoredIds.length - 1} others` : ''}`,
        'success'
      );
      
      await loadDeletedPersons();
    } catch (error) {
      console.error('Failed to restore person:', error);
      addToast(`Failed to restore person: ${error.message}`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [person.id]: false }));
    }
  };

  const handlePurge = (person) => {
    const warningMessage = person.deletionMode === 'cascade' 
      ? `This will permanently delete ${person.name} and ${person.affectedCount} other people, plus ${person.marriageCount} marriages. This action is irreversible and will break family relationships. Are you absolutely sure?`
      : `This will permanently delete ${person.name}. This action is irreversible. Are you absolutely sure?`;

    openModal('warningModal', {
      title: '⚠️ Permanent Deletion Warning',
      message: warningMessage,
      confirmText: 'Yes, Delete Permanently',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: () => {
        closeModal('warningModal');
        confirmPurge(person);
      },
      onCancel: () => {
        closeModal('warningModal');
      }
    });
  };

  const confirmPurge = async (person) => {
    try {
      setActionLoading(prev => ({ ...prev, [person.id]: true }));
      
      await personServiceLocal.purgePerson(person.id);
      
      addToast(`Permanently deleted ${person.name}`, 'success');
      await loadDeletedPersons();
    } catch (error) {
      console.error('Failed to purge person:', error);
      addToast(`Failed to purge person: ${error.message}`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [person.id]: false }));
    }
  };

  const getDeletionModeBadge = (mode) => {
    const styles = {
      soft: {
        backgroundColor: 'var(--color-warning-light)',
        color: 'var(--color-warning)',
        border: '1px solid var(--color-warning)',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600'
      },
      cascade: {
        backgroundColor: 'var(--color-danger-light)',
        color: 'var(--color-danger)',
        border: '1px solid var(--color-danger)',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }
    };

    return (
      <span style={styles[mode] || styles.soft}>
        {mode === 'soft' ? 'Soft Delete' : 'Cascade Delete'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Text variant="h4">Loading deleted persons...</Text>
      </div>
    );
  }

  if (deletedPersons.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Text variant="h4">No Deleted Persons</Text>
        <Spacer size="md" />
        <Text color="gray-dark">There are no deleted persons to restore or purge.</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Column gap="1.5rem">
        <div>
          <Text variant="h2" bold>Deleted Persons Management</Text>
          <Text color="gray-dark">
            Manage soft and cascade deleted persons. You can restore them or permanently purge them.
          </Text>
        </div>

        <Card padding="0" backgroundColor="var(--color-white)" shadow>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-gray-ultralight)', borderBottom: '2px solid var(--color-gray-light)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Person</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Deletion Mode</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Affected</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Time Remaining</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedPersons.map((person, index) => (
                  <tr 
                    key={person.id}
                    style={{ 
                      borderBottom: '1px solid var(--color-gray-light)',
                      backgroundColor: index % 2 === 0 ? 'var(--color-white)' : 'var(--color-gray-ultralight)'
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div>
                        <Text bold variant="h6">{person.name || 'Unknown'}</Text>
                        <Text variant="caption" color="gray-dark">
                          Deleted: {new Date(person.deletedAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getDeletionModeBadge(person.deletionMode)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <Text variant="body">
                          {person.affectedCount} people
                        </Text>
                        <Text variant="caption" color="gray-dark">
                          {person.marriageCount} marriages
                        </Text>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <DeletionCountdown
                        timeRemaining={person.timeRemaining}
                        isExpired={person.isExpired}
                        variant="badge"
                        showDetails={true}
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <Row gap="0.5rem" justifyContent="center">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRestore(person)}
                          loading={actionLoading[person.id]}
                          disabled={person.isExpired}
                        >
                          Restore
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handlePurge(person)}
                          loading={actionLoading[person.id]}
                        >
                          Purge
                        </Button>
                      </Row>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card backgroundColor="var(--color-info-light)" borderColor="var(--color-info)">
          <div style={{ padding: '12px' }}>
            <Text bold variant="h6" color="info">ℹ️ Information</Text>
            <Spacer size="sm" />
            <Text variant="body" color="info">
              • <strong>Soft Delete:</strong> Person is replaced with a placeholder but relationships are preserved
            </Text>
            <Text variant="body" color="info">
              • <strong>Cascade Delete:</strong> Person and all descendants are marked for deletion
            </Text>
            <Text variant="body" color="info">
              • <strong>Restore:</strong> Brings back the person and their relationships
            </Text>
            <Text variant="body" color="info">
              • <strong>Purge:</strong> Permanently removes the person (irreversible)
            </Text>
          </div>
        </Card>
      </Column>
    </div>
  );
};

export default DeletedPersonsPage;
