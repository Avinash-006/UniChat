import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './Components/Auth/AuthPage';
import MyDrive from './Components/MyDrive/MyDrive';
import Groups from './Components/Groups/Groups';
import Navbar from './Components/Navbar/Navbar';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('authSession'));
    if (session && session.expiry > new Date().getTime()) {
      setUser(session.user);
    } else {
      localStorage.removeItem('authSession');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authSession');
  };

  // Memoize the user object to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => user, [user?.id, user?.username]);

  return (
    <Router>
      <div>
        {user && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/mydrive" /> : <AuthPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/mydrive"
            element={
              user ? <MyDrive user={memoizedUser} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/groups"
            element={
              user ? <Groups user={memoizedUser} /> : <Navigate to="/" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;