require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and rate limiting
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'credit_card_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Email setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
const resetTokens = new Map();

// Utility functions
async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 AS test');
    return rows[0].test === 1;
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

async function initializeDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20) NULL,
        address TEXT NULL,
        dob DATE NULL,
        age INT NULL,
        password VARCHAR(255) NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_card_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        card_type VARCHAR(100) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        dob DATE NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        employment_type VARCHAR(50) NOT NULL,
        company_name VARCHAR(100) NOT NULL,
        annual_income DECIMAL(15, 2) NOT NULL,
        pan_number VARCHAR(10) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      )
    `);

    console.log('Database tables verified/created');
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  }
}

// Email template generator
function generateSignupEmail(userData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2c3e50; text-align: center;">Welcome to Our Service, ${userData.first_name}!</h2>
      <p style="font-size: 16px; line-height: 1.6;">Thank you for registering with us. Here are the details you provided:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <th style="text-align: left; padding: 12px; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">Field</th>
          <th style="text-align: left; padding: 12px; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">Value</th>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">First Name</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${userData.first_name}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Last Name</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${userData.last_name}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Email</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${userData.email}</td>
        </tr>
        ${userData.phone ? `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Phone</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${userData.phone}</td>
        </tr>
        ` : ''}
        ${userData.dob ? `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Date of Birth</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${new Date(userData.dob).toLocaleDateString()}</td>
        </tr>
        ` : ''}
        ${userData.age ? `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Age</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${userData.age}</td>
        </tr>
        ` : ''}
        ${userData.address ? `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Address</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${userData.address}</td>
        </tr>
        ` : ''}
      </table>
      
      <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
        Please keep this information for your records. If you didn't request this signup, 
        please contact our support team immediately.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
        <p style="font-size: 14px; color: #7f8c8d;">Best regards,<br>The Support Team</p>
      </div>
    </div>
  `;
}

// Routes

// User Authentication Routes
app.post('/api/signup', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isLength({ min: 10, max: 15 }).withMessage('Phone must be 10-15 digits'),
  body('address').optional().trim(),
  body('dob').optional().isDate().withMessage('Date of birth must be a valid date'),
  body('age').optional().isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { firstName, lastName, email, phone, address, dob, age } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const [result] = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, address, dob, age) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone || null, address || null, dob || null, age || null]
    );

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: `"Support Team" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Registration Details',
        html: generateSignupEmail({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          address,
          dob,
          age
        })
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ 
      success: true, 
      userId: result.insertId, 
      message: 'User created. Please set your password.' 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/set-password', [
  body('userId').isInt().withMessage('Valid user ID required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { userId, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'UPDATE users SET password = ?, is_verified = TRUE WHERE id = ?', 
      [hashedPassword, userId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, message: 'Password set successfully' });
  } catch (err) {
    console.error('Set password error:', err);
    res.status(500).json({ error: 'Password setup failed' });
  }
});

app.post('/api/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    if (!user.password) return res.status(400).json({ error: 'User has not set a password yet' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Password Reset Routes
app.post('/api/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ error: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 10; // 10 min
    resetTokens.set(token, { email, expires });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Support Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p style="font-size: 16px;">Click the button below to reset your password:</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #3498db; 
                    color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="font-size: 14px; color: #7f8c8d;">
            This link expires in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Error sending reset email' });
  }
});

app.post('/api/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  const { token, newPassword } = req.body;
  const entry = resetTokens.get(token);
  if (!entry || Date.now() > entry.expires) return res.status(400).json({ error: 'Token is invalid or expired' });

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashed, entry.email]);
    resetTokens.delete(token);
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Credit Card Application Route
app.post('/api/credit-card-applications', [
  body('cardType').notEmpty().withMessage('Card type is required'),
  body('personalInfo.fullName').notEmpty().withMessage('Full name is required'),
  body('personalInfo.email').isEmail().withMessage('Valid email is required'),
  body('personalInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('personalInfo.dob').isDate().withMessage('Valid date of birth is required'),
  body('addressInfo.address').notEmpty().withMessage('Address is required'),
  body('addressInfo.city').notEmpty().withMessage('City is required'),
  body('addressInfo.state').notEmpty().withMessage('State is required'),
  body('addressInfo.pincode').notEmpty().withMessage('Pincode is required'),
  body('financialInfo.employment').notEmpty().withMessage('Employment type is required'),
  body('financialInfo.company').notEmpty().withMessage('Company name is required'),
  body('financialInfo.income').isFloat({ min: 0 }).withMessage('Valid income amount is required'),
  body('financialInfo.pan').matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/).withMessage('Valid PAN is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      cardType,
      personalInfo,
      addressInfo,
      financialInfo,
      userId = null
    } = req.body;

    // Get current timestamp
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert into database - including all columns explicitly
    const [result] = await db.query(
      `INSERT INTO credit_card_applications (
        user_id,
        card_type,
        full_name,
        email,
        phone,
        dob,
        address,
        city,
        state,
        pincode,
        employment_type,
        company_name,
        annual_income,
        pan_number,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        cardType,
        personalInfo.fullName,
        personalInfo.email,
        personalInfo.phone,
        personalInfo.dob,
        addressInfo.address,
        addressInfo.city,
        addressInfo.state,
        addressInfo.pincode,
        financialInfo.employment,
        financialInfo.company,
        financialInfo.income,
        financialInfo.pan.toUpperCase(),
        'pending', // status
        now, // created_at
        now  // updated_at
      ]
    );

    res.status(201).json({
      success: true,
      applicationId: result.insertId,
      status: 'pending'
    });

  } catch (err) {
    console.error('Credit card application error:', {
      message: err.message,
      sql: err.sql,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Failed to submit application',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get applications route
app.get('/api/credit-card-applications', async (req, res) => {
  try {
    const [applications] = await db.query(`
      SELECT id, card_type, full_name, email, status, created_at 
      FROM credit_card_applications
      ORDER BY created_at DESC
    `);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get single application
app.get('/api/credit-card-applications/:id', async (req, res) => {
  try {
    const [applications] = await db.query(`
      SELECT * FROM credit_card_applications 
      WHERE id = ?
    `, [req.params.id]);

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(applications[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});




// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    const mailOptions = {
      from: `"Credit Card Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});


// User Profile Route (Protected)
app.get('/api/user-profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        dob, 
        address,
        created_at
      FROM users 
      WHERE id = ?
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Server startup
async function startServer() {
  try {
    if (!await testConnection()) throw new Error('Could not connect to database');
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

startServer();