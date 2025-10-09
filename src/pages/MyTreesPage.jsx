import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FlexContainer from '../layout/containers/FlexContainer';
import Text from '../components/Text';
import Card from '../layout/containers/Card';
import Column from '../layout/containers/Column';
import Row from '../layout/containers/Row';
import Button from '../components/Button';
import Grid from '../layout/containers/Grid';
import { useAuth } from '../context/AuthContext';
import dataService from '../services/dataService';
import ImageCard from '../layout/containers/ImageCard';
import { SearchInput } from '../components/Input';
import useModalStore from '../store/useModalStore';
import Toast from '../components/toasts/Toast';
import useToastStore from '../store/useToastStore';
import { authService } from '../services/authService';
import TreeInfoModal from '../components/modals/TreeInfoModal';

import '../styles/PersonMenu.css';
import { Users, User, CircleUserRound, MapPinHouse, GitCompareArrows, Settings } from 'lucide-react';
import PageFrame from '../layout/containers/PageFrame';
import MyTreeNavBar from '../components/navbar/MyTreeNavBar';

const MyTreesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { openModal } = useModalStore();
  const [trees, setTrees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [rootNames, setRootNames] = useState({});
  const addToast = useToastStore(state => state.addToast);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, treeId: null });
  const menuRef = useRef();
  const [isTreeInfoModalOpen, setIsTreeInfoModalOpen] = useState(false);
  const [treeInfoData, setTreeInfoData] = useState({ tree: null, rootName: 'N/A', creatorName: 'N/A' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 3x3 grid



  useEffect(() => {
    if (!contextMenu.visible) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [contextMenu.visible]);

  useEffect(() => {
    const fetchTrees = async () => {
      if (!currentUser) return;
      try {
        const userTrees = await dataService.getTreesByUserId(currentUser.uid);
        setTrees(userTrees);

        // Fetch root person names
        const names = {};
        for (const tree of userTrees) {
          if (tree.currentRootId) {
            try {
              const person = await dataService.getPerson(tree.currentRootId);
              names[tree.id] = person ? person.name : 'Unknown';
            } catch (error) {
              console.error('Failed to fetch root person:', error);
              names[tree.id] = 'Unknown';
            }
          } else {
            names[tree.id] = 'No Root';
          }
        }
        setRootNames(names);
      } catch (error) {
        console.error('Failed to fetch trees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, [currentUser]);

  const filteredTrees = trees.filter(tree =>
    tree.familyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrees.length / pageSize);
  const paginatedTrees = filteredTrees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCreateTree = () => {
    openModal('treeModal', {
      createdBy: currentUser?.uid,
      onSuccess: async (result) => {
        console.log('Tree operation successful:', result);
        setTrees(prevTrees => {
          const existingIndex = prevTrees.findIndex(t => t.id === result.tree.id);
          if (existingIndex >= 0) {
            // Update existing tree
            const updatedTrees = [...prevTrees];
            updatedTrees[existingIndex] = result.tree;
            return updatedTrees;
          } else {
            // Add new tree
            return [...prevTrees, result.tree];
          }
        });

        // Fetch root name for the tree (new or updated)
        if (result.tree.currentRootId) {
          try {
            const person = await dataService.getPerson(result.tree.currentRootId);
            setRootNames(prev => ({
              ...prev,
              [result.tree.id]: person ? person.name : 'Unknown'
            }));
          } catch (error) {
            console.error('Failed to fetch root person for tree:', error);
            setRootNames(prev => ({
              ...prev,
              [result.tree.id]: 'Unknown'
            }));
          }
        } else {
          setRootNames(prev => ({
            ...prev,
            [result.tree.id]: 'No Root'
          }));
        }
      }
    });
  };

  const handleJoinTree = () => {
    addToast(`join tree functionslity not yet implemented on tree but it is on the way no worries`, 'error')
  }


  const handleTreeClick = (treeId) => {
    navigate(`/family-tree/${treeId}`);
  };

  const handleContextMenu = (e, treeId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, treeId });
  };

  const handleManageMembers = (treeId) => {
    setContextMenu({ ...contextMenu, visible: false });
    navigate(`/family-tree/${treeId}/members`);
  };

  const handleDeleteTree = async (treeId) => {
    setContextMenu({ ...contextMenu, visible: false });
    if (window.confirm('Are you sure you want to delete this tree?')) {
      try {
        await dataService.deleteTree(treeId);
        setTrees(trees.filter(t => t.id !== treeId));
        addToast('Tree deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete tree:', error);
        addToast('Failed to delete tree', 'error');
      }
    }
  };

  const handleViewTreeInfo = async (treeId) => {
    setContextMenu({ ...contextMenu, visible: false });
    const tree = trees.find(t => t.id === treeId);
    if (!tree) return;

    // Fetch creator's user name for display
    let creatorName = 'N/A';
    if (tree.createdBy) {
      try {
        const userData = await authService.getUserById(tree.createdBy);
        if (userData?.displayName && userData.displayName !== tree.createdBy && userData.displayName !== 'Unknown') {
          creatorName = userData.displayName;
        } else {
          creatorName = `Anonymous User`; // Show anonymous if no proper name
        }
      } catch (error) {
        console.error('Failed to fetch creator name:', error);
        creatorName = `Anonymous User`;
      }
    }

    setTreeInfoData({
      tree,
      rootName: rootNames[treeId] || 'N/A',
      creatorName,
    });
    setIsTreeInfoModalOpen(true);
  };

  const handleSettings = (treeId) => {
    setContextMenu({ ...contextMenu, visible: false });
    navigate(`/family-tree/${treeId}/settings`);
  };




  const handleShareTree = () => {
    setContextMenu({ ...contextMenu, visible: false });
    addToast('Share tree functionality not implemented yet', 'info');
  };

  if (!currentUser) {
    return (
      <FlexContainer justify="center" align="center" padding="20px">
        <Text>Please log in to view your trees.</Text>
      </FlexContainer>
    );
  }

  if (loading) {
    return (
      <FlexContainer justify="center" align="center" padding="20px">
        <Text>Loading your trees...</Text>
      </FlexContainer>
    );
  }

  return (
    <PageFrame topbar={<MyTreeNavBar />}>
      <FlexContainer backgroundColor="#FDF8F0" direction="vertical" padding="20px" gap="20px">
        <Row justifyContent="space-between" fitContent align="center">
          <Text variant="heading1">My Trees</Text>
          <Row padding='0px' margin='0px' fitContent>
            <Button onClick={handleCreateTree}>Create Tree</Button>
            <Button onClick={handleJoinTree}>Join Tree</Button>
          </Row>

        </Row>

      <Row justify="space-between" align="center">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search for a tree"
          style={{
            flex: 1,
            maxWidth: '300px'
          }}
        />
      </Row>

      {filteredTrees.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">No trees found. Create your first family tree!</p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {paginatedTrees.map((tree) => (
              <div
                key={tree.id}
                onClick={() => handleTreeClick(tree.id)}
                onContextMenu={(e) => handleContextMenu(e, tree.id)}
                className="bg-white rounded-xl max-w-90 shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 group"
              >
                <div className="relative h-56">
                  <img
                    src={tree.familyPhoto}
                    alt={`${tree.familyName} family`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <Text variant='heading3' bold>The {tree.familyName} Family Tree</Text>
                  <div className="text-gray-600 space-y-1">
                    <p><span className=" text-sm font-semibold">Role:</span> {tree.role}</p>
                    <p><span className=" text-sm font-semibold">Root Person:</span> {rootNames[tree.id] || 'Loading...'}</p>
                    <p><span className=" text-sm font-semibold">Number of members:</span> {tree.members?.length || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTrees.length > 0 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                variant="secondary"
                size="sm"
              >
                Prev
              </Button>
              <Text variant="body">Page {currentPage} of {totalPages}</Text>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="person-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 10000,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="person-menu-header">
            <div className="person-menu-title">Tree Actions</div>
          </div>

          <div className="person-menu-items">
            <button className="person-menu-item" onClick={() => handleManageMembers(contextMenu.treeId)}>
              <Users size={15} />
              <span className="person-menu-text">Manage Members</span>
            </button>
            <button className="person-menu-item" onClick={() => handleViewTreeInfo(contextMenu.treeId)}>
              <CircleUserRound size={15} />
              <span className="person-menu-text">View Tree Info</span>
            </button>
            <button className="person-menu-item" onClick={() => handleSettings(contextMenu.treeId)}>
              <Settings size={15} />
              <span className="person-menu-text">Settings</span>
            </button>

            <button className="person-menu-item" onClick={() => handleShareTree()}>
              <GitCompareArrows size={15} />
              <span className="person-menu-text">Share Tree</span>
            </button>
            <button className="person-menu-item" onClick={() => handleDeleteTree(contextMenu.treeId)}>
              <User size={15} />
              <span className="person-menu-text" style={{ color: '#dc3545' }}>Delete Tree</span>
            </button>
          </div>
        </div>
      )}



      <TreeInfoModal
        isOpen={isTreeInfoModalOpen}
        onClose={() => setIsTreeInfoModalOpen(false)}
        tree={treeInfoData.tree}
        rootName={treeInfoData.rootName}
        creatorName={treeInfoData.creatorName}
      />

    </FlexContainer>
    </PageFrame>
  );
};

export default MyTreesPage;
