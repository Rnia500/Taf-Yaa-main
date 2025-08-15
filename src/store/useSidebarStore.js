// src/store/useSidebarStore.js
import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isSidebarOpen: false,
  
  activeProfileId: null, 
  
  
  openSidebar: (personId) => set({ isSidebarOpen: true, activeProfileId: personId }),
  

  closeSidebar: () => set({ isSidebarOpen: false, activeProfileId: null }),
}));

export default useSidebarStore;