import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FlexContainer from '../layout/containers/FlexContainer';
import Text from '../components/Text';
import Card from '../layout/containers/Card';
import Column from '../layout/containers/Column';
import { getJoinRequestsForTree, reviewJoinRequest } from '../services/joinRequestService';
import useToastStore from '../store/useToastStore';
import { useAuth } from '../context/AuthContext';
import JoinRequestCard from '../components/PendingRequestCard';
import useModalStore from '../store/useModalStore';
import { Clock } from 'lucide-react';

const PendingRequestsPage = () => {
  const { treeId } = useParams();
  const { currentUser } = useAuth();
  const addToast = useToastStore(state => state.addToast);
  const { openModal } = useModalStore();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && treeId) {
      loadPendingRequests();
    }
  }, [currentUser, treeId]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await getJoinRequestsForTree(treeId);
      // Filter to only pending requests
      const pendingRequests = allRequests.filter(request => request.status === 'pending');
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      addToast('Failed to load pending requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      const { acceptJoinRequest } = await import('../services/joinRequestService');
      await acceptJoinRequest(request.JoinRequestId, currentUser.uid);
      addToast('Join request approved successfully', 'success');
      loadPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      addToast('Failed to approve join request', 'error');
    }
  };

  const handleDecline = async (request) => {
    try {
      await reviewJoinRequest(request.JoinRequestId, 'rejected', currentUser.uid);
      addToast('Join request rejected', 'success');
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      addToast('Failed to reject join request', 'error');
    }
  };

  const handleView = (request) => {
    openModal('pendingRequestDetailsModal', {
      request,
      onRefresh: loadPendingRequests,
    });
  };

  if (loading) {
    return (
      <FlexContainer direction="vertical" padding="20px" gap="20px" align="center">
        <Text variant="heading2">Loading pending requests...</Text>
      </FlexContainer>
    );
  }

  return (
    <FlexContainer direction="Column" gap="20px">
      <Column padding='0px' margin='0px' gap="20px">
        
          <Text variant="heading2" >
            Review and manage pending requests for your family tree
          </Text>

        {requests.length === 0 ? (
          <Card padding="40px" textAlign="center">
            <Clock size={48} color="var(--color-gray)" />
            <Text variant="heading3" margin="20px 0 10px 0">No Pending Requests</Text>
            <Text variant="body2" color="gray" margin="0 0 20px 0">
              There are currently no pending requests to review.
            </Text>
          </Card>
        ) : (
          <Column gap="15px">
            {requests.map((request) => (
              <JoinRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onDecline={handleDecline}
                onView={handleView}
              />
            ))}
          </Column>
        )}
      </Column>
    </FlexContainer>
  );
};

export default PendingRequestsPage;
