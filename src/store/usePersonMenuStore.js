// src/store/usePersonMenuStore.js
import { create } from 'zustand';

const usePersonMenuStore = create((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  targetNodeId: null,
  targetNodeName: null,
  
  actions: {
    openMenu: (nodeId, nodeName, position) => set({ isOpen: true, targetNodeId: nodeId, targetNodeName: nodeName, position }),
    closeMenu: () => set({ isOpen: false, targetNodeId: null, targetNodeName: null }),
  },
}));

export default usePersonMenuStore;