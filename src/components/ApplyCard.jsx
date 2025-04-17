import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/CreditCardPage.css";
import platinumRewards from "../assets/Standard-Chartered-platinum-rewards.avif";
import goldCard from "../assets/gold-card.jpg";
import studentCard from "../assets/student-card.jpg";
import businessCard from "../assets/buisness-card.jpg";
import travelCard from "../assets/travel-card.jpg";
import eliteCard from "../assets/elite-card.jpg";

const creditCards = [
  {
    id: 1,
    name: "Platinum Rewards Card",
    image: platinumRewards,
    details: "Earn 5x reward points on every purchase.",
    info: "0% APR for the first 12 months.",
    benefits: [
      "5x points on all purchases",
      "No annual fee first year",
      "Free airport lounge access",
      "24/7 concierge service"
    ],
    apr: "15.99% - 22.99% variable",
    annualFee: "$95 (waived first year)",
    creditScore: "Good to Excellent"
  },
  {
    id: 2,
    name: "Gold Cashback Card",
    image: goldCard,
    details: "5% cashback on dining and travel expenses.",
    info: "Annual fee waived for the first year.",
    benefits: [
      "5% cashback on dining/travel",
      "2% cashback on all other purchases",
      "No foreign transaction fees",
      "Travel insurance included"
    ],
    apr: "14.99% - 21.99% variable",
    annualFee: "$0 first year, then $75",
    creditScore: "Good"
  },
  {
    id: 3,
    name: "Student Credit Card",
    image: studentCard,
    details: "Special offers for students with no credit history.",
    info: "Low annual fee and no foreign transaction fees.",
    benefits: [
      "Build credit history",
      "1% cashback on all purchases",
      "No credit history required",
      "Free credit score monitoring"
    ],
    apr: "16.99% - 24.99% variable",
    annualFee: "$25",
    creditScore: "Limited/Bad"
  },
  {
    id: 4,
    name: "Business Advantage Card",
    image: businessCard,
    details: "Designed for small businesses with high credit limits.",
    info: "Enjoy 2% cashback on office supplies and fuel.",
    benefits: [
      "Separate business expenses",
      "Employee cards with limits",
      "Quarterly spending reports",
      "Double warranty protection"
    ],
    apr: "13.99% - 19.99% variable",
    annualFee: "$125",
    creditScore: "Excellent"
  },
  {
    id: 5,
    name: "Travel Explorer Card",
    image: travelCard,
    details: "Earn miles for every dollar spent.",
    info: "No blackout dates on airline tickets.",
    benefits: [
      "2 miles per $1 spent",
      "Free checked bags",
      "TSA PreCheck credit",
      "No foreign transaction fees"
    ],
    apr: "17.99% - 25.99% variable",
    annualFee: "$99",
    creditScore: "Good to Excellent"
  },
  {
    id: 6,
    name: "Premium Elite Card",
    image: eliteCard,
    details: "Exclusive concierge services and luxury benefits.",
    info: "Priority airport lounge access worldwide.",
    benefits: [
      "Priority Pass membership",
      "Hotel elite status",
      "Travel credits",
      "Premium customer service"
    ],
    apr: "16.99% - 23.99% variable",
    annualFee: "$450",
    creditScore: "Excellent"
  }
];

const ApplyCard = () => {
  const navigate = useNavigate();

  const handleApplyClick = (card) => {
    navigate(`/cards/${card.id}`, { state: { card } });
  };

  return (
    <div className="credit-card-container">
      <header className="page-header">
        <h1>Welcome to Credit Card Solutions</h1>
        <p>Your trusted partner for reliable credit card services and products</p>
        <div className="header-buttons">
          <button className="header-btn active">Explore Cards</button>
          <button className="header-btn">Manage Account</button>
        </div>
      </header>
      
      <div className="main-content">
        <h2>Choose Your Credit Card</h2>
        <p className="subtitle">Compare features and benefits to find the perfect card for your needs</p>
        
        <div className="card-grid">
          {creditCards.map((card) => (
            <div key={card.id} className="credit-card">
              <div className="card-header">
                <h3>{card.name}</h3>
                {card.id === 1 && <div className="card-badge">Popular</div>}
              </div>
              <img src={card.image} alt={card.name} className="card-image" />
              <div className="card-details">
                <p className="highlight">{card.details}</p>
                <p>{card.info}</p>
                <ul className="benefits-preview">
                  {card.benefits.slice(0, 2).map((benefit, index) => (
                    <li key={index}>✓ {benefit}</li>
                  ))}
                </ul>
                <div className="card-specs">
                  <p><strong>APR:</strong> {card.apr}</p>
                  <p><strong>Annual Fee:</strong> {card.annualFee}</p>
                  <p><strong>Credit Score:</strong> {card.creditScore}</p>
                </div>
              </div>
              <button 
                className="apply-btn"
                onClick={() => handleApplyClick(card)}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplyCard;