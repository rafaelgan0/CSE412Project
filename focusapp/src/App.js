// src/App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import UserLogin from './pages/UserLogin';
import CreateUser from './pages/CreateUser';
import Main from './pages/MainPage';

const App = () => {
  return (
    <div>
      {/* <nav>
        <Link to="/">User Login</Link> {' | '}
        <Link to="/create-user">Create User</Link>
      </nav> */}

      <Routes>
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </div>
  );
};

export default App;
