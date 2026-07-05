const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');
const verifyAdmin = require('../middleware/auth');

const router = express.Router();

// POST /admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });

    res.json({ success: true, message: 'Logged in successfully.' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /admin/logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out.' });
});

// GET /admin/enquiries
router.get('/enquiries', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch enquiries.' });
    }

    res.json({ success: true, data });

  } catch (err) {
    console.error('Fetch enquiries error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /admin/enquiries/:id
router.get('/enquiries/:id', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({ success: true, data });

  } catch (err) {
    console.error('Fetch enquiry error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;