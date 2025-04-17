const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

const pool = mysql.createPool(dbConfig);

// Submit credit card application
router.post('/', async (req, res) => {
  try {
    const { cardType, personalInfo, addressInfo, financialInfo } = req.body;

    // Validate required fields
    if (!cardType || !personalInfo || !addressInfo || !financialInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format date
    const dobDate = new Date(personalInfo.dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO credit_card_applications (
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
        pan_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cardType,
        personalInfo.fullName,
        personalInfo.email,
        personalInfo.phone,
        dobDate.toISOString().split('T')[0],
        addressInfo.address,
        addressInfo.city,
        addressInfo.state,
        addressInfo.pincode,
        financialInfo.employment,
        financialInfo.company,
        parseFloat(financialInfo.income) || 0,
        financialInfo.pan.toUpperCase()
      ]
    );

    connection.release();

    res.status(201).json({
      success: true,
      applicationId: result.insertId,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ 
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// Get all applications
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM credit_card_applications');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get application by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM credit_card_applications WHERE id = ?', 
      [req.params.id]
    );
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Update application status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE credit_card_applications SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ 
      success: true,
      message: 'Application status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router;