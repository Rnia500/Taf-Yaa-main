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
import DataTable from '../components/DataTable';
import SelectDropdown from '../components/SelectDropdown';
import { SearchInput } from '../components/Input';

const DeletedPersonsPage = () => {
  const { treeId } = useParams();
  const [deletedPersons, setDeletedPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const addToast = useToastStore(state => state.addToast);
  const { openModal, closeModal } = useModalStore();
  const [sortOption, setSortOption] = useState('oldest');
  const [modeFilter, setModeFilter] = useState('');
  const [daysThreshold, setDaysThreshold] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDeletedPersons();
  }, [treeId]);

  const loadDeletedPersons = async () => {
    try {
      setLoading(true);
      const persons = treeId 
        ? await personServiceLocal.getDeletedPersonsByTreeId(treeId)
        : await personServiceLocal.getDeletedPersons();
      
      // Group by cascade batch; only show cascade roots for each batch
      const cascadeBatches = new Map();
      const filtered = [];
      for (const p of persons) {
        if (p.deletionMode === 'cascade') {
          if (!cascadeBatches.has(p.deletionBatchId)) {
            cascadeBatches.set(p.deletionBatchId, []);
          }
          cascadeBatches.get(p.deletionBatchId).push(p);
        } else {
          filtered.push(p); // soft deletions always included
        }
      }

      // From each cascade batch, pick the root if available; else pick earliest deleted
      for (const [batchId, people] of cascadeBatches.entries()) {
        let root = people.find(x => x.isCascadeRoot);
        if (!root) {
          root = people.slice().sort((a,b) => new Date(a.deletedAt) - new Date(b.deletedAt))[0];
        }
        if (root) filtered.push(root);
      }
      
      // Get additional data for each shown person
      const personsWithDetails = await Promise.all(
        filtered.map(async (person) => {
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

  const handleViewDetails = async (person) => {
    try {
      if (person.deletionMode !== 'cascade' || !person.deletionBatchId) {
        openModal('infoModal', {
          title: 'Details',
          message: `${person.name} was soft-deleted. No cascade details available.`,
          confirmText: 'Close',
        });
        return;
      }

      const allDeleted = treeId 
        ? await personServiceLocal.getDeletedPersonsByTreeId(treeId)
        : await personServiceLocal.getDeletedPersons();
      const batchPersonsRaw = allDeleted.filter(p => p.deletionBatchId === person.deletionBatchId);

      // Prepare person display items: name, gender, dob-dod
      const people = batchPersonsRaw.map(p => ({
        id: p.id,
        name: p.name || 'Unknown',
        gender: p.gender,
        dob: p.dob || null,
        dod: p.dod || null,
      }));

      // Build a map for quick lookup of person names by id (including deleted ones)
      const personNameById = new Map(people.map(p => [p.id, p.name]));

      const marriages = await marriageServiceLocal.getAllMarriages();
      const batchMarriagesRaw = marriages.filter(m => m.deletionBatchId === person.deletionBatchId && m.pendingDeletion);

      // Prepare marriages with spouse names
      const marriagesPrepared = batchMarriagesRaw.map(m => {
        let spouse1 = 'Unknown';
        let spouse2 = 'Unknown';
        if (m.marriageType === 'monogamous') {
          const [s1, s2] = Array.isArray(m.spouses) ? m.spouses : [];
          spouse1 = s1 ? (personNameById.get(s1) || 'Unknown') : 'Unknown';
          spouse2 = s2 ? (personNameById.get(s2) || 'Unknown') : 'Unknown';
        } else if (m.marriageType === 'polygamous') {
          const husbandName = m.husbandId ? (personNameById.get(m.husbandId) || 'Unknown') : 'Unknown';
          const wifeNames = Array.isArray(m.wives) ? m.wives.map(w => personNameById.get(w.wifeId) || 'Unknown') : [];
          if (wifeNames.length > 0) {
            spouse1 = husbandName;
            spouse2 = wifeNames.join(', ');
          } else {
            spouse1 = husbandName;
            spouse2 = 'Unknown';
          }
        }
        return {
          id: m.id,
          marriageType: m.marriageType,
          spouse1,
          spouse2,
        };
      });

      openModal('cascadeDetailsModal', {
        title: `Cascade Details — ${person.name}`,
        batchId: person.deletionBatchId,
        people,
        marriages: marriagesPrepared,
      });
    } catch (error) {
      console.error('Failed to load details:', error);
      addToast('Failed to load details', 'error');
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

  const sortedAndFiltered = React.useMemo(() => {
    let rows = [...deletedPersons];

    // Search by name
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rows = rows.filter(r => String(r.name || '').toLowerCase().includes(q));
    }

    if (modeFilter) {
      rows = rows.filter(r => r.deletionMode === modeFilter);
    }
    if (daysThreshold) {
      const n = Number(daysThreshold);
      if (!isNaN(n) && n > 0) {
        rows = rows.filter(r => Number(r.daysRemaining) <= n);
      }
    }

    if (sortOption === 'oldest') {
      rows.sort((a,b) => new Date(a.deletedAt) - new Date(b.deletedAt));
    } else if (sortOption === 'newest') {
      rows.sort((a,b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    } else if (sortOption === 'mostAffected') {
      rows.sort((a,b) => (b.affectedCount||0) - (a.affectedCount||0));
    } else if (sortOption === 'leastAffected') {
      rows.sort((a,b) => (a.affectedCount||0) - (b.affectedCount||0));
    }

    return rows;
  }, [deletedPersons, searchQuery, sortOption, modeFilter, daysThreshold]);

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
      <Column gap="1rem">
        <Row justifyContent="space-between" alignItems="center">
          <Column gap="4px">
            <Text variant="heading1" as="h1" bold>Deleted Persons</Text>
            <Text color="gray-dark">Manage soft and cascade deletions. Restore or permanently purge.</Text>
          </Column>
          <Row gap="10px">
            <Button variant="primary" onClick={loadDeletedPersons}>Refresh</Button>
          </Row>
        </Row>

        {/** Controls: Search + Sort + Filters */}
        <Card padding='1rem' margin='0px' backgroundColor="var(--color-white)" borderColor="var(--color-gray-light)">
          
            <Row fitContent padding='0px' margin='0px' gap="10px" wrap>
              <Column padding='0px' margin='0px' gap="6px">
                <Text variant="body" color="gray-dark">Search</Text>
                <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search..." />
              </Column>

              <SelectDropdown
                label="Sort"
                value={sortOption}
                onChange={setSortOption}
                options={[
                  { value: 'oldest', label: 'Oldest → Newest' },
                  { value: 'newest', label: 'Newest → Oldest' },
                  { value: 'mostAffected', label: 'Most affected' },
                  { value: 'leastAffected', label: 'Least affected' },
                ]}
              />

              <SelectDropdown
                label="Deletion Mode"
                value={modeFilter}
                onChange={setModeFilter}
                options={[
                  { value: '', label: 'All' },
                  { value: 'soft', label: 'Soft' },
                  { value: 'cascade', label: 'Cascade' },
                ]}
              />

              <SelectDropdown
                label="Days before purge"
                value={daysThreshold}
                onChange={setDaysThreshold}
                options={[{ value: '', label: 'Any' }, ...Array.from({ length: 30 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}` }))]}
              />

              {(modeFilter || daysThreshold || searchQuery) && (
                <Button variant="secondary" onClick={() => { setModeFilter(''); setDaysThreshold(''); setSearchQuery(''); }}>Clear</Button>
              )}
            </Row>
          
        </Card>

        {/** DataTable replacing manual table */}
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Person',
              sortable: false,
              render: (row) => (
                <div>
                  <Text bold variant="h6">{row.name || 'Unknown'}</Text>
                  <Text variant="caption" color="gray-dark">Deleted: {new Date(row.deletedAt).toLocaleDateString()}</Text>
                </div>
              )
            },
            {
              key: 'deletionMode',
              header: 'Deletion Mode',
              render: (row) => getDeletionModeBadge(row.deletionMode)
            },
            {
              key: 'affectedCount',
              header: 'Affected',
              sortable: false,
              render: (row) => (
                <div>
                  <Text variant="body">{row.affectedCount} people</Text>
                  <Text variant="caption" color="gray-dark">{row.marriageCount} marriages</Text>
                </div>
              )
            },
            {
              key: 'timeRemaining',
              header: 'Time Remaining',
              sortable: false,
              render: (row) => (
                <DeletionCountdown
                  timeRemaining={row.timeRemaining}
                  isExpired={row.isExpired}
                  variant="badge"
                  showDetails={true}
                />
              )
            },
            {
              key: 'actions',
              header: 'Actions',
              searchable: false,
              sortable: false,
              render: (row) => (
                <Row gap="0.5rem" justifyContent="center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRestore(row)}
                    loading={actionLoading[row.id]}
                    disabled={row.isExpired}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handlePurge(row)}
                    loading={actionLoading[row.id]}
                  >
                    Purge
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewDetails(row)}
                  >
                    View Details
                  </Button>
                </Row>
              )
            }
          ]}
          data={sortedAndFiltered}
          enablePagination
          initialPageSize={10}
          enableSearch={false}
          enableSort={false}
          enableFilters={false}
          showHeader={false}
          showControlsToggle={false}
        />

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
