import React, { useState } from 'react';
import axios from 'axios';
import './AuthPage.css';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    identifier: '',
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'username') {
      setUsernameSuggestions([]);
    }
  };

  const fetchUsernameSuggestions = async (baseUsername) => {
    try {
      const response = await axios.get('https://randomuser.me/api/?results=3');
      const users = response.data.results;
      const suggestions = users.map((user, index) => {
        const randomNum = Math.floor(Math.random() * 1000);
        return `${baseUsername}${randomNum}${index}`;
      });
      setUsernameSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching username suggestions:', error);
      setUsernameSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, username: suggestion });
    setUsernameSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setUsernameSuggestions([]);

    try {
      if (isLogin) {
        if (!formData.identifier) {
          setMessage('Please provide a username or email');
          setLoading(false);
          return;
        }
        if (!formData.password) {
          setMessage('Password is required');
          setLoading(false);
          return;
        }

        const isEmail = formData.identifier.includes('@');
        const loginData = {
          username: isEmail ? null : formData.identifier,
          email: isEmail ? formData.identifier : null,
          password: formData.password
        };

        console.log('Attempting login with:', loginData);
        const response = await axios.post('http://192.168.97.20:8080/api/users/login', loginData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Raw login response:', response);
        const user = response.data;
        console.log('Parsed user data:', user);

        if (user && user.id && user.username) {
          const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
          const sessionData = {
            user: { id: user.id, username: user.username },
            expiry
          };
          console.log('Saving to localStorage:', sessionData);
          localStorage.setItem('authSession', JSON.stringify(sessionData));
          onLogin({ id: user.id, username: user.username });
          setMessage('Login successful');
        } else {
          setMessage('Invalid login response: User data incomplete');
          console.error('User object missing required fields:', user);
        }
      } else {
        if (!formData.username || !formData.email || !formData.password) {
          setMessage('All fields are required for registration');
          setLoading(false);
          return;
        }

        console.log('Attempting registration with:', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        const response = await axios.post('http://192.168.97.20:8080/api/users/add', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        console.log('Registration response:', response.data);
        setMessage(response.data);
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Login/Register error:', error);
      const errorMessage = error.response?.data || 
                          error.response?.data?.message || 
                          error.message || 
                          'An error occurred';
      
      if (error.response?.status === 409) {
        if (errorMessage === 'Username already taken') {
          setMessage('Username is already taken');
          fetchUsernameSuggestions(formData.username);
        } else if (errorMessage === 'Email already taken') {
          setMessage('Email is already taken');
        } else {
          setMessage(errorMessage);
        }
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setUsernameSuggestions([]);
    setFormData({ identifier: '', username: '', email: '', password: '' });
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${isLogin ? 'login' : 'register'}`}>
        <h2 className="logo">MyDrive</h2>
        
        <div className="form-container">
          <form onSubmit={handleSubmit} className="auth-form">
            <h3>{isLogin ? 'Login' : 'Register'}</h3>
            
            {isLogin ? (
              <div className="input-group">
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder="Username or Email"
                  required
                />
              </div>
            ) : (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    required
                  />
                </div>
                {usernameSuggestions.length > 0 && (
                  <div className="suggestions">
                    <p>Suggested usernames:</p>
                    <ul>
                      {usernameSuggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <div className="loader"></div> : (isLogin ? 'Login' : 'Register')}
            </button>

            {message && <p className="message">{message}</p>}
          </form>
        </div>

        <button className="toggle-btn" onClick={toggleForm}>
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;