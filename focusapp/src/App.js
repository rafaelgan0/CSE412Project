// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserLogin from './pages/UserLogin';
import CreateUser from './pages/CreateUser';
import Main from './pages/MainPage';
import Timer from './pages/Timer';
import SessionInfo from './pages/SessionInfo';
import HomePage from './pages/HomePage';

import './App.css';

const App = () => {
  return (
    <div >
      {/* <nav>
        <Link to="/">User Login</Link> {' | '}
        <Link to="/create-user">Create User</Link>
      </nav> */}

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/main-page/:userId" element={<Main />} />
        <Route path="/timer/:userId/:focusTime" element={<Timer />} />
        <Route path="/session-info/:userId/:focusTime" element={<SessionInfo />} />
      </Routes>
    </div>
  );
};

export default App;
