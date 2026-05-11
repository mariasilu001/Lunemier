const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const models = require("../models");
const vars = require("../vars");

const router = express.Router();

const JWT_SECRET = vars.JWT_SECRET;

// ==========================================
// ЭНДПОИНТ РЕГИСТРАЦИИ
// ==========================================
router.post("/register", async (req, res, next) => {
    try {
        console.log("Регистрация новой пешки...");
        const { username, email, password, firstName, lastName, phoneNumber } =
            req.body;

        // Я жестко контролирую входные данные. Ты не пройдешь, если не дашь мне базу.
        if (!username || !email || !password) {
            return res.status(400).json({
                message:
                    "Я сказал передать username, email и password. Где они?",
            });
        }

        // Проверяем, нет ли уже такого юзера в моей базе.
        const existingUser = await models.User.findOne({
            where: {
                // Ищем по email ИЛИ username. Никаких дубликатов.
                [models.sequelize.Sequelize.Op.or]: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "Пользователь с таким email или username уже существует. Придумай что-то другое.",
            });
        }

        // Хешируем пароль. Я не храню открытые пароли.
        const passwordHash = await bcrypt.hash(password, 10);

        // Создаем пользователя через models.User, как ты и хотела
        const newUser = await models.User.create({
            username,
            email,
            passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
            phoneNumber: phoneNumber || null,
            role: "user", // Все новые по умолчанию обычные юзеры. Админ только один.
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
        // Если что-то пойдет не так, ошибка полетит в твою глобальную мидлу в server.js
        next(error);
    }
});

// ==========================================
// ЭНДПОИНТ АВТОРИЗАЦИИ (ЛОГИН)
// ==========================================
router.post("/login", async (req, res, next) => {
    try {
        console.log("Попытка входа...");
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Введи email и пароль. Я не умею читать мысли.",
            });
        }

        // Ищем пользователя
        const user = await models.User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                message:
                    "Я не знаю такого пользователя. Проваливай или зарегистрируйся.",
            });
        }

        // Проверяем, не удален ли он (soft delete)
        if (user.deletedAt) {
            return res
                .status(403)
                .json({ message: "Этот аккаунт заблокирован или удален." });
        }

        // Сравниваем пароли. Моя логика безупречна.
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

        // Если всё верно — генерируем токен.
        // Я зашиваю в него userId и role, чтобы твои мидлы authToken и authAdmin могли их прочитать.
        const token = jwt.sign(
            {
                userId: user.userId,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "24h" }, // Токен живет сутки. Потом пусть логинятся заново.
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

// ==========================================
// GET /api/products — Получение списка товаров (публичный каталог)
// ==========================================
router.get("/products", async (req, res, next) => {
    try {
        console.log("Запрашивается публичный каталог товаров...");
        const { categoryId, isBase, search } = req.query;

        // Жесткий контроль. В публичном каталоге не место чужим кастомам.
        const whereClause = { isCustom: false };

        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        if (isBase !== undefined) {
            whereClause.isBase = isBase === "true"; //
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
                    where: { isActive: true }, // Тянем только актуальную цену
                    required: false,
                },
                {
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] }, // Подтягиваем фото [cite: 148]
                },
            ],
        });

        res.status(200).json({
            message: "Каталог товаров успешно загружен.",
            products,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/products/:productId — Детальная информация о товаре
// ==========================================
router.get("/products/:productId", async (req, res, next) => {
    try {
        console.log(`Запрашивается товар ${req.params.productId}...`);

        const product = await models.Product.findOne({
            where: {
                productId: req.params.productId,
                isCustom: false, // Чужие дизайны публично не смотрим
            },
            include: [
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true }, //
                    required: false,
                },
                {
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] }, // [cite: 148]
                },
                {
                    model: models.Size,
                    as: "size", // Подтягиваем справочник размеров
                },
                {
                    model: models.Category,
                    as: "category", // Подтягиваем категорию
                },
                {
                    model: models.Review,
                    as: "reviews", // Тянем отзывы
                    include: [
                        {
                            model: models.User,
                            as: "author",
                            attributes: ["username", "firstName"], // Показываем, кто оставил
                        },
                        {
                            model: models.ReviewPhoto,
                            as: "photos",
                            through: { attributes: [] }, // Фото к отзывам
                        },
                    ],
                },
            ],
            order: [
                // Сортируем отзывы от новых к старым
                [{ model: models.Review, as: "reviews" }, "createdAt", "DESC"],
            ],
        });

        if (!product) {
            return res.status(404).json({
                message: "Такого товара не существует. Не ищи то, чего нет.",
            });
        }

        res.status(200).json({
            message: "Детальная информация собрана.",
            product,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/categories — Получение списка всех категорий
// ==========================================
router.get("/categories", async (req, res, next) => {
    try {
        console.log("Отдаю список категорий...");
        const categories = await models.Category.findAll(); // [cite: 2, 27]

        res.status(200).json({
            message: "Категории загружены.",
            categories,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/pickup-points — Получение списка активных ПВЗ
// ==========================================
router.get("/pickup-points", async (req, res, next) => {
    try {
        console.log("Отдаю актуальные пункты выдачи...");

        const pickupPoints = await models.PickupPoint.findAll({
            where: {
                deletedAt: null, // Я жестко фильтрую удаленные ПВЗ. Мусор нам не нужен.
            },
        });

        res.status(200).json({
            message: "Пункты выдачи загружены.",
            pickupPoints,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/payment-methods — Получение активных способов оплаты
// ==========================================
router.get("/payment-methods", async (req, res, next) => {
    try {
        console.log("Отдаю доступные методы оплаты...");

        const paymentMethods = await models.PaymentMethod.findAll({
            where: {
                isActive: true, // Только то, что работает.
            },
        });

        res.status(200).json({
            message: "Методы оплаты загружены.",
            paymentMethods,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/products/bases — Получение базовых товаров для кастомизатора
// ВАЖНО: Этот роут стоит ВЫШЕ /api/products/:productId. Я так сказал. Иначе Express сломается.
// ==========================================
router.get("/products/bases", async (req, res, next) => {
    try {
        console.log("Достаю основы для кастомизатора...");

        const bases = await models.Product.findAll({
            where: {
                isBase: true, //
                isCustom: false, //
            },
            // Для основ нам нужны только эти поля
            attributes: ["productId", "name", "frontPhotoUrl", "backPhotoUrl"], // [cite: 39, 40, 46, 47]
            include: [
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true }, // [cite: 56]
                    required: false,
                },
            ],
        });

        res.status(200).json({
            message: "Базовые товары успешно загружены под моим контролем.",
            bases,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/products — Получение списка товаров (публичный каталог)
// ==========================================
router.get("/products", async (req, res, next) => {
    try {
        console.log("Отдаю правильный публичный каталог...");

        const products = await models.Product.findAll({
            where: {
                isCustom: false, //
                isBase: false, //
            },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true }, // [cite: 56]
                    required: false,
                },
                {
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
                {
                    model: models.Review,
                    as: "reviews",
                    attributes: ["rating"], // Я тяну только оценки, чтобы быстро посчитать среднее
                },
            ],
        });

        // Мой алгоритм для подсчета средней оценки
        const formattedProducts = products.map((product) => {
            const productJSON = product.toJSON();
            const reviews = productJSON.reviews || [];
            let avgRating = 0;

            if (reviews.length > 0) {
                const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0); //
                avgRating = (sum / reviews.length).toFixed(1);
            }

            productJSON.averageRating = parseFloat(avgRating);
            delete productJSON.reviews; // Убираем массив отзывов, в каталоге они не нужны, нужен только рейтинг
            return productJSON;
        });

        res.status(200).json({
            message: "Каталог товаров готов.",
            products: formattedProducts,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/products/:productId — Детальная информация о товаре
// ==========================================
router.get("/products/:productId", async (req, res, next) => {
    try {
        console.log(
            `Запрашивается детальная информация по товару ${req.params.productId}...`,
        );

        const product = await models.Product.findOne({
            where: {
                productId: req.params.productId, // [cite: 39]
                isCustom: false, //
                isBase: false, //
            },
            include: [
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true }, // [cite: 56]
                    required: false,
                },
                {
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
                {
                    model: models.Size,
                    as: "size",
                },
                {
                    model: models.Category,
                    as: "category",
                },
                {
                    model: models.Review,
                    as: "reviews",
                    include: [
                        {
                            model: models.User,
                            as: "author",
                            attributes: ["username", "firstName", "avatar"], // Показываем данные автора [cite: 1, 18, 20]
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
                [{ model: models.Review, as: "reviews" }, "createdAt", "DESC"], // Свежие отзывы первыми [cite: 81]
            ],
        });

        if (!product) {
            return res.status(404).json({
                message: "Такого товара не существует. Не ищи то, чего нет.",
            });
        }

        // Вычисляем среднюю оценку для карточки товара
        const productJSON = product.toJSON();
        const reviews = productJSON.reviews || [];
        let avgRating = 0;

        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0); //
            avgRating = (sum / reviews.length).toFixed(1);
        }

        productJSON.averageRating = parseFloat(avgRating);

        res.status(200).json({
            message: "Детальная информация собрана и защищена.",
            product: productJSON,
        });
    } catch (error) {
        next(error);
    }
});

// Добавь это в public.js
// ==========================================
// GET /api/sizes — Получить все размеры
// ==========================================
router.get("/sizes", async (req, res, next) => {
    try {
        const sizes = await models.Size.findAll();
        res.status(200).json({ sizes });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
