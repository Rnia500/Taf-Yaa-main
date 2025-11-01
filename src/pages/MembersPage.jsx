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

import { UserPen, Trash2, Users, User, Settings, Users2, UserPlus, Ban } from 'lucide-react';
import Pill from '../components/pill';

const MembersPage = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { people, tree, loading, reload } = useFamilyData(treeId);
  const addToast = useToastStore(state => state.addToast);
  const { openModal, closeModal } = useModalStore();

  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('people');

  // Filter and enrich members (people with linkedUserId)
  useEffect(() => {
    if (people && tree) {
      const treeMembers = people.filter(person => person.linkedUserId).map(person => {
        const treeMember = tree.members?.find(m => m.userId === person.linkedUserId);
        return {
          ...person,
          role: treeMember?.role || 'viewer',
          joinedAt: treeMember?.joinedAt,
          banned: treeMember?.banned || false,
          banPeriod: treeMember?.banPeriod || null,
          lastActive: treeMember?.lastActive,
          status: treeMember?.banned ? (treeMember.banPeriod ? 'Banned (temp)' : 'Banned') : 'Active'
        };
      });

      // Remove duplicates based on linkedUserId
      const uniqueMembers = treeMembers.filter((member, index, self) =>
        index === self.findIndex(m => m.linkedUserId === member.linkedUserId)
      );

      setMembers(uniqueMembers);
    }
  }, [people, tree]);



  const handleDeletePerson = (person) => {
    openModal('deletePerson', { person, onDeleteComplete: reload });
  };

  const handleViewRelationships = (personId) => {
    openModal('relationships', { personId });
  };

  const handleGrantMembership = (person) => {
    if (!tree || !currentUser) return;

    // Check if current user is admin
    const currentUserMember = tree.members?.find(m => m.userId === currentUser.uid);
    if (currentUserMember?.role !== 'admin') {
      openModal('errorModal', { message: 'Only admins can grant membership' });
      return;
    }

    openModal('grantMembershipModal', {
      person,
      treeId,
      treeName: tree.familyName,
      onMembershipGranted: reload
    });
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

  const handleRevokeMember = async (personId) => {
    if (!tree || !currentUser) return;

    // Check if current user is admin
    const currentUserMember = tree.members?.find(m => m.userId === currentUser.uid);
    if (currentUserMember?.role !== 'admin') {
      openModal('errorModal', { message: 'Only admins can revoke member access' });
      return;
    }

    openModal('warningModal', {
      message: 'Are you sure you want to revoke this member\'s access? They will lose access to the tree but their person data will remain.',
      onConfirm: async () => {
        try {
          const person = people.find(p => p.id === personId);
          await dataService.removeMember(treeId, person.linkedUserId);
          addToast('Member access revoked successfully', 'success');
          reload(); // Refresh data
        } catch (error) {
          openModal('errorModal', { message: `Failed to revoke member access: ${error.message}` });
        }
      },
      onCancel: () => {}
    });
  };

  const handleEditMemberRole = (member) => {
    if (!tree || !currentUser) return;

    // Check if current user is admin
    const currentUserMember = tree.members?.find(m => m.userId === currentUser.uid);
    if (currentUserMember?.role !== 'admin') {
      openModal('errorModal', { message: 'Only admins can change member roles' });
      return;
    }

    openModal('editMemberRole', {
      member,
      treeId,
      onRoleUpdated: reload
    });
  };

  const handleToggleBan = async (member, banPeriod = null) => {
    if (!tree || !currentUser) return;

    // Check if current user is admin
    const currentUserMember = tree.members?.find(m => m.userId === currentUser.uid);
    if (currentUserMember?.role !== 'admin') {
      openModal('errorModal', { message: 'Only admins can ban/unban members' });
      return;
    }

    try {
      if (member.banned) {
        await dataService.unbanMember(treeId, member.linkedUserId);
        addToast('Member unbanned successfully', 'success');
      } else {
        await dataService.banMember(treeId, member.linkedUserId, banPeriod);
        addToast('Member banned successfully', 'success');
      }
      reload(); // Refresh data
    } catch (error) {
      openModal('errorModal', { message: `Failed to ${member.banned ? 'unban' : 'ban'} member: ${error.message}` });
    }
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
        return <ManagePeopleTab people={people} onEdit={() => {}} onDelete={handleDeletePerson} onViewRelationships={handleViewRelationships} onGrantMembership={handleGrantMembership} canManageRoles={canManageRoles} />;
      case 'members':
        return <ManageMembersTab members={members} canManageRoles={canManageRoles} onInviteMember={handleInviteMember} onNavigateToInvitePage={handleNavigateToInvitePage} onRevokeMember={handleRevokeMember} onEditMemberRole={handleEditMemberRole} onToggleBan={handleToggleBan} treeId={treeId} openModal={openModal} />;
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
    </FlexContainer>
  );
};

