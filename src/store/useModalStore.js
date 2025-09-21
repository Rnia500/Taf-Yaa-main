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
    addTreeModal: false,
    confirmationModal: false,
    editPerson: false,  // Added editPerson modal
    deletePerson: false,
    warningModal: false,
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
    addTree: {
      userId: null,
    },
    editPerson: {  // Added editPerson modal data
      personId: null,
    },
    deletePerson: {
      person: null,
      onDeleteComplete: null,
    },
<<<<<<< HEAD
=======
    warningModal: {
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
    }
>>>>>>> cbfa230e635598c0f5d2123d4498029f3118072d
  },
  
  // Open a specific modal with optional data
  openModal: (modalName, data = {}) => set((state) => ({
    modals: { ...state.modals, [modalName]: true },
    modalData: { ...state.modalData, [modalName]: { ...state.modalData[modalName], ...data } }
  })),
  
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
      addTreeModal: false,
      confirmationModal: false,
      editPerson: false,  // Added editPerson to closeAllModals
      deletePerson: false,
      warningModal: false,
    }
  }),
}));

export default useModalStore;
