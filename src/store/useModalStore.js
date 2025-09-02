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
    confirmationModal: false,  
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
    confirmationModal: {        // <-- add this
      title: '',
      message: '',
      onConfirm: null,
    },
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
      confirmationModal: false
    }
  }),
}));

export default useModalStore;
