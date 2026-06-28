require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,                   
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes."
  }
});
app.use('/contact', limiter);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws
    }
  }
);

app.post('/contact', async (req, res) => {
  console.log('Request received');
  console.log(req.body);

  try {
    const {
      name,
      email,
      business,
      budget,
      message
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing.'
      });
    }

    console.log('Inserting into database...');

    const { error } = await supabase
      .from('contacts')
      .insert([
        {
          name,
          email,
          business,
          budget,
          message
        }
      ]);

    console.log('Insert successful');

    if (error) {
  console.error('Supabase Error:', error);

  return res.status(500).json({
    success: false,
    message: 'Database error.',
    error: error.message
  });
  }

    res.json({
      success: true,
      message: 'Message sent successfully.'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running!'
  });
});
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});