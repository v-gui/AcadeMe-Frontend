import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import ProjectView from './pages/ProjectView'; 
import StudentProfileView from './pages/StudentProfileView';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />        
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
        
        {/* Rotas de Visualizações */}
        <Route path="/project/:id" element={<ProjectView />} />
        <Route path="/student/:id" element={<StudentProfileView />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();

