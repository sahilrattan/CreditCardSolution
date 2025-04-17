import React from "react";
import "./styles/Footer.css"; // Ensure correct import

const Footer = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "9805955466";
    const message = "Hello, I'm interested in your services. Please contact me.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Quick Links Section */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Products</a></li>
            <li><a href="#" onClick={handleWhatsAppClick}>Contact</a></li>
            <li><a href="#">About Us</a></li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </div>

        {/* Company Info Section */}
        <div className="footer-section">
          <h3>Company</h3>
          <p>© 2025 Credit Card Sales and Maintenance Company, India. All rights reserved.</p>
          {/* You could also add a separate WhatsApp button here if needed */}
          <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
            Contact via WhatsApp
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;