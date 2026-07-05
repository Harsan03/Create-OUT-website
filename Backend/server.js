require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const supabase = require('./utils/supabase');
const validateContact = require('./middleware/validation');
const verifyTurnstile = require('./middleware/turnstile');
const adminRoutes = require('./routes/admin');
const { sendConfirmationEmail, sendAdminNotification } = require('./utils/mailer');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/admin', adminRoutes);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.'
  }
});
app.use('/contact', limiter);

app.post('/contact', verifyTurnstile, validateContact, async (req, res) => {
  console.log('Request received');

  try {
    const { name, email, business, budget, message } = req.body;

    const { error } = await supabase
      .from('contacts')
      .insert([{ name, email, business, budget, message }]);

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error.',
        error: error.message
      });
    }

    console.log('Insert successful');

    sendConfirmationEmail(name, email).catch(err => console.error('Confirmation email error:', err));
    sendAdminNotification(name, email, business, budget, message).catch(err => console.error('Admin notification error:', err));

    res.json({ success: true, message: 'Message sent successfully.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Backend is running!' });
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});