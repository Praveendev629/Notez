import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import IntroAnimation from './components/IntroAnimation';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NoteEditorPage from './pages/NoteEditorPage';
import TodoEditorPage from './pages/TodoEditorPage';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            {showIntro && <IntroAnimation onDone={() => setShowIntro(false)} />}
            <Routes>
              <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
              <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
              <Route path="/" element={<Navigate to="/app" replace />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="notes/new" element={<NoteEditorPage />} />
                <Route path="notes/:id" element={<NoteEditorPage />} />
                <Route path="todos/new" element={<TodoEditorPage />} />
                <Route path="todos/:id" element={<TodoEditorPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}