import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';

function App() {
  const isLoginOrSignup = () => {
    const currentPath = window.location.pathname;
    return currentPath === '/' || currentPath === '/login' || currentPath === '/signup';
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {!isLoginOrSignup() && <Navbar />}
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
