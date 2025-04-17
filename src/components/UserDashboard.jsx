import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles/UserDashboard.module.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Mock user data
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    memberSince: "January 2022",
    creditScore: 745,
    totalBalance: 12500.50,
    paymentDue: 850.00,
    dueDate: "15 Nov 2023",
    rewardPoints: 12500,
    cards: [
      {
        id: 1,
        type: "Platinum",
        issuer: "VISA",
        lastFour: "4532",
        cardHolder: "ALEX JOHNSON",
        expiryDate: "05/25",
        availableBalance: 8500.00,
        totalLimit: 15000.00,
        color: "linear-gradient(135deg, #434343, #000000)",
        transactions: 12
      },
      {
        id: 2,
        type: "Gold",
        issuer: "MasterCard",
        lastFour: "7821",
        cardHolder: "ALEX JOHNSON",
        expiryDate: "08/24",
        availableBalance: 4000.50,
        totalLimit: 8000.00,
        color: "linear-gradient(135deg, #FFD700, #D4AF37)",
        transactions: 8
      }
    ],
    recentTransactions: [
      {
        id: 1,
        date: "05 Nov 2023",
        description: "Amazon Online Store",
        cardLastFour: "4532",
        amount: 125.99,
        type: "debit",
        status: "completed",
        category: "shopping"
      },
      {
        id: 2,
        date: "03 Nov 2023",
        description: "Starbucks Coffee",
        cardLastFour: "7821",
        amount: 5.75,
        type: "debit",
        status: "completed",
        category: "food"
      },
      {
        id: 3,
        date: "01 Nov 2023",
        description: "Salary Deposit",
        cardLastFour: "4532",
        amount: 3500.00,
        type: "credit",
        status: "completed",
        category: "income"
      },
      {
        id: 4,
        date: "28 Oct 2023",
        description: "Netflix Subscription",
        cardLastFour: "4532",
        amount: 15.99,
        type: "debit",
        status: "pending",
        category: "entertainment"
      },
      {
        id: 5,
        date: "25 Oct 2023",
        description: "Shell Gas Station",
        cardLastFour: "7821",
        amount: 45.20,
        type: "debit",
        status: "completed",
        category: "transport"
      }
    ]
  });


  const handleSubmit = (e) => {
    useNavigate('/ApplyCard');
    e.preventDefault();
  }

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header Section */}
      <header className={styles.dashboardHeader}>
        <div>
          <h1>Welcome back, {userData.name}!</h1>
          <p className={styles.welcomeMessage}>Here's your financial overview</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={`${styles.summaryCard} ${styles.balanceCard}`}>
          <h3>Total Balance</h3>
          <p className={styles.amount}>${userData.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <div className={styles.cardFooter}>
            <span>Across all cards</span>
            <Link to="/cards" className={styles.viewLink}>View Details</Link>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.dueCard}`}>
          <h3>Payment Due</h3>
          <p className={styles.amount}>${userData.paymentDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <div className={styles.cardFooter}>
            <span>Due by {userData.dueDate}</span>
            <Link to="/payments" className={styles.payButton}>Pay Now</Link>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.rewardsCard}`}>
          <h3>Reward Points</h3>
          <p className={styles.amount}>{userData.rewardPoints.toLocaleString('en-US')}</p>
          <div className={styles.cardFooter}>
            <span>Available points</span>
            <Link to="/rewards" className={styles.redeemButton}>Redeem</Link>
          </div>
        </div>
      </div>

      {/* Credit Cards Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Your Credit Cards</h2>
          <Link to="/ApplyCard" className={styles.applyButton}>
  + Apply for New Card
</Link>

        </div>
        
        {userData.cards.length > 0 ? (
          <div className={styles.cardsGrid}>
            {userData.cards.map(card => (
              <div 
                key={card.id} 
                className={styles.creditCard}
                style={{ background: card.color }}
                onClick={() => navigate(`/cards/${card.id}`)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardType}>{card.type}</span>
                  <span className={styles.cardIssuer}>{card.issuer}</span>
                </div>
                <div className={styles.cardNumber}>
                  •••• •••• •••• {card.lastFour}
                </div>
                <div className={styles.cardDetails}>
                  <div>
                    <span className={styles.detailLabel}>Card Holder</span>
                    <span className={styles.detailValue}>{card.cardHolder}</span>
                  </div>
                  <div>
                    <span className={styles.detailLabel}>Expires</span>
                    <span className={styles.detailValue}>{card.expiryDate}</span>
                  </div>
                </div>
                <div className={styles.cardBalance}>
                  <span>Available Balance</span>
                  <span className={styles.balanceAmount}>
                    ${card.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className={styles.limitText}> / ${card.totalLimit.toLocaleString('en-US')}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noCards}>
            <p>You don't have any credit cards yet.</p>
            <Link to="/apply-card" className={styles.applyButton}>
              Apply for Your First Card
            </Link>
          </div>
        )}
      </section>

      {/* Recent Transactions Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Transactions</h2>
          <Link to="/transactions" className={styles.viewAllLink}>
            View All Transactions
          </Link>
        </div>
        
        {userData.recentTransactions.length > 0 ? (
          <div className={styles.transactionsTable}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {userData.recentTransactions.map(transaction => (
                  <tr 
                    key={transaction.id} 
                    onClick={() => navigate(`/transactions/${transaction.id}`)}
                    className={styles.transactionRow}
                  >
                    <td>{transaction.date}</td>
                    <td>
                      <div className={styles.transactionDescription}>
                        <span className={`${styles.categoryIcon} ${styles[transaction.category]}`}>
                          {getCategoryIcon(transaction.category)}
                        </span>
                        {transaction.description}
                      </div>
                    </td>
                    <td className={`${styles.amount} ${styles[transaction.type]}`}>
                      {transaction.type === 'debit' ? '-' : '+'}${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[transaction.status]}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.noTransactions}>
            <p>No recent transactions found.</p>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>💳</span>
          Virtual Card
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>📱</span>
          Mobile Wallet
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>🔒</span>
          Security
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>📊</span>
          Statements
        </button>
      </div>
    </div>
  );
};

// Helper function for transaction icons
const getCategoryIcon = (category) => {
  switch(category) {
    case 'shopping': return '🛍️';
    case 'food': return '🍔';
    case 'transport': return '🚗';
    case 'entertainment': return '🎬';
    case 'income': return '💰';
    default: return '💳';
  }
};

export default UserDashboard;