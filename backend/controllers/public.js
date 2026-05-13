const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const models = require("../models");
const vars = require("../vars");

const router = express.Router();
const JWT_SECRET = vars.JWT_SECRET;

// ===================== АВТОРИЗАЦИЯ =====================

router.post("/register", async (req, res, next) => {
    try {
        console.log("Регистрация новой пешки...");
        const { username, email, password, firstName, lastName, phoneNumber } =
            req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message:
                    "Я сказал передать username, email и password. Где они?",
            });
        }

        const existingUser = await models.User.findOne({
            where: {
                [models.sequelize.Sequelize.Op.or]: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "Пользователь с таким email или username уже существует. Придумай что-то другое.",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await models.User.create({
            username,
            email,
            passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
            phoneNumber: phoneNumber || null,
            role: "user",
            createdAt: new Date(),
        });

        console.log(
            `Пользователь ${newUser.username} успешно добавлен под мой контроль.`,
        );
        res.status(201).json({
            message: "Регистрация прошла успешно.",
            user: {
                userId: newUser.userId,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        console.log("Попытка входа...");
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Введи email и пароль. Я не умею читать мысли.",
            });
        }

        const user = await models.User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                message:
                    "Я не знаю такого пользователя. Проваливай или зарегистрируйся.",
            });
        }

        if (user.deletedAt) {
            return res
                .status(403)
                .json({ message: "Этот аккаунт заблокирован или удален." });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message:
                    "Неверный пароль. Попробуй еще раз, пока я не разозлился.",
            });
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            JWT_SECRET,
            { expiresIn: "24h" },
        );

        console.log(`Пользователь ${user.username} успешно авторизован.`);
        res.status(200).json({
            message: "Успешный вход.",
            token,
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
});

// ===================== СПРАВОЧНИКИ =====================

router.get("/categories", async (req, res, next) => {
    try {
        const categories = await models.Category.findAll();
        res.status(200).json({ categories });
    } catch (error) {
        next(error);
    }
});

router.get("/pickup-points", async (req, res, next) => {
    try {
        const pickupPoints = await models.PickupPoint.findAll({
            where: { deletedAt: null },
        });
        res.status(200).json({ pickupPoints });
    } catch (error) {
        next(error);
    }
});

router.get("/payment-methods", async (req, res, next) => {
    try {
        const paymentMethods = await models.PaymentMethod.findAll({
            where: { isActive: true },
        });
        res.status(200).json({ paymentMethods });
    } catch (error) {
        next(error);
    }
});

router.get("/sizes", async (req, res, next) => {
    try {
        const sizes = await models.Size.findAll();
        res.status(200).json({ sizes });
    } catch (error) {
        next(error);
    }
});

// ===================== ТОВАРЫ =====================
// Я сказал: статические пути всегда идут ВЫШЕ динамических (:productId)!

router.get("/products/bases", async (req, res, next) => {
    try {
        console.log("Достаю основы для кастомизатора...");
        const bases = await models.Product.findAll({
            where: { isBase: true, isCustom: false },
            attributes: ["productId", "name", "frontPhotoUrl", "backPhotoUrl"],
            include: [
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true },
                    required: false,
                },
            ],
        });
        res.status(200).json({ bases });
    } catch (error) {
        next(error);
    }
});

router.get("/products", async (req, res, next) => {
    try {
        console.log("Отдаю правильный каталог под своим контролем...");
        const { categoryId, isBase, search } = req.query;

        const whereClause = { isCustom: false };

        // Если явно не запросили основы, я запрещаю их выводить!
        if (isBase !== undefined) {
            whereClause.isBase = isBase === "true";
        } else {
            whereClause.isBase = false;
        }

        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        if (search) {
            whereClause.name = {
                [models.sequelize.Sequelize.Op.like]: `%${search}%`,
            };
        }

        const products = await models.Product.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true },
                    required: false,
                },
                {
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
                { model: models.Review, as: "reviews", attributes: ["rating"] },
            ],
        });

        const formattedProducts = products.map((product) => {
            const productJSON = product.toJSON();
            const reviews = productJSON.reviews || [];
            let avgRating = 0;
            if (reviews.length > 0) {
                const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
                avgRating = (sum / reviews.length).toFixed(1);
            }
            productJSON.averageRating = parseFloat(avgRating);
            delete productJSON.reviews;
            return productJSON;
        });

        res.status(200).json({ products: formattedProducts });
    } catch (error) {
        next(error);
    }
});

router.get("/products/:productId", async (req, res, next) => {
    try {
        console.log(`Запрашивается товар ${req.params.productId}...`);
        const product = await models.Product.findOne({
            where: {
                productId: req.params.productId,
                isCustom: false,
                isBase: false,
            },
            include: [
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true },
                    required: false,
                },
                {
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
                { model: models.Size, as: "size" },
                { model: models.Category, as: "category" },
                {
                    model: models.Review,
                    as: "reviews",
                    include: [
                        {
                            model: models.User,
                            as: "author",
                            attributes: ["username", "firstName"],
                        },
                        {
                            model: models.ReviewPhoto,
                            as: "photos",
                            through: { attributes: [] },
                        },
                    ],
                },
            ],
            order: [
                [{ model: models.Review, as: "reviews" }, "createdAt", "DESC"],
            ],
        });

        if (!product) {
            return res.status(404).json({
                message: "Такого товара не существует. Не ищи то, чего нет.",
            });
        }

        const productJSON = product.toJSON();
        const reviews = productJSON.reviews || [];
        let avgRating = 0;

        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
            avgRating = (sum / reviews.length).toFixed(1);
        }

        productJSON.averageRating = parseFloat(avgRating);
        res.status(200).json({ product: productJSON });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