// Tab Components
const ManagePeopleTab = ({ people, onEdit, onDelete, onViewRelationships, onGrantMembership, canManageRoles }) => {
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
        canManageRoles && !person.linkedUserId ?
          <Row padding='0rem 1rem' gap="5px" alignItems='center' maxWidth={300}>
            <Button variant="secondary" size="small" fullWidth onClick={(e) => { e.preventDefault(); onEdit(person.id); }}>
              <UserPen size={14} />
            </Button>
            <Button variant="info" size="small" fullWidth onClick={(e) => { e.preventDefault(); onViewRelationships(person.id); }}>
              <Users2 size={14} />
            </Button>
            <Button variant="primary" size="small" fullWidth onClick={(e) => { e.preventDefault(); onGrantMembership(person); }}>
              <UserPlus size={14} />
            </Button>
            <Button variant="danger" size="small" fullWidth onClick={(e) => { e.preventDefault(); onDelete(person); }}>
              <Trash2 size={14} />
            </Button>
          </Row>
        :
          <Row padding='0rem 1rem' gap="5px" maxWidth={300}>
            <Button variant="secondary" size="small" fullWidth onClick={(e) => { e.preventDefault(); onEdit(person.id); }}>
              <UserPen size={14} />
            </Button>
            <Button variant="info" size="small" fullWidth onClick={(e) => { e.preventDefault(); onViewRelationships(person.id); }}>
              <Users2 size={14} />
            </Button>
            <Button variant="danger" size="small" fullWidth onClick={(e) => { e.preventDefault(); onDelete(person); }}>
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

const ManageMembersTab = ({ members, canManageRoles, onInviteMember, onNavigateToInvitePage, onRevokeMember, onEditMemberRole, onToggleBan, treeId, openModal }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      key: 'profileImage',
      header: 'Photo',
      render: (member) => (
        <img
          src={member.photoUrl || '/Images/default-avatar.png'}
          alt={member.name}
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
        />
      ),
      align: 'center'
    },
    { key: 'name', header: 'Person Name', type: 'string', searchable: true, sortable: true },
    {
      key: 'role',
      header: 'Role',
      type: 'string',
      filterable: true,
      render: (member) => (
        <Text variant="body2" style={{ textTransform: 'capitalize' }}>
          {member.role || 'No role'}
        </Text>
      )
    },
    {
      key: 'joinedAt',
      header: 'Join Date',
      render: (member) => formatDate(member.joinedAt),
      type: 'date',
      sortable: true,
      align: 'center'
    },
    {
      key: 'status',
      header: 'Status',
      type: 'string',
      filterable: true,
      filterOptions: [
        { value: 'Active', label: 'Active' },
        { value: 'Banned', label: 'Banned' },
        { value: 'Banned (temp)', label: 'Banned (temp)' }
      ],
      render: (member) => {
        let status = member.status;
        let backgroundColor = 'var(--color-primary1)'; // for active
        let color = 'white';
        let countdown = null;
        

        if (member.banned) {
          if (member.banPeriod) {
            backgroundColor = 'var(--color-warning2)'; // for banned temp
          } else {
            backgroundColor = 'var(--color-danger)'; // for banned
          }

          // Show countdown if there's a ban period
          if (member.banPeriod) {
            const banEndDate = new Date(member.banPeriod);
            const now = new Date();
            const diffTime = banEndDate - now;

            if (diffTime > 0) {
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

              if (diffDays > 0) {
                countdown = `${diffDays}d`;
              } else if (diffHours > 0) {
                countdown = `${diffHours}h`;
              } else {
                countdown = `${diffMinutes}m`;
              }
            }
          }
        } else if (!member.lastActive) {
          backgroundColor = 'var(--color-primary1)'; 
          color = 'white';
        } else {
          
          const lastActiveDate = new Date(member.lastActive);
          const now = new Date();
          const diffTime = Math.abs(now - lastActiveDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 30) {
            backgroundColor = 'var(--color-warning)'; 
            color = '#333';
          }
        }

        return (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Pill backgroundColor={backgroundColor} color={color}>
              {status}
            </Pill>
            {countdown && (
              <Card
                fitContent
                padding="1px 4px"
                backgroundColor="#ff6b6b"
                borderRadius="4px"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  fontSize: '10px',
                  color: 'white',
                  fontWeight: 'bold',
                  zIndex: 1
                }}
              >
                {countdown}
              </Card>
            )}
          </div>
        );
      },
      align: 'center'
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (member) => formatDate(member.lastActive),
      type: 'date',
      sortable: true,
      align: 'center'
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (member) => (
        <Row padding='0rem 1rem' gap='1rem'>
          {canManageRoles && (
            <>
              <Button margin='0px 5px 0px 5px' variant="secondary" size="sm" fullWidth onClick={(e) => { e.preventDefault(); onEditMemberRole(member); }}>
                Role
              </Button>
              <Button margin='0px 5px 0px 5px' variant="warning" size="sm" fullWidth onClick={(e) => {
                e.preventDefault();
                if (member.banned) {
                  onToggleBan(member); 
                } else {
                  openModal('banMemberModal', { member, treeId, onBanConfirmed: onToggleBan });
                }
              }}>
                {member.banned ? 'Unban' : 'Ban'}
              </Button>
              <Button margin='0px 5px 0px 5px' variant="danger" size="sm" fullWidth onClick={(e) => { e.preventDefault(); onRevokeMember(member.id); }}>
                Revoke
              </Button>
            </>
          )}
        </Row>
      )
    }
  ];

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
      <DataTable
        columns={columns}
        data={members || []}
        enableSearch={true}
        enablePagination={true}
        initialPageSize={10}
      />
    </Column>
  );
};


export default MembersPage;
