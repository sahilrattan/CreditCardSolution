import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/CardDetailsPage.css";

const CardDetailsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const card = state?.card;

  if (!card) {
    return <div>Card not found</div>;
  }

  const handleApplyNow = () => {
    // Here you would typically redirect to the actual application form
    navigate(`/apply/${card.id}`, { state: { card } });
  };

  return (
    <div className="card-details-container">
      <div className="card-details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Cards
        </button>
        <h1>{card.name}</h1>
      </div>

      <div className="card-details-content">
        <div className="card-image-section">
          <img src={card.image} alt={card.name} className="detailed-card-image" />
          <button className="primary-apply-btn" onClick={handleApplyNow}>
            Apply Now
          </button>
        </div>

        <div className="card-info-section">
          <h2>Card Highlights</h2>
          <p className="card-highlight">{card.details}</p>
          <p>{card.info}</p>

          <div className="card-specs">
            <div className="spec-item">
              <span className="spec-label">APR</span>
              <span className="spec-value">{card.apr}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Annual Fee</span>
              <span className="spec-value">{card.annualFee}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Credit Score</span>
              <span className="spec-value">{card.creditScore}</span>
            </div>
          </div>

          <h3>Benefits</h3>
          <ul className="benefits-list">
            {card.benefits.map((benefit, index) => (
              <li key={index}>✓ {benefit}</li>
            ))}
          </ul>

          <div className="disclaimer">
            <p>
              * Rates and fees are subject to change. Please review the terms and conditions before applying.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsPage;