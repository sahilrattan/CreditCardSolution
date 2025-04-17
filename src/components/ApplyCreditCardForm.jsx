import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ApplicationPDF from "./ApplicationPDF";
import "./styles/ApplyCreditCardForm.css";

const ApplyCreditCardForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const card = state?.card;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    residenceType: "",
    employment: "",
    company: "",
    designation: "",
    income: "",
    pan: "",
    aadhaar: "",
    cardType: card?.name || ""
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendConfirmationEmail = async (applicationData) => {
    try {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2c3e50; text-align: center;">Credit Card Application Received</h2>
          <p style="font-size: 16px; line-height: 1.6;">Dear ${applicationData.fullName},</p>
          <p>Thank you for applying for our ${applicationData.cardType}. We've received your application with the following details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <th style="text-align: left; padding: 12px; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">Field</th>
              <th style="text-align: left; padding: 12px; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">Value</th>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Application ID</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.id}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Card Type</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.cardType}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Full Name</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Email</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.email}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Phone</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Date of Birth</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${new Date(applicationData.dob).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Gender</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.gender}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Marital Status</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.maritalStatus}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Address</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.address}, ${applicationData.city}, ${applicationData.state} - ${applicationData.pincode}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Residence Type</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.residenceType}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Employment Type</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.employment}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Company Name</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.company}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Designation</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.designation}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Annual Income</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">₹${parseFloat(applicationData.income).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">PAN Number</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.pan}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Aadhaar Number</td>
              <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${applicationData.aadhaar}</td>
            </tr>
          </table>
          
          <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Your application is currently under review. We'll notify you once a decision has been made.
          </p>
          
          <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">
            Best regards,<br/>The Credit Card Team
          </p>
        </div>
      `;

      // In a real app, you would call your backend API to send the email
      const response = await fetch("http://localhost:5000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: applicationData.email,
          subject: `Your ${applicationData.cardType} Application Confirmation`,
          html: emailContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send confirmation email");
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submissionData = {
        cardType: formData.cardType,
        personalInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
          maritalStatus: formData.maritalStatus
        },
        addressInfo: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          residenceType: formData.residenceType
        },
        financialInfo: {
          employment: formData.employment,
          company: formData.company,
          designation: formData.designation,
          income: parseFloat(formData.income) || 0,
          pan: formData.pan.toUpperCase(),
          aadhaar: formData.aadhaar
        }
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = {
        applicationId: `APP-${Math.floor(Math.random() * 1000000)}`,
        status: "pending"
      };

      const completeApplicationData = {
        ...formData,
        id: mockResponse.applicationId,
        status: mockResponse.status
      };

      setSubmittedData(completeApplicationData);
      
      // Send confirmation email
      await sendConfirmationEmail(completeApplicationData);

    } catch (err) {
      setError(err.message || "An error occurred while submitting your application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Confirmation = () => (
    <div className="confirmation">
      <h3>Application Submitted Successfully!</h3>
      <div className="preview-section">
        <p><strong>Reference ID:</strong> {submittedData.id}</p>
        <p><strong>Card Type:</strong> {submittedData.cardType}</p>
        <p><strong>Name:</strong> {submittedData.fullName}</p>
        <p><strong>Status:</strong> {submittedData.status}</p>
      </div>
      
      <div className="confirmation-actions">
        <PDFDownloadLink
          document={<ApplicationPDF data={submittedData} />}
          fileName={`${submittedData.cardType.replace(/\s+/g, '_')}_Application_${submittedData.id}.pdf`}
          className="download-btn"
        >
          {({ loading }) => (loading ? 'Preparing PDF...' : 'Download Application PDF')}
        </PDFDownloadLink>
        
        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
      
      <p className="email-notice">
        A confirmation email has been sent to {submittedData.email}
      </p>
    </div>
  );

  return (
    <div className="form-container">
      <h2>Apply for {card?.name || "a Credit Card"}</h2>

      {!submittedData ? (
        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Full Name*:</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email*:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number*:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                title="10 digit phone number"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth*:</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="form-group">
              <label>Gender*:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Marital Status*:</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="form-section">
            <h3>Address Information</h3>
            <div className="form-group">
              <label>Address*:</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>City*:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>State*:</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Pincode*:</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                pattern="[0-9]{6}"
                title="6 digit pincode"
              />
            </div>
            <div className="form-group">
              <label>Residence Type*:</label>
              <select
                name="residenceType"
                value={formData.residenceType}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Owned">Owned</option>
                <option value="Rented">Rented</option>
                <option value="Parental">Parental</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="form-section">
            <h3>Financial Information</h3>
            <div className="form-group">
              <label>Employment Type*:</label>
              <select
                name="employment"
                value={formData.employment}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Company Name*:</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Designation*:</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Annual Income (₹)*:</label>
              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>PAN Card Number*:</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                required
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Enter valid PAN (e.g., ABCDE1234F)"
              />
            </div>
            <div className="form-group">
              <label>Aadhaar Number*:</label>
              <input
                type="text"
                name="aadhaar"
                value={formData.aadhaar}
                onChange={handleChange}
                required
                pattern="[0-9]{12}"
                title="12 digit Aadhaar number"
              />
            </div>
            {!card && (
              <div className="form-group">
                <label>Select Credit Card*:</label>
                <select
                  name="cardType"
                  value={formData.cardType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Platinum Rewards Card">Platinum Rewards Card</option>
                  <option value="Gold Credit Card">Gold Credit Card</option>
                  <option value="Silver Credit Card">Silver Credit Card</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button type="button" onClick={() => setError(null)}>Try Again</button>
            </div>
          )}

          <div className="form-submit">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      ) : (
        <Confirmation />
      )}
    </div>
  );
};

export default ApplyCreditCardForm;