import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  // Sidebar open/close state
  isSidebarOpen: false,
  
  // Toggle sidebar open/close
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // Set sidebar open state
  openSidebar: () => set({ isSidebarOpen: true }),
  
  // Set sidebar closed state
  closeSidebar: () => set({ isSidebarOpen: false }),
  
  // Set sidebar state explicitly
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));

export default useSidebarStore;
