import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './styles/SignUpForm.module.css';

const SignUpForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    age: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendConfirmationEmail = async (userData) => {
    try {
      const emailContent = `
        <h2>Welcome to Our Service, ${userData.firstName}!</h2>
        <p>Thank you for registering with us. Here are the details you provided:</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Field</th>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Value</th>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">First Name</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${userData.firstName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Last Name</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${userData.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Email</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${userData.email}</td>
          </tr>
          ${userData.phone ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Phone</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${userData.phone}</td>
          </tr>
          ` : ''}
          ${userData.dob ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Date of Birth</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(userData.dob).toLocaleDateString()}</td>
          </tr>
          ` : ''}
          ${userData.age ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Age</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${userData.age}</td>
          </tr>
          ` : ''}
          ${userData.address ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Address</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${userData.address}</td>
          </tr>
          ` : ''}
        </table>
        
        <p style="margin-top: 20px;">Please keep this information for your records.</p>
        <p>If you didn't request this signup, please contact our support team immediately.</p>
        <p>Best regards,<br/>The Support Team</p>
      `;

      await axios.post('http://localhost:5000/api/send-email', {
        to: userData.email,
        subject: 'Your Registration Details',
        html: emailContent
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the signup process if email fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanFormData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        dob: formData.dob || null,
        age: formData.age || null
      };

      const response = await axios.post(
        'http://localhost:5000/api/signup',
        cleanFormData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Send confirmation email
        await sendConfirmationEmail(cleanFormData);
        
        // Redirect to set password page
        navigate(`/set-password/${response.data.userId}`);
      }
    } catch (err) {
      const serverError = err.response?.data?.error;
      const networkError = err.message;

      setError(serverError || networkError || 'Registration failed');

      console.error('Signup error details:', {
        error: err,
        response: err.response
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <h2>Create Account</h2>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>First Name*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                minLength="2"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                minLength="2"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10,15}"
              title="10-15 digit phone number"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              max="120"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;