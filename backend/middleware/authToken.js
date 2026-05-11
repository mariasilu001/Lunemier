const jwt = require("jsonwebtoken");
const { User } = require("../models");
const vars = require("../vars.js");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).json({ error: "Токен не предоставлен" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(403).json({ error: "Токен не предоставлен" });
    }

    try {
        const decoded = jwt.verify(token, vars.JWT_SECRET);

        const userId = decoded.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        req.user = user;

        next();
    } catch (error) {
        return res
            .status(403)
            .json({ error: "Невалидный токен", error: error });
    }
};

module.exports = authMiddleware;
