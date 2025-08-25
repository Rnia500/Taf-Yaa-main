import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ComponentDemo from './pages/ComponentDemo';
import BaseLayout from './pages/BaseLayout';
import ExportPage from './pages/ExportPage';
import AdminNavbar from './components/navbar/AdminNavbar';

function App() {
  return (
    <Router>
      <BaseLayout />
      <AdminNavbar />
      <Routes>
        <Route path="/demo" element={<ComponentDemo />} />
        <Route path="/base" element={<BaseLayout />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="*" element={<div style={{padding:20}}>Welcome</div>} />
      </Routes>
    </Router>
  );
}

export default App;
