const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Путь к твоим моделям sequelize
const vars = require("../vars.js");

const authMiddleware = async (req, res, next) => {
    try {
        if (req.user.role != "admin") {
            return res.status(403).json({ error: "Невалидный токен" });
        }
        next();
    } catch (error) {
        return res.status(403).json({ error: "Невалидный токен" });
    }
};

module.exports = authMiddleware;
