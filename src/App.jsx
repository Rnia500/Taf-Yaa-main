import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/Colors.css'; 
import ComponentDemo from './pages/ComponentDemo';
import BaseLayout from './pages/BaseLayout';


function App() {
  return (
    // <Router>
    //   <Link to="/demo">View Components Demo</Link>
    //   <Spacer size='10px'></Spacer>
    //   <Link to="/base">View Base Layout</Link>
    //   <Routes>
    //     <Route path="/demo" element={<ComponentDemo />} />
    //     <Route path="/base" element={<BaseLayout />} />
    //   </Routes>
    // </Router>

    <BaseLayout />
  );
}

export default App;
