import { create } from 'zustand';
import AddChildModal from '../components/Add Relatives/Child/AddChildModal';

const useModalStore = create((set) => ({
  // Modal states for ComponentDemo
  modals: {
    componentModal: false,
    settingsModal: false,
    profileModal: false,
    addSpouseModal: false,
    addChildModal: false,
    addParentModal: false,
    treeModal: false,
    confirmationModal: false,
    editPerson: false,  // Added editPerson modal
    editMember: false,
    editMemberRole: false,
    banMemberModal: false,
    deletePerson: false,
    relationships: false,
    warningModal: false,
    pdfExportModal: false,
    infoModal: false,
    cascadeDetailsModal: false,
    joinModal: false,
    pendingRequestDetailsModal: false,
    grantMembershipModal: false,
  },

  // Modal data
  modalData: {
    addSpouseModal: {
      targetNodeId: null
    },
    addChildModal: {
      targetNodeId: null,
      parent1Id: null,
      parent2Id: null
    },
    confirmationModal: {
      title: '',
      message: '',
      onConfirm: null,
    },
    treeModal: {
      userId: null,
    },
    editPerson: {  // Added editPerson modal data
      personId: null,
    },
    editMember: {
      memberId: null,
    },
    editMemberRole: {
      member: null,
      treeId: null,
      onRoleUpdated: null,
    },
    banMemberModal: {
      member: null,
      treeId: null,
      onBanConfirmed: null,
    },
    deletePerson: {
      person: null,
      onDeleteComplete: null,
    },
    relationships: {
      personId: null,
    },
    warningModal: {
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
    },
    pdfExportModal: false,
    infoModal: {
      title: '',
      message: '',
      confirmText: 'Close',
    },
    cascadeDetailsModal: {
      person: null,
    },
    pendingRequestDetailsModal: {
      request: null,
      onRefresh: null,
    },
    grantMembershipModal: {
      person: null,
      treeId: null,
      treeName: null,
      onMembershipGranted: null,
    },
  },

  // Open a specific modal with optional data
  openModal: (modalName, data = {}) => {
    console.log('useModalStore openModal called:', modalName, data);
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
      modalData: { ...state.modalData, [modalName]: { ...state.modalData[modalName], ...data } }
    }));
  },

  // Close a specific modal
  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),

  // Toggle a specific modal
  toggleModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: !state.modals[modalName] }
  })),

  // Close all modals
  closeAllModals: () => set({
    modals: {
      componentModal: false,
      settingsModal: false,
      profileModal: false,
      addSpouseModal: false,
      addChildModal: false,
      addParentModal: false,
      treeModal: false,
      confirmationModal: false,
      editPerson: false,
      editMember: false,
      editMemberRole: false,
      banMemberModal: false,
      deletePerson: false,
      relationships: false,
      warningModal: false,
      pdfExportModal: false,
      infoModal: false,
      cascadeDetailsModal: false,
      joinModal: false,
      pendingRequestDetailsModal: false,
      grantMembershipModal: false,
    }
  }),
}));

export default useModalStore;
