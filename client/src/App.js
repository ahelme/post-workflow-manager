import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import StudentForm from './pages/StudentForm';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Placeholder for future routes */}
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Projects />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/projects/new"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProjectForm />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/projects/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProjectDetail />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/projects/:id/edit"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProjectForm />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/students"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Students />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/students/new"
                  element={
                    <ProtectedRoute roles={['admin', 'producer']}>
                      <Layout>
                        <StudentForm />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/students/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <StudentDetail />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/students/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin', 'producer']}>
                      <Layout>
                        <StudentForm />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/backup"
                  element={
                    <ProtectedRoute roles={['admin', 'producer']}>
                      <Layout>
                        <div className="p-6">
                          <h1 className="text-2xl font-bold text-gray-900">Backup Management</h1>
                          <p className="mt-2 text-gray-600">Backup page coming soon...</p>
                        </div>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <Layout>
                        <div className="p-6">
                          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                          <p className="mt-2 text-gray-600">Settings page coming soon...</p>
                        </div>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;