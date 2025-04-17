import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./styles/SetPassword.css";

const SetPassword = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [validations, setValidations] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });

  useEffect(() => {
    setValidations({
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasMinLength: password.length >= 8,
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("Invalid request. Missing user ID.");
      return;
    }

    if (!Object.values(validations).every((v) => v)) {
      setError("Password doesn't meet all requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending:", { userId, password });

      const response = await axios.post("http://localhost:5000/api/set-password", {
        userId,
        password,
      });

      if (response.status === 200 || response.data.success) {
        setSuccess("Password set successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to set password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-password-page">
      <div className="set-password-container">
        <h2>Set Your Password</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password*</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password*</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="password-requirements">
            <h4>PASSWORD REQUIREMENTS:</h4>
            <ul>
              <li className={validations.hasLowercase ? "valid" : "invalid"}>
                {validations.hasLowercase ? "✓" : "✗"} Lowercase letter
              </li>
              <li className={validations.hasUppercase ? "valid" : "invalid"}>
                {validations.hasUppercase ? "✓" : "✗"} Uppercase letter
              </li>
              <li className={validations.hasNumber ? "valid" : "invalid"}>
                {validations.hasNumber ? "✓" : "✗"} Number
              </li>
              <li className={validations.hasSpecialChar ? "valid" : "invalid"}>
                {validations.hasSpecialChar ? "✓" : "✗"} Special character
              </li>
              <li className={validations.hasMinLength ? "valid" : "invalid"}>
                {validations.hasMinLength ? "✓" : "✗"} At least 8 characters
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={
              loading ||
              !Object.values(validations).every((v) => v) ||
              password !== confirmPassword
            }
          >
            {loading ? "Setting Password..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
