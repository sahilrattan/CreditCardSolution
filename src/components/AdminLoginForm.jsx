// src/components/AdminLoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/LoginForm.module.css";

const AdminLoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (email === "Admin123@gmail.com" && password === "Admin@1234") {
      setSuccess("Admin login successful! Redirecting...");
      setError("");
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } else {
      setError("Invalid admin credentials.");
      setSuccess("");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Admin Login</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter admin email"
              className={styles.formInput}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter admin password"
              className={styles.formInput}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginForm;
