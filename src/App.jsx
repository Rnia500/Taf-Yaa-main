import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ComponentDemo from './pages/ComponentDemo';
import BaseLayout from './pages/BaseLayout';
import ExportPage from './pages/ExportPage';
import SuggestionsPage from './pages/SuggestionsPage';
import NotificationsPage from './pages/NotificationsPage';
//import MergeRequestsPage from './pages/MergeRequestsPage';
//import MergeHistoryPage from './pages/MergeHistoryPage';
//import FamilyTreePage from './pages/FamilyTreePage';


function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<BaseLayout />} />
        <Route path="/demo" element={<ComponentDemo />} />
        <Route path="/base" element={<BaseLayout />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
       {/* <Route path="/merge-requests" element={<MergeRequestsPage />} />
        <Route path="/merge-history" element={<MergeHistoryPage />} />
        <Route path="/tree" element={<FamilyTreePage />} /> */}
        <Route path="/export" element={<ExportPage />} /> 
        


      </Routes>
    </Router>
  );
}

export default App;
