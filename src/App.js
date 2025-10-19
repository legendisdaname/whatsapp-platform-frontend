import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import Bots from './pages/Bots';
import Messages from './pages/Messages';
import Contacts from './pages/Contacts';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-logo">
              <span className="logo-icon">📱</span>
              WhatsApp Platform
            </h1>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/sessions" className="nav-link">Sessions</Link>
              </li>
              <li className="nav-item">
                <Link to="/contacts" className="nav-link">Contacts</Link>
              </li>
              <li className="nav-item">
                <Link to="/bots" className="nav-link">Bots</Link>
              </li>
              <li className="nav-item">
                <Link to="/messages" className="nav-link">Messages</Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/bots" element={<Bots />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

