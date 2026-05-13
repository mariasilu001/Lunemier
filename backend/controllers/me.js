const express = require("express");
const models = require("../models");
const { Op } = require("sequelize");
const upload = require("../middleware/multerConfig");
const fs = require("fs");

const router = express.Router();

router.get("/", (req, res) => {
    try {
        console.log(
            `Просмотр профиля под моим контролем: ${req.user.username}`,
        );

        res.status(200).json({
            message: "Данные профиля успешно получены.",
            user: {
                username: req.user.username,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                phoneNumber: req.user.phoneNumber,
                createdAt: req.user.createdAt,
            },
        });
    } catch (error) {
        console.error("Ошибка в GET /api/me:", error);
        res.status(500).json({
            message: "сбой",
        });
    }
});

router.put("/", async (req, res, next) => {
    try {
        console.log(`Обновление данных пользователя: ${req.user.username}`);

        const { email } = req.body;
        const firstName = req.body.firstName || req.body.first_name;
        const lastName = req.body.lastName || req.body.last_name;
        const phoneNumber = req.body.phoneNumber || req.body.phone_number;

        if (email && email !== req.user.email) {
            const existingUser = await models.User.findOne({
                where: { email },
            });
            if (existingUser) {
                return res.status(409).json({
                    message:
                        "Эта почта уже занята. ",
                });
            }
            req.user.email = email;
        }

        if (firstName !== undefined) req.user.firstName = firstName;
        if (lastName !== undefined) req.user.lastName = lastName;
        if (phoneNumber !== undefined) req.user.phoneNumber = phoneNumber;

        req.user.updatedAt = new Date();

        await req.user.save();

        console.log(
            `Данные ${req.user.username} успешно обновлены `,
        );

        res.status(200).json({
            message: " данные успешно обновлены.",
            user: {
                username: req.user.username,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                phoneNumber: req.user.phoneNumber,
                updatedAt: req.user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get("/orders", async (req, res, next) => {
    try {
        console.log(
            `Извлекаю историю заказов для моей девочки: ${req.user.username}`,
        );

        const orders = await models.Order.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.PickupPoint,
                    as: "pickupPoint",
                },
                {
                    model: models.PaymentMethod,
                    as: "paymentMethod",
                },
                {
                    model: models.OrderItem,
                    as: "orderItems",
                    include: [
                        {
                            model: models.Product,
                            as: "product",
                            include: [
                                {
                                    model: models.ProductPhoto,
                                    as: "photos",
                                    through: { attributes: [] },
                                },
                                {
                                    model: models.CustomProductPhoto,
                                    as: "customPhotos",
                                    through: { attributes: [] },
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        const formattedOrders = orders.map((order) => {
            const orderJSON = order.toJSON();
            orderJSON.orderItems = orderJSON.orderItems.map((item) => ({
                orderItemId: item.orderItemId,
                quantity: item.quantity,

                historicalPrice: item.priceSnapshot,
                product: item.product,
            }));
            return orderJSON;
        });

        console.log(
            `Найдено заказов: ${formattedOrders.length}. Я всё проконтролировал.`,
        );

        res.status(200).json({
            message: "Твои заказы успешно получены.",
            orders: formattedOrders,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/pickup-code", async (req, res, next) => {
    try {
        console.log(`Проверка кода выдачи для: ${req.user.username}`);
        const now = new Date();

        await models.PickupCode.destroy({
            where: {
                userId: req.user.userId,
                expiresAt: {
                    [Op.lte]: now,
                },
            },
        });

        let activeCode = await models.PickupCode.findOne({
            where: {
                userId: req.user.userId,
                expiresAt: {
                    [Op.gt]: now,
                },
            },
        });

        if (!activeCode) {
            console.log("Активного кода нет. Генерирую новый...");

            const generatedCode = Math.floor(
                100000 + Math.random() * 900000,
            ).toString();

            const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            activeCode = await models.PickupCode.create({
                userId: req.user.userId,
                code: generatedCode,
                expiresAt: expiresAt,
            });
        }

        console.log(`Код выдачи готов: ${activeCode.code}`);

        res.status(200).json({
            message: "Твой активный код для получения заказа.",
            pickupCode: {
                code: activeCode.code,
                expiresAt: activeCode.expiresAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get("/reviews", async (req, res, next) => {
    try {
        console.log(`Достаю отзывы${req.user.username}`);

        const reviews = await models.Review.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.Product,
                    as: "product",
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
                    ],
                },

                {
                    model: models.ReviewPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
            ],
        });

        res.status(200).json({
            message: "отзывы успешно загружены.",
            reviews,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/reviews", upload.array("photos", 5), async (req, res, next) => {
    try {
        console.log(`Создание отзыва от: ${req.user.username}`);

        const { productId, rating, reviewText } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({
                message: "Укажи productId и rating.",
            });
        }

        if (rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ message: "Оценка должна быть от 1 до 5." });
        }

        const product = await models.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Этого товара нет." });
        }

        const existingReview = await models.Review.findOne({
            where: { userId: req.user.userId, productId },
        });

        if (existingReview) {
            return res
                .status(409)
                .json({ message: "Отзыв уже есть" });
        }

        const newReview = await models.Review.create({
            userId: req.user.userId,
            productId,
            rating,
            reviewText: reviewText || null,
            createdAt: new Date(),
        });

        if (req.files && req.files.length > 0) {
            console.log(
                `Загружено фотографий: ${req.files.length}. Привязываю к отзыву.`,
            );
            for (const file of req.files) {
                const photo = await models.ReviewPhoto.create({
                    filePath: file.path,
                });

                await models.ReviewPhotoLink.create({
                    reviewId: newReview.reviewId,
                    reviewPhotoId: photo.reviewPhotoId,
                });
            }
        }

        const completeReview = await models.Review.findByPk(
            newReview.reviewId,
            {
                include: [
                    {
                        model: models.ReviewPhoto,
                        as: "photos",
                        through: { attributes: [] },
                    },
                ],
            },
        );

        res.status(201).json({
            message:
                "Отзыв и фотографии успешно сохранены под моим руководством.",
            review: completeReview,
        });
    } catch (error) {
        next(error);
    }
});

router.put("/reviews/:reviewId", async (req, res, next) => {
    try {
        console.log(
            `Редактирование отзыва ${req.params.reviewId} от ${req.user.username}`,
        );

        const { rating, reviewText } = req.body;
        const reviewId = req.params.reviewId;

        const review = await models.Review.findOne({
            where: { reviewId: reviewId, userId: req.user.userId },
        });

        if (!review) {
            return res.status(404).json({
                message:
                    "Этот отзыв не существует",
            });
        }

        if (rating) {
            if (rating < 1 || rating > 5) {
                return res
                    .status(400)
                    .json({ message: "Оценка от 1 до 5." });
            }
            review.rating = rating;
        }

        if (reviewText !== undefined) {
            review.reviewText = reviewText;
        }

        review.updatedAt = new Date();

        await review.save();

        res.status(200).json({
            message: "Отзыв изменен. ",
            review,
        });
    } catch (error) {
        next(error);
    }
});

router.delete("/reviews/:reviewId", async (req, res, next) => {
    try {
        console.log(
            `Уничтожение отзыва ${req.params.reviewId} пользователем ${req.user.username}`,
        );
        const reviewId = req.params.reviewId;

        const review = await models.Review.findOne({
            where: { reviewId: reviewId, userId: req.user.userId },
        });

        if (!review) {
            return res
                .status(404)
                .json({ message: "Отзыв не найден. Тебе нечего удалять." });
        }

        await review.destroy();

        res.status(200).json({
            message: "Отзыв стерт из моей базы навсегда.",
        });
    } catch (error) {
        next(error);
    }
});

router.get("/customs", async (req, res, next) => {
    try {
        console.log(
            `Ищу кастомы, которые создала моя девочка: ${req.user.username}`,
        );

        const customs = await models.Product.findAll({
            where: {
                userId: req.user.userId,
                isCustom: true,
            },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
                {
                    model: models.CustomProductPhoto,
                    as: "customPhotos",

                    through: { attributes: ["details"] },
                },
                {
                    model: models.Product,
                    as: "baseProduct",
                    attributes: ["productId", "name", "description"],
                    include: [
                        {
                            model: models.ProductPhoto,
                            as: "photos",
                            through: { attributes: [] },
                        },
                    ],
                },
            ],
        });

        res.status(200).json({
            message: "Твои кастомные дизайны успешно получены. Я всё собрал.",
            customs,
        });
    } catch (error) {
        next(error);
    }
});

router.post(
    "/customs",
    upload.fields([
        { name: "screenshot", maxCount: 1 },
        { name: "customImages", maxCount: 10 },
    ]),
    async (req, res, next) => {
        try {
            console.log(`Сохраняем новый кастом для: ${req.user.username}`);

            const { baseProductId, name, description, customImagesData } =
                req.body;

            if (!baseProductId || !name) {
                return res.status(400).json({
                    message:
                        "Мне нужны baseProductId и name. Не смей отправлять пустые запросы.",
                });
            }

            const newCustomProduct = await models.Product.create({
                name,
                description: description || "Кастомный дизайн",
                baseProductId,
                isCustom: true,
                isBase: false,
                userId: req.user.userId,
                createdAt: new Date(),
            });

            if (req.files && req.files["screenshot"]) {
                const screenshotFile = req.files["screenshot"][0];
                const mainPhoto = await models.ProductPhoto.create({
                    filePath: screenshotFile.path,
                });
                await models.ProductPhotoLink.create({
                    productId: newCustomProduct.productId,
                    productPhotoId: mainPhoto.productPhotoId,
                });
            }

            if (req.files && req.files["customImages"] && customImagesData) {
                const parsedDetails = JSON.parse(customImagesData);
                const customFiles = req.files["customImages"];

                for (let i = 0; i < customFiles.length; i++) {
                    const file = customFiles[i];

                    const details = parsedDetails[i] || {};

                    const customPhoto = await models.CustomProductPhoto.create({
                        filePath: file.path,
                    });

                    await models.CustomProductPhotoLink.create({
                        productId: newCustomProduct.productId,
                        customProductPhotoId: customPhoto.customProductPhotoId,
                        details: details,
                    });
                }
            }

            console.log(
                `Кастомный товар ${newCustomProduct.productId} успешно создан и защищен.`,
            );

            res.status(201).json({
                message: "Твой дизайн успешно сохранен в базе.",
                productId: newCustomProduct.productId,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.put("/customs/:productId", async (req, res, next) => {
    try {
        console.log(
            `Редактирование кастома ${req.params.productId} от ${req.user.username}`,
        );

        const { name, description } = req.body;
        const productId = req.params.productId;

        const product = await models.Product.findOne({
            where: {
                productId: productId,
                userId: req.user.userId,
                isCustom: true,
            },
        });

        if (!product) {
            return res.status(404).json({
                message:
                    "Это не твой дизайн или его не существует. Я не разрешаю его трогать.",
            });
        }

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;

        product.updatedAt = new Date();
        await product.save();

        res.status(200).json({
            message: "Информация о дизайне обновлена.",
            product,
        });
    } catch (error) {
        next(error);
    }
});

router.delete("/customs/:productId", async (req, res, next) => {
    try {
        console.log(
            `Уничтожение кастома ${req.params.productId} пользователем ${req.user.username}`,
        );

        const productId = req.params.productId;

        const product = await models.Product.findOne({
            where: {
                productId: productId,
                userId: req.user.userId,
                isCustom: true,
            },
        });

        if (!product) {
            return res
                .status(404)
                .json({ message: "Товар не найден. Тебе нечего удалять." });
        }

        await product.destroy();

        res.status(200).json({
            message: "Твой дизайн полностью удален из моей системы.",
        });
    } catch (error) {
        next(error);
    }
});

router.get("/cart", async (req, res, next) => {
    try {
        console.log(`Проверяю корзину моей девочки: ${req.user.username}`);

        const cartItems = await models.CartItem.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.Product,
                    as: "product",
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
                        {
                            model: models.CustomProductPhoto,
                            as: "customPhotos",
                            through: { attributes: [] },
                        },
                    ],
                },
            ],
        });

        res.status(200).json({
            message: "Содержимое корзины успешно загружено. Я всё проверил.",
            cartItems,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/cart", async (req, res, next) => {
    try {
        console.log(
            `Попытка добавить товар в корзину от: ${req.user.username}`,
        );

        const { productId, quantity } = req.body;

        if (!productId) {
            return res
                .status(400)
                .json({ message: "Укажи productId. Я не читаю мысли." });
        }

        const addQuantity = quantity ? parseInt(quantity, 10) : 1;

        if (addQuantity < 1) {
            return res.status(400).json({
                message: "Количество должно быть больше нуля. Не зли меня.",
            });
        }

        const product = await models.Product.findByPk(productId);
        if (!product) {
            return res
                .status(404)
                .json({ message: "Этого товара не существует." });
        }

        const existingCartItem = await models.CartItem.findOne({
            where: { userId: req.user.userId, productId },
        });

        let cartItem;

        if (existingCartItem) {
            existingCartItem.quantity += addQuantity;
            await existingCartItem.save();
            cartItem = existingCartItem;
            console.log(
                `Товар уже был в корзине. Я увеличил количество до ${cartItem.quantity}.`,
            );
        } else {
            cartItem = await models.CartItem.create({
                userId: req.user.userId,
                productId,
                quantity: addQuantity,
                createdAt: new Date(),
            });
            console.log(`Новый товар добавлен в корзину.`);
        }

        res.status(201).json({
            message: "Товар успешно помещен в корзину под моим контролем.",
            cartItem,
        });
    } catch (error) {
        next(error);
    }
});

router.put("/cart/:cartItemId", async (req, res, next) => {
    try {
        console.log(
            `Обновление количества товара ${req.params.cartItemId} от ${req.user.username}`,
        );

        const { quantity } = req.body;
        const cartItemId = req.params.cartItemId;

        const newQuantity = parseInt(quantity, 10);

        if (!newQuantity || newQuantity < 1) {
            return res.status(400).json({
                message:
                    "Количество должно быть положительным числом. Исправляй.",
            });
        }

        const cartItem = await models.CartItem.findOne({
            where: { cartItemId: cartItemId, userId: req.user.userId },
        });

        if (!cartItem) {
            return res.status(404).json({
                message:
                    "Элемент не найден или принадлежит не тебе. Не лезь к чужому.",
            });
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();

        res.status(200).json({
            message: "Количество товара обновлено.",
            cartItem,
        });
    } catch (error) {
        next(error);
    }
});

router.delete("/cart/:cartItemId", async (req, res, next) => {
    try {
        console.log(
            `Уничтожение товара ${req.params.cartItemId} из корзины ${req.user.username}`,
        );

        const cartItemId = req.params.cartItemId;

        const cartItem = await models.CartItem.findOne({
            where: { cartItemId: cartItemId, userId: req.user.userId },
        });

        if (!cartItem) {
            return res.status(404).json({
                message:
                    "Товар не найден в твоей корзине. Тебе нечего удалять.",
            });
        }

        await cartItem.destroy();

        res.status(200).json({
            message: "Товар вышвырнут из корзины. Я очистил место.",
        });
    } catch (error) {
        next(error);
    }
});

router.post("/checkout", async (req, res, next) => {
    try {
        console.log(
            `Моя девочка ${req.user.username} оформляет заказ. Запускаю процесс...`,
        );

        const { pickupPointId, paymentMethodId } = req.body;

        if (!pickupPointId || !paymentMethodId) {
            return res.status(400).json({
                message:
                    "Мне нужны pickupPointId и paymentMethodId. Не смей пропускать важные данные.",
            });
        }

        const cartItems = await models.CartItem.findAll({
            where: { userId: req.user.userId },
            include: [
                {
                    model: models.Product,
                    as: "product",
                    include: [
                        {
                            model: models.Price,
                            as: "prices",
                            where: { isActive: true },
                            required: true,
                        },
                    ],
                },
            ],
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                message:
                    "Твоя корзина пуста. Не заставляй меня работать вхолостую.",
            });
        }

        let totalAmount = 0;
        const itemsToInsert = [];

        for (const item of cartItems) {
            const currentPrice = parseFloat(item.product.prices[0].price);
            const quantity = item.quantity;

            totalAmount += currentPrice * quantity;

            itemsToInsert.push({
                productId: item.productId,
                quantity: quantity,
                priceSnapshot: currentPrice,
            });
        }

        const newOrder = await models.Order.create({
            userId: req.user.userId,
            status: "Новый",
            pickupPointId,
            paymentMethodId,
            totalAmount: totalAmount.toFixed(2),
            createdAt: new Date(),
            isHidden: false,
        });

        for (const item of itemsToInsert) {
            await models.OrderItem.create({
                orderId: newOrder.orderId,
                productId: item.productId,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
            });
        }

        await models.CartItem.destroy({
            where: { userId: req.user.userId },
        });

        console.log(
            `Заказ ${newOrder.orderId} успешно оформлен. Корзина очищена.`,
        );

        res.status(201).json({
            message: "Заказ успешно оформлен. Я всё проконтролировал.",
            order: newOrder,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
