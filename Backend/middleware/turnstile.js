const verifyTurnstile = async (req, res, next) => {
  const { turnstileToken } = req.body;

  if (!turnstileToken) {
    return res.status(400).json({
      success: false,
      message: "Captcha verification missing."
    });
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken
      })
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: "Captcha verification failed."
      });
    }

    next();

  } catch (err) {
    console.error("Turnstile verification error:", err);

    return res.status(500).json({
      success: false,
      message: "Captcha verification error."
    });
  }
};

module.exports = verifyTurnstile;