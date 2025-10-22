import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlexContainer from '../layout/containers/FlexContainer';
import Text from '../components/Text';
import Card from '../layout/containers/Card';
import Row from '../layout/containers/Row';
import Column from '../layout/containers/Column';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { getInvitesForUser } from '../services/inviteService';
import useToastStore from '../store/useToastStore';
import useSidebarStore from '../store/useSidebarStore';
import InviteDetailsSidebar from '../components/sidebar/InviteDetailsSidebar';
import useModalStore from '../store/useModalStore';
import { useFamilyData } from '../hooks/useFamilyData';
import { Mail, QrCode, Copy, Eye, EyeOff, Trash2, Calendar, Users, UserCheck } from 'lucide-react';

const InvitesPage = () => {
  const { treeId, inviteId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const openInviteSidebar = useSidebarStore(state => state.openInviteSidebar);
  const {reload} = useFamilyData;
  const [invites, setInvites] = useState([]);
  const {openModal, closeModal} = useModalStore
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState({});

  useEffect(() => {
    if (currentUser) {
      loadInvites();
    }
  }, [currentUser]);

 
  useEffect(() => {
    if (inviteId && invites.length > 0) {
      
      const foundInvite = invites.find(i => i.id === inviteId);
      if (foundInvite) {
        openInviteSidebar(foundInvite);
      }
    } else {
      
      const autoSelectInvite = sessionStorage.getItem('autoSelectInvite');
      if (autoSelectInvite && invites.length > 0) {
        try {
          const invite = JSON.parse(autoSelectInvite);
          const foundInvite = invites.find(i => i.id === invite.id);
          if (foundInvite) {
            openInviteSidebar(foundInvite);
          }
          // Clear the sessionStorage after use
          sessionStorage.removeItem('autoSelectInvite');
        } catch (error) {
          console.error('Error parsing auto-select invite:', error);
          sessionStorage.removeItem('autoSelectInvite');
        }
      }
    }
  }, [inviteId, invites, openInviteSidebar]);

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

  const loadInvites = async () => {
    try {
      setLoading(true);
      const userInvites = await getInvitesForUser(currentUser.uid);
      // Filter invites for the current tree if treeId is provided
      const filteredInvites = treeId ? userInvites.filter(invite => invite.treeId === treeId) : userInvites;
      setInvites(filteredInvites);
    } catch (error) {
      console.error('Error loading invites:', error);
      addToast('Failed to load invites', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Join link copied to clipboard', 'success');
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--color-success)';
      case 'used': return 'var(--color-warning)';
      case 'expired': return 'var(--color-error)';
      case 'revoked': return 'var(--color-gray)';
      default: return 'var(--color-gray)';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'moderator': return '🛡️';
      case 'editor': return '✏️';
      case 'viewer': return '👁️';
      default: return '👤';
    }
  };

  const columns = [
    {
      header: 'Type',
      key: 'type',
      searchable: true,
      filterable: true,
      render: (row) => (
        <Text variant="body2" style={{ textTransform: 'capitalize' }}>
          {row.type === 'targeted' ? '🎯 Targeted' : '🌐 Non-Targeted'}
        </Text>
      )
    },
    {
      header: 'Role',
      key: 'role',
      filterable: true,
      render: (row) => (
        <Text variant="body2">
          {getRoleIcon(row.role)} {row.role}
        </Text>
      )
    },
    {
      header: 'Status',
      filterable: true,
      key: 'status',
      render: (row) => (
        <Text variant="body2" style={{ color: getStatusColor(row.status), textTransform: 'capitalize' }}>
          {row.status}
        </Text>
      )
    },
    {
      header: 'Uses',
      key: 'usesCount',
      render: (row) => (
        <Text variant="body2">
          {row.usesCount || 0}/{row?.usesAllowed || 1}
        </Text>
      )
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (row) => (
        <Text variant="body2">
          {new Date(row.createdAt).toLocaleDateString()}
        </Text>
      )
    },
    {
      header: 'Expires',
      key: 'expiresAt',
      render: (row) => (
        <Text variant="body2">
          {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : 'Never'}
        </Text>
      )
    },
    {
      header: 'Actions',
      key: 'id',
      align:'center',
      render: (row) => (
        <Row padding='0px'   margin='0px' justifyContent='space-between' fitContent>
          <Button
            variant="ghost"
            size="small"
            onClick={() => copyToClipboard(row?.joinUrl)}
            title="Copy invite link"
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={() => openInviteSidebar(row)}
            title="View details"
          >
            <Eye size={14} />
          </Button>
          {row?.qrDataUrl && showQR[row.id] && (
            <div style={{ position: 'absolute', background: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', zIndex: 1000 }}>
              <img src={row.qrDataUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
            </div>
          )}
        </Row>
      )
    }
  ];

  if (loading) {
    return (
      <FlexContainer direction="vertical" padding="20px" gap="20px" align="center">
        <Text variant="heading2">Loading invites...</Text>
      </FlexContainer>
    );
  }

  return (
    <FlexContainer direction="vertical" padding="20px" gap="20px">
      <Row justifyContent='space-between' fitContent>
        <Text variant="heading1">My Invites</Text>
        <Button variant="primary" onClick={handleInviteMember}>
          <Mail size={16} style={{ marginRight: '8px' }} />
          Create New Invite
        </Button>
      </Row>

      {invites.length === 0 ? (
        <Card padding="40px" textAlign="center">
          <Mail size={48} color="var(--color-gray)" />
          <Text variant="heading3" margin="20px 0 10px 0">No Invites Found</Text>
          <Text variant="body2" color="gray" margin="0 0 20px 0">
            You haven't created any invites yet. Create your first invite to get started!
          </Text>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={invites}
          enableSearch={true}
          enablePagination={true}
          initialPageSize={10}
        />
      )}
    </FlexContainer>
  );
};

export default InvitesPage;
