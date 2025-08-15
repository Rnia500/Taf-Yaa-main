// src/store/usePersonMenuStore.js
import { create } from 'zustand';

const usePersonMenuStore = create((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  targetNodeId: null,
  
  actions: {
    openMenu: (nodeId, position) => set({ isOpen: true, targetNodeId: nodeId, position }),
    closeMenu: () => set({ isOpen: false, targetNodeId: null }),
  },
}));

export default usePersonMenuStore;