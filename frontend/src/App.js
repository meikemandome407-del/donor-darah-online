import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterDonor from './pages/RegisterDonor';
import SearchDonor from './pages/SearchDonor';
import RequestBlood from './pages/RequestBlood';
import MyRequests from './pages/MyRequests';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterDonor />} />
        <Route path="/search" element={<SearchDonor />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/request" element={<PrivateRoute><RequestBlood /></PrivateRoute>} />
        <Route path="/my-requests" element={<PrivateRoute><MyRequests /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;