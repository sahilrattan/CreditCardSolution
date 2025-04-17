import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample knowledge base for credit card queries
  const knowledgeBase = {
    "hello": "Hello! How can I assist you with your credit card application today?",
    "hi": "Hi there! What would you like to know about our credit cards?",
    "how to apply": "You can apply for a credit card by filling out our online application form. Would you like me to guide you through the process?",
    "requirements": "To apply for a credit card, you typically need:\n- To be at least 18 years old\n- Proof of income\n- Government-issued ID\n- Good credit history",
    "types": "We offer several credit card types:\n1. Platinum Rewards Card\n2. Gold Cashback Card\n3. Student Credit Card\n4. Business Advantage Card\n5. Travel Explorer Card\n6. Premium Elite Card",
    "benefits": "Our credit cards offer various benefits including:\n- Reward points\n- Cashback on purchases\n- Travel benefits\n- Insurance coverage\n- Discounts at partner merchants",
    "interest rates": "Interest rates vary by card:\n- Platinum: 15.99%-22.99%\n- Gold: 14.99%-21.99%\n- Student: 16.99%-24.99%\n- Business: 13.99%-19.99%\n- Travel: 17.99%-25.99%\n- Premium: 16.99%-23.99%",
    "fees": "Annual fees vary:\n- Platinum: $95 (first year waived)\n- Gold: $0 first year, then $75\n- Student: $25\n- Business: $125\n- Travel: $99\n- Premium: $450",
    "application status": "To check your application status, you'll need your application reference number. You can find this in the confirmation email we sent you.",
    "contact": "You can contact our customer service at:\nPhone: 1-800-CREDIT\nEmail: support@creditcardcompany.com",
    "default": "I'm sorry, I didn't understand that. Could you please rephrase your question? Here are some topics I can help with:\n- How to apply\n- Requirements\n- Card types\n- Benefits\n- Interest rates\n- Fees"
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate typing indicator
    setMessages(prev => [...prev, { text: '...', sender: 'bot', typing: true }]);

    // Simulate bot response after a delay
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => !msg.typing));
      const botResponse = getBotResponse(input);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 1000);
  };

  // Get appropriate response from knowledge base
  const getBotResponse = (userInput) => {
    const inputLower = userInput.toLowerCase();
    
    // Check for matching keywords
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (inputLower.includes(key)) {
        return value;
      }
    }
    
    // Check for similar questions
    if (inputLower.includes('apply') || inputLower.includes('application')) {
      return knowledgeBase["how to apply"];
    }
    if (inputLower.includes('need') || inputLower.includes('require')) {
      return knowledgeBase["requirements"];
    }
    if (inputLower.includes('type') || inputLower.includes('kind')) {
      return knowledgeBase["types"];
    }
    if (inputLower.includes('benefit') || inputLower.includes('advantage')) {
      return knowledgeBase["benefits"];
    }
    if (inputLower.includes('interest') || inputLower.includes('apr')) {
      return knowledgeBase["interest rates"];
    }
    if (inputLower.includes('fee') || inputLower.includes('charge')) {
      return knowledgeBase["fees"];
    }
    if (inputLower.includes('status') || inputLower.includes('track')) {
      return knowledgeBase["application status"];
    }
    if (inputLower.includes('contact') || inputLower.includes('help')) {
      return knowledgeBase["contact"];
    }
    
    return knowledgeBase["default"];
  };

  // Quick reply suggestions
  const quickReplies = [
    "How to apply?",
    "What are the requirements?",
    "What card types do you offer?",
    "What are the benefits?",
    "What are the interest rates?"
  ];

  // Inline CSS styles
  const styles = {
    container: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 5px 25px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      transform: 'translateY(calc(100% - 50px))',
      zIndex: '1000',
    },
    containerOpen: {
      transform: 'translateY(0)',
      height: '500px',
    },
    header: {
      background: 'linear-gradient(135deg, #3498db, #2980b9)',
      color: 'white',
      padding: '15px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logo: {
      width: '24px',
      height: '24px',
      transition: 'all 0.3s ease',
      fill: 'white',
    },
    headerTitle: {
      margin: '0',
      fontSize: '1.1rem',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100% - 50px)',
    },
    messages: {
      flex: '1',
      padding: '15px',
      overflowY: 'auto',
      backgroundColor: '#f8f9fa',
    },
    welcomeMessage: {
      textAlign: 'center',
      padding: '10px',
    },
    quickReplies: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '10px',
    },
    quickReply: {
      background: '#e3f2fd',
      border: 'none',
      borderRadius: '15px',
      padding: '8px 12px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#1976d2',
    },
    message: {
      marginBottom: '15px',
      padding: '10px 15px',
      borderRadius: '18px',
      maxWidth: '80%',
      lineHeight: '1.4',
      animation: 'fadeIn 0.3s ease',
    },
    userMessage: {
      background: '#e3f2fd',
      marginLeft: 'auto',
      borderBottomRightRadius: '5px',
      color: '#0d47a1',
    },
    botMessage: {
      background: 'white',
      marginRight: 'auto',
      borderBottomLeftRadius: '5px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      color: '#333',
    },
    typingMessage: {
      background: '#f5f5f5',
      color: '#777',
      fontStyle: 'italic',
    },
    inputContainer: {
      display: 'flex',
      padding: '10px',
      borderTop: '1px solid #e0e0e0',
      background: 'white',
    },
    input: {
      flex: '1',
      padding: '10px 15px',
      border: '1px solid #e0e0e0',
      borderRadius: '20px',
      outline: 'none',
      fontSize: '0.9rem',
    },
    submitButton: {
      marginLeft: '10px',
      padding: '10px 15px',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    errorMessage: {
      padding: '1rem',
      backgroundColor: '#ffebee',
      borderLeft: '4px solid #e53935',
      borderRadius: '4px',
      marginBottom: '1.5rem',
      color: '#c62828',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    tryAgainButton: {
      alignSelf: 'flex-start',
      padding: '0.5rem 1rem',
      backgroundColor: '#e53935',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
  };

  return (
    <div style={{...styles.container, ...(isOpen ? styles.containerOpen : {})}}>
      <div style={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.logoContainer}>
          {/* Inline SVG logo */}
          <svg 
            style={styles.logo}
            viewBox="0 0 24 24" 
          >
            <path d="M20 9V7c0-2.8-2.2-5-5-5H9C6.2 2 4 4.2 4 7v2c-1.7 0-3 1.3-3 3v5c0 1.7 1.3 3 3 3v1c0 .6.4 1 1 1s1-.4 1-1v-1h12v1c0 .6.4 1 1 1s1-.4 1-1v-1c1.7 0 3-1.3 3-3v-5c0-1.7-1.3-3-3-3zM6 7c0-1.7 1.3-3 3-3h6c1.7 0 3 1.3 3 3v2H6V7zm15 10c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-5c0-.6.4-1 1-1h16c.6 0 1 .4 1 1v5zM8 14c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm10 0c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm-5 0c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1z"/>
          </svg>
          <h3 style={styles.headerTitle}>Assistant</h3>
        </div>
        <span>{isOpen ? '−' : '+'}</span>
      </div>
      
      {isOpen && (
        <div style={styles.content}>
          <div style={styles.messages}>
            {messages.length === 0 ? (
              <div style={styles.welcomeMessage}>
                <p>Hello! I'm your credit card assistant. How can I help you today?</p>
                <div style={styles.quickReplies}>
                  {quickReplies.map((reply, index) => (
                    <button 
                      key={index} 
                      style={styles.quickReply}
                      onClick={() => setInput(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.message,
                    ...(message.sender === 'user' ? styles.userMessage : styles.botMessage),
                    ...(message.typing ? styles.typingMessage : {})
                  }}
                >
                  {message.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} style={styles.inputContainer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              style={styles.input}
            />
            <button type="submit" style={styles.submitButton}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;