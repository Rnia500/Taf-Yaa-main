import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlexContainer from '../layout/containers/FlexContainer';
import Text from '../components/Text';
import Card from '../layout/containers/Card';
import Row from '../layout/containers/Row';
import Column from '../layout/containers/Column';
import Button from '../components/Button';
import SelectDropdown from '../components/SelectDropdown';
import PersonCardHorizontal from '../components/PersonCardHorizontal';
import DataTable from '../components/DataTable';
import { useFamilyData } from '../hooks/useFamilyData';
import { useAuth } from '../context/AuthContext';
import dataService from '../services/dataService';
import useToastStore from '../store/useToastStore';
import useModalStore from '../store/useModalStore';
import { DeletePersonModal } from '../components/modals/DeletePersonModal';
import { UserPen, Trash2, Users, User, Settings, Users2, UserPlus } from 'lucide-react';

const MembersPage = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { people, tree, loading, reload } = useFamilyData(treeId);
  const addToast = useToastStore(state => state.addToast);
  const { openModal, closeModal } = useModalStore();

  const [members, setMembers] = useState([]);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [activeTab, setActiveTab] = useState('people');

  // Filter members (people with linkedUserId)
  useEffect(() => {
    if (people && tree) {
      const treeMembers = people.filter(person => person.linkedUserId);
      setMembers(treeMembers);
    }
  }, [people, tree]);

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' }
  ];

  const handleRoleChange = async (personId, newRole) => {
    if (!tree || !currentUser) return;

    // Check if current user is admin
    const currentUserMember = tree.members?.find(m => m.userId === currentUser.uid);
    if (currentUserMember?.role !== 'admin') {
      addToast('Only admins can change member roles', 'error');
      return;
    }

    setUpdatingRole(personId);
    try {
      await dataService.changeMemberRole(treeId, people.find(p => p.id === personId).linkedUserId, newRole);
      addToast('Role updated successfully', 'success');
      reload(); // Refresh data
    } catch (error) {
      addToast(`Failed to update role: ${error.message}`, 'error');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleEditPerson = (personId) => {
    openModal('editPerson', { personId });
  };

  const handleDeletePerson = (person) => {
    openModal('deletePerson', { person, onDeleteComplete: reload });
  };

  const handleViewRelationships = (personId) => {
    openModal('relationships', { personId });
  };

  const handleInviteMember = () => {
    openModal('inviteTypeModal', {
      onSelectType: (type) => {
        closeModal('inviteTypeModal');
        openModal('inviteModal', {
          treeId,
          inviteType: type,
          onInviteCreated: (invite) => {
            console.log('Invitation created:', invite);
            reload();
          },
          onNavigate: (path) => navigate(path)
        });
      }
    });
  };

  const handleNavigateToInvitePage = () => {
    navigate(`/family-tree/${treeId}/invites`);
  };

  if (loading) {
    return (
      <FlexContainer justify="center" align="center" padding="20px">
        <Text>Loading members...</Text>
      </FlexContainer>
    );
  }

  if (!tree) {
    return (
      <FlexContainer justify="center" align="center" padding="20px">
        <Text>Tree not found</Text>
      </FlexContainer>
    );
  }

  const currentUserMember = tree.members?.find(m => m.userId === currentUser.uid);
  const canManageRoles = currentUserMember?.role === 'admin';

  const tabs = [
    { id: 'people', label: 'Manage People', icon: User },
    { id: 'members', label: 'Manage Members', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'people':
        return <ManagePeopleTab people={people} onEdit={handleEditPerson} onDelete={handleDeletePerson} onViewRelationships={handleViewRelationships} />;
      case 'members':
        return <ManageMembersTab members={members} roleOptions={roleOptions} onRoleChange={handleRoleChange} updatingRole={updatingRole} canManageRoles={canManageRoles} onInviteMember={handleInviteMember} onNavigateToInvitePage={handleNavigateToInvitePage} />;
      default:
        return null;
    }
  };

  return (
    <FlexContainer direction="vertical" padding="20px" gap="20px">
      <Row justifyContent="space-between" align="center">
        <Text variant="heading1">Manage Members</Text>
        <Text variant="body2" color="gray">Tree: {tree.familyName}</Text>
      </Row>

      {/* Tabs */}
      <Row gap="0" style={{ borderBottom: '1px solid var(--color-gray-light)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              style={{
                borderRadius: '0',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : 'none',
                padding: '12px 20px'
              }}
            >
              <Icon size={16} style={{ marginRight: '8px' }} />
              {tab.label}
            </Button>
          );
        })}
      </Row>

      <Text variant="body1">
        {activeTab === 'people' && 'View and manage all people in your family tree.'}
        {activeTab === 'members' && 'Manage roles and details for members of your family tree. Only admins can change roles.'}
        {activeTab === 'settings' && 'Configure tree settings and permissions.'}
      </Text>

      {renderTabContent()}

      {/* Modals */}
      <DeletePersonModal />
    </FlexContainer>
  );
};

// Tab Components
const ManagePeopleTab = ({ people, onEdit, onDelete, onViewRelationships }) => {
  const calculateAge = (birthDate, deathDate, isDeceased) => {
    if (!birthDate) return 'Unknown';
    const birth = new Date(birthDate);
    const end = isDeceased && deathDate ? new Date(deathDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const columns = [
    {
      key: 'profileImage',
      header: 'Photo',
      render: (person) => (
        <img
          src={person.photoUrl || '/Images/default-avatar.png'}
          alt={person.name}
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
        />
      ),
      align: 'center'
    },
    { key: 'name', header: 'Name', type: 'string', searchable: true, sortable: true },
    {
      key: 'age',
      header: 'Age',
      render: (person) => calculateAge(person.dob, person.dod, person.isDeceased),
      type: 'number',
      sortable: true,
      align: 'center',
    },
    { key: 'gender', header: 'Gender', type: 'string', filterable: true },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (person) => (
        <Row gap="5px">
          <Button variant="secondary" size="small" onClick={(e) => { e.preventDefault(); onEdit(person.id); }}>
            <UserPen size={14} />
          </Button>
          <Button variant="info" size="small" onClick={(e) => { e.preventDefault(); onViewRelationships(person.id); }}>
            <Users2 size={14} />
          </Button>
          <Button variant="danger" size="small" onClick={(e) => { e.preventDefault(); onDelete(person); }}>
            <Trash2 size={14} />
          </Button>
        </Row>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={people || []}
      enableSearch={true}
      enablePagination={true}
      initialPageSize={10}
    />
  );
};

const ManageMembersTab = ({ members, roleOptions, onRoleChange, updatingRole, canManageRoles, onInviteMember, onNavigateToInvitePage }) => {
  if (members.length === 0) {
    return (
      <Column gap="20px">
        <Row justifyContent="center">
          <Button variant="primary" onClick={onInviteMember}>
            <UserPlus size={16} style={{ marginRight: '8px' }} />
            Invite Member
          </Button>
          <Button variant='primary' onClick={onNavigateToInvitePage}>
            Go to invite page
          </Button>
        </Row>
        <Card padding="20px" textAlign="center">
          <Users size={48} color="var(--color-gray)" />
          <Text variant="heading3" margin="10px 0">No Members Found</Text>
          <Text variant="body2" color="gray">
            Members are people linked to user accounts in your tree.
          </Text>
        </Card>
      </Column>
    );
  }

  return (
    <Column gap="15px">
      <Row justifyContent="flex-end">
        <Button variant="primary" onClick={onInviteMember}>
          <UserPlus size={16} style={{ marginRight: '8px' }} />
          Invite Member
        </Button>
      </Row>
      {members.map((member) => (
        <Card key={member.id} padding="15px" borderRadius="10px">
          <Row align="center" gap="15px">
            <PersonCardHorizontal
              name={member.name}
              gender={member.gender}
              birthDate={member.dob}
              deathDate={member.dod}
              role={member.role}
              profileImage={member.photoUrl}
              isDead={member.isDeceased}
              style={{ flex: 1 }}
            />

            <Column gap="10px" style={{ minWidth: '200px' }}>
              <Row align="center" gap="10px">
                <Text variant="body2" bold>Role:</Text>
                {canManageRoles ? (
                  <SelectDropdown
                    options={roleOptions}
                    value={member.role}
                    onChange={(e) => onRoleChange(member.id, e.target.value)}
                    placeholder="Select role"
                    disabled={updatingRole === member.id}
                  />
                ) : (
                  <Text variant="body2" style={{ textTransform: 'capitalize' }}>
                    {member.role || 'No role'}
                  </Text>
                )}
              </Row>
            </Column>
          </Row>
        </Card>
      ))}
    </Column>
  );
};


export default MembersPage;
