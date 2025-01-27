import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectGallery from './pages/ProjectGallery';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import ProjectCreate from './pages/ProjectCreate';
import ProjectBrowser from './pages/ProjectBrowser';
import WebFont from 'webfontloader';
import NotFound from './pages/NotFound';
import './styles/global.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

WebFont.load({
  google: {
    families: ['Roboto:400,500,700']
  }
});

const theme = createTheme();

function NavbarWrapper() {
  const location = useLocation();
  // Hide Navbar on the landing page
  if (location.pathname === '/') {
    return null;
  }
  return <Navbar />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<div>Loading Gallery...</div>}>
          <Router>
            <div className="app">
              <Navbar />
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <RequireAuth>
                      {(user) => user ? <Navigate to="/dashboard" /> : <LandingPage />}
                    </RequireAuth>
                  } 
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/projects" element={<ProjectGallery />} />
                <Route path="/projects/create" element={<ProjectCreate />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:id/edit" element={<ProjectEdit />} />
                <Route path="/projects/browser" element={<ProjectBrowser />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <RequireAuth>
                      {(user) => user ? <Dashboard /> : <Navigate to="/" />}
                    </RequireAuth>
                  } 
                />
                <Route 
                  path="/create-project" 
                  element={
                    <RequireAuth>
                      {(user) => user ? <ProjectCreate /> : <Navigate to="/login" />}
                    </RequireAuth>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
}

// 认证路由包装器组件
function RequireAuth({ children }) {
  const { user } = useAuth();
  return children(user);
}

export default App;
