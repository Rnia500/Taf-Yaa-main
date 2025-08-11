import { useState, useEffect } from 'react';

// Mock user data - replace with your actual auth system
const mockUserData = {
  id: 1,
  name: 'John Doe',
  role: 'admin', // Change this to test different roles: 'admin', 'moderator', 'editor', 'viewer', or null for unauthenticated
  permissions: ['read', 'write', 'delete', 'moderate']
};

export const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user role from auth system
    // Replace this with your actual auth logic
    const fetchUserRole = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In real app, this would come from your auth context/API
        const user = mockUserData;
        setUserRole(user?.role || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { userRole, loading };
};

// Helper function to get role-based component
export const getNavbarForRole = (role) => {
  const navbarMap = {
    'admin': 'AdminNavbar',
    'moderator': 'ModeratorNavbar',
    'editor': 'EditorNavbar',
    'viewer': 'ViewerNavbar',
    'default': 'DefaultNavbar'
  };
  
  return navbarMap[role] || 'DefaultNavbar';
};
