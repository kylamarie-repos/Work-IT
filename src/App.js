import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {  onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import Content from "./components/Content";
import Jobs from "./components/Jobs";
import Companies from "./components/Companies";
import JobListings from "./components/JobListings";
import ApplicationForm from './components/ApplicationForm';
import Applied from './components/Applied';
import LoginSignup from "./components/LoginSignup";
import EmployerLoginSignup from "./components/EmployerLoginSignup";
import EmployerLayout from './components/EmployerLayout';

import UserLayout from './components/UserLayout';

// import Footer from "./components/Footer";
import { auth } from "./components/firebase"; // Import auth from firebase config
import "./style.css";

// import AddField from "./components/AddfieldsNumber";

export default function App() {
  const [user, setUser] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false); // Set loading to false once auth state is checked
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (employer) => {
      setEmployer(employer || null);
      setLoading(false); // Set loading to false once auth state is checked
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="d-flex justify-content-center">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>;
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/Jobs" element={<Jobs />} />
        <Route path="/Companies" element={<Companies />} />
        <Route path="/job-listings" element={<JobListings />} />
        <Route path="/apply/:id" element={<ApplicationForm />} />
        <Route path="/Applied" element={<Applied />} />
        <Route path="/LoginSignup" element={!user ? <LoginSignup /> : <Navigate to="/user/Dashboard" />} />
        <Route path="/EmployerLoginSignup" element={!user ? <EmployerLoginSignup /> : <Navigate to="/employer/Dashboard" />} />
        <Route path="/employer/*" element={user ? <EmployerLayout /> : <Navigate to="/EmployerLoginSignup" />} />

        <Route path="/LoginSignup" element={!employer ? <LoginSignup /> : <Navigate to="/user/Dashboard" />} />
        <Route path="/user/*" element={user ? <UserLayout /> : <Navigate to="/LoginSignup" />} />

        {/* <Route path="/AddField" element={<AddField />} /> */}
      </Routes>
      {/* <Footer /> */}
    </Router>
  );
}
