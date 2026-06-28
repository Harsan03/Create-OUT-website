const { body, validationResult } = require("express-validator");

const validateContact = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),

    body("business")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Business name is too long"),

    body("budget")
        .isIn([
            "Under ₹15,000",
            "₹15k - ₹30k",
            "₹30k - ₹50k",
            "Above ₹50k"
        ])
        .withMessage("Invalid budget option"),

    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ min: 10, max: 1000 })
        .withMessage("Message must be between 10 and 1000 characters"),

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            return res.status(400).json({
                success: false,
                errors: errors.array()
            });

        }

        next();
    }
];

module.exports = validateContact;