// src/store/usePersonMenuStore.js
import { create } from 'zustand';

const usePersonMenuStore = create((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  targetNodeId: null,
  targetNodeName: null,
  targetPerson: null, 

  actions: {
    openMenu: (nodeId, nodeName, position, person) =>
      set({
        isOpen: true,
        targetNodeId: nodeId,
        targetNodeName: nodeName,
        position,
        targetPerson: person, 
      }),
    closeMenu: () =>
      set({
        isOpen: false,
        targetNodeId: null,
        targetNodeName: null,
        targetPerson: null,
      }),
  },
}));

export default usePersonMenuStore;
