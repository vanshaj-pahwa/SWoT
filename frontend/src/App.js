import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import ViewDetails from './components/ViewDetails/ViewDetails';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const PrivateRoute = ({ path, element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/home"
              element={<PrivateRoute path="/home" element={<Home />} />}
            />
            <Route
              path="/details"
              element={<PrivateRoute path="/details" element={<ViewDetails />} />}
            />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
