import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {  onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import Content from "./components/Content";
import Companies from "./components/Companies";
import JobListings from "./components/JobListings";
import LoginSignup from "./components/LoginSignup";
import ProfilePage from "./components/ProfilePage";
import EmployerLoginSignup from "./components/EmployerLoginSignup";
import EmployerLayout from './components/EmployerLayout';
// import Footer from "./components/Footer";
import { auth } from "./components/firebase"; // Import auth from firebase config
import "./style.css";

// import AddField from "./components/AddfieldsNumber";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false); // Set loading to false once auth state is checked
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>; // Display a loading indicator while checking auth state
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/Companies" element={<Companies />} />
        <Route path="/job-listings" element={<JobListings />} />
        <Route path="/LoginSignup" element={!user ? <LoginSignup /> : <Navigate to="/ProfilePage" />} />
        <Route path="/ProfilePage" element={user ? <ProfilePage /> : <Navigate to="/LoginSignup" />} />
        <Route path="/EmployerLoginSignup" element={!user ? <EmployerLoginSignup /> : <Navigate to="/employer/Dashboard" />} />
        <Route path="/employer/*" element={user ? <EmployerLayout /> : <Navigate to="/EmployerLoginSignup" />} />

        {/* <Route path="/AddField" element={<AddField />} /> */}
      </Routes>
      {/* <Footer /> */}
    </Router>
  );
}
