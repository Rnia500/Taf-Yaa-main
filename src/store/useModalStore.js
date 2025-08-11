import { create } from 'zustand';

const useModalStore = create((set) => ({
  // Modal states for ComponentDemo
  modals: {
    componentModal: false,
    settingsModal: false,
    profileModal: false,
  },
  
  // Open a specific modal
  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
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
    }
  }),
}));

export default useModalStore;
