import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Demo credentials check
    if (formData.email === 'policyholder@demo.com' && formData.password === 'demo123') {
      navigate('/policyholder/dashboard');
      return;
    }

    if (formData.email === 'employee@demo.com' && formData.password === 'demo123') {
      navigate('/employee/dashboard');
      return;
    }

    if (formData.email === 'admin@demo.com' && formData.password === 'demo123') {
      navigate('/admin/dashboard');
      return;
    }

    try {
      // Attempt to authenticate with backend
      const response = await authService.login(formData.email, formData.password);
      const { access_token, user } = response.data;
      
      // Store the token in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Navigate based on user role
      switch(user.role) {
        case 'policyholder':
          navigate('/policyholder/dashboard');
          break;
        case 'employee':
          navigate('/employee/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          setError('Invalid user role');
      }
    } catch (error) {
      setError('Invalid credentials. Please try again or use demo credentials.');
    }
  };

  const useDemo = () => {
    setFormData({
      email: 'policyholder@demo.com',
      password: 'demo123'
    });
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>PlutusAI</h1>
        <h2>Sign in to your account</h2>
        <p className="subtitle">Insurance Fraud Detection System</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="sign-in-button">
            Sign in
          </button>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <button type="button" className="demo-button" onClick={useDemo}>
            Use Demo Credentials
          </button>

          <div className="demo-credentials">
            <p>Demo Credentials:</p>
            <p>Policy Holder: policyholder@demo.com / demo123</p>
            <p>Bank Employee: employee@demo.com / demo123</p>
            <p>Admin: admin@demo.com / demo123</p>
          </div>

          <p className="register-link">
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;