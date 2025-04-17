import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../App";
import Footer from "./Footer";
import "./styles/Home.css"; // Make sure this file contains the necessary styles

const sliderImages = [
  {
    image: "/slide1.jpg",
    title: "Low Interest Credit Cards",
    description: "Save more with our exclusive low interest rate cards."
  },
  {
    image: "/slide2.jpg",
    title: "Reward Programs",
    description: "Earn points on every purchase and redeem exciting rewards."
  },
  {
    image: "/slide3.jpg",
    title: "Instant Approvals",
    description: "Apply and get approved in just a few minutes."
  },
  {
    image: "/slide4.jpg",
    title: "Track Your Spending",
    description: "Smart tools to help you manage and monitor your expenses."
  },
  {
    image: "/slide5.jpg",
    title: "Mobile App Integration",
    description: "Seamless card management through our mobile app."
  }
];

const Home = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`app-container ${theme}`}>
      <nav className="navbar">
        <div className="nav-container">
          <button className="sidebar-hamburger" onClick={toggleSidebar}>☰</button>
          <h1 className="logo">Credit Card Solutions</h1>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/cards">Products</Link>
            <Link to="#">Features</Link>
            <Link to="#">About</Link>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="hero-section">
          <div className="hero-content">
            <h1>Welcome to Credit Card Solutions</h1>
            <p className="hero-subtitle">Your trusted partner for reliable credit card services and products</p>
            <div className="hero-buttons">
              <Link to="/cards" className="cta-primary">Explore Cards</Link>
              <Link to="/login" className="cta-secondary">Manage Account</Link>
            </div>
          </div>
        </header>

        {/* ===== Carousel Section ===== */}
        <section className="carousel-section">
          <div className="carousel-wrapper">
            {sliderImages.map((slide, index) => (
              <div
                key={index}
                className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
              >
                <img src={slide.image} alt={slide.title} className="carousel-image" />
                <div className="carousel-caption">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
            <div className="carousel-indicators">
              {sliderImages.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className={`features-section ${theme}`}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
  Our Features
</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Advanced Security</h3>
              <p>Your transactions are protected with military-grade encryption</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Flexible Options</h3>
              <p>Choose from premium, business, or student credit cards</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>24/7 Support</h3>
              <p>Our team is available round the clock to assist you</p>
            </div>
          </div>
        </section>

        <section className={`steps-section ${theme}`}>
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Apply Online</h3>
              <p>Complete our simple application in just 5 minutes</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Get Approved</h3>
              <p>Receive instant preliminary approval</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Start Using</h3>
              <p>Get your virtual card immediately while waiting for physical delivery</p>
            </div>
          </div>
        </section>
      </main>
            
            
            

      <Footer theme={theme} />
    </div>
  );
};

export default Home;
