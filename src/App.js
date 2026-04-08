import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Skills from './pages/Skills';
import AssessmentsPage from './pages/Assessments';
import Resume from './pages/Resume';
import SupportPage from './pages/SupportPage';

import InterviewPrep from "./pages/InterviewPrep";

//  Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem("access");
};


//  Protect pages if user is not logged in
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};


//  Redirect logged-in users away from login/register/landing pages
const GuestRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/home" /> : children;
};


function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>

        <Route
          path="/"
          element={
            <GuestRoute>
              <LandingPage />
            </GuestRoute>
          }
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <Skills />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <AssessmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Resume />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route path="/interview" element={<InterviewPrep />} />

      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
