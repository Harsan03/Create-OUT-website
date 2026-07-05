const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please log in again.'
    });
  }
};

module.exports = verifyAdmin;
