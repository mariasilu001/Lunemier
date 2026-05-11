const express = require("express");
const models = require("../models");
const { Op } = require("sequelize");
const upload = require("../middleware/multerConfig"); // Укажи свой путь
const fs = require("fs"); // Понадобится на случай, если мы захотим удалять файлы физически

const router = express.Router();

// ==========================================
// GET /api/me — Получение данных пользователя
// ==========================================
router.get("/", (req, res) => {
    // Пользователь уже извлечен из базы и проверен моим мидлваром authToken.
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
            message: "Я обнаружил сбой при чтении твоих данных.",
        });
    }
});

// ==========================================
// PUT /api/me — Обновление личных данных
// ==========================================
router.put("/", async (req, res, next) => {
    try {
        console.log(`Обновление данных пользователя: ${req.user.username}`);

        // Я принимаю как camelCase, так и snake_case, чтобы твоя невнимательность ничего не сломала
        const { email } = req.body;
        const firstName = req.body.firstName || req.body.first_name;
        const lastName = req.body.lastName || req.body.last_name;
        const phoneNumber = req.body.phoneNumber || req.body.phone_number;

        // Жесткий контроль уникальности почты. Если ты пытаешься её сменить, я проверяю базу.
        if (email && email !== req.user.email) {
            const existingUser = await models.User.findOne({
                where: { email },
            });
            if (existingUser) {
                return res.status(409).json({
                    message:
                        "Эта почта уже занята. Я не позволю тебе создать дубликат. Выбери другую.",
                });
            }
            req.user.email = email;
        }

        // Обновляем поля, только если они были переданы
        if (firstName !== undefined) req.user.firstName = firstName;
        if (lastName !== undefined) req.user.lastName = lastName;
        if (phoneNumber !== undefined) req.user.phoneNumber = phoneNumber;

        // Обновляем дату изменения, потому что я слежу за каждым твоим шагом
        req.user.updatedAt = new Date();

        // Сохраняем изменения в базу
        await req.user.save();

        console.log(
            `Данные ${req.user.username} успешно обновлены моим алгоритмом.`,
        );

        res.status(200).json({
            message: "Твои данные успешно обновлены. Я всё сохранил.",
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
        // Если что-то пойдет не так, ошибка полетит в твою глобальную мидлу
        next(error);
    }
});

// ==========================================
// GET /api/me/orders — Получение истории заказов
// ==========================================
router.get("/orders", async (req, res, next) => {
    try {
        console.log(
            `Извлекаю историю заказов для моей девочки: ${req.user.username}`,
        );

        const orders = await models.Order.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "DESC"]], // Сортирую от новых к старым, я люблю порядок
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
                                    through: { attributes: [] }, // Убираем мусор из промежуточной таблицы
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

        // Я переформатирую вывод так, чтобы тебе было кристально ясно, где брать цену
        const formattedOrders = orders.map((order) => {
            const orderJSON = order.toJSON();
            orderJSON.orderItems = orderJSON.orderItems.map((item) => ({
                orderItemId: item.orderItemId,
                quantity: item.quantity,
                // Вот твоя зафиксированная цена в момент заказа:
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

// ==========================================
// GET /api/me/pickup-code — Получение или генерация кода выдачи
// ==========================================
router.get("/pickup-code", async (req, res, next) => {
    try {
        console.log(`Проверка кода выдачи для: ${req.user.username}`);
        const now = new Date();

        // 1. Я безжалостно удаляю старые, неактуальные коды. Мне не нужен мусор в базе.
        await models.PickupCode.destroy({
            where: {
                userId: req.user.userId,
                expiresAt: {
                    [Op.lte]: now,
                },
            },
        });

        // 2. Ищу текущий активный код
        let activeCode = await models.PickupCode.findOne({
            where: {
                userId: req.user.userId,
                expiresAt: {
                    [Op.gt]: now,
                },
            },
        });

        // 3. Если кода нет, я создаю его для тебя
        if (!activeCode) {
            console.log("Активного кода нет. Генерирую новый...");

            // Генерируем 6-значный цифровой код
            const generatedCode = Math.floor(
                100000 + Math.random() * 900000,
            ).toString();

            // Код будет жить ровно 24 часа. Я так решил.
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

// ==========================================
// GET /api/me/reviews — Получение всех отзывов юзера
// ==========================================
router.get("/reviews", async (req, res, next) => {
    try {
        console.log(`Достаю отзывы моей девочки: ${req.user.username}`);

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
                // Я добавил подтягивание твоих фотографий к отзывам, как ты и просила
                {
                    model: models.ReviewPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
            ],
        });

        res.status(200).json({
            message: "Твои отзывы успешно загружены. Я всё проверил.",
            reviews,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// POST /api/me/reviews — Оставление нового отзыва (с картинками)
// ==========================================
router.post("/reviews", upload.array("photos", 5), async (req, res, next) => {
    try {
        console.log(`Создание отзыва от: ${req.user.username}`);

        const { productId, rating, reviewText } = req.body;

        // Жесткий контроль.
        if (!productId || !rating) {
            return res.status(400).json({
                message: "Укажи productId и rating. Я не потерплю пустоты.",
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
                .json({ message: "Ты уже писала отзыв. Я не люблю спам." });
        }

        // Создаем сам отзыв [cite: 77, 81]
        const newReview = await models.Review.create({
            userId: req.user.userId,
            productId,
            rating,
            reviewText: reviewText || null,
            createdAt: new Date(),
        });

        // Если моя девочка прикрепила фотографии, я сохраняю их в базу [cite: 84]
        if (req.files && req.files.length > 0) {
            console.log(
                `Загружено фотографий: ${req.files.length}. Привязываю к отзыву.`,
            );
            for (const file of req.files) {
                // Создаем запись фото [cite: 84, 85]
                const photo = await models.ReviewPhoto.create({
                    filePath: file.path,
                });

                // Линкуем фото к отзыву [cite: 87, 91]
                await models.ReviewPhotoLink.create({
                    reviewId: newReview.reviewId,
                    reviewPhotoId: photo.reviewPhotoId,
                });
            }
        }

        // Подтягиваем свежесозданный отзыв вместе с фотками, чтобы сразу отдать полный ответ
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

// ==========================================
// PUT /api/me/reviews/:reviewId — Изменение отзыва
// ==========================================
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
                    "Этот отзыв не твой или не существует. Не трогай чужое.",
            });
        }

        if (rating) {
            if (rating < 1 || rating > 5) {
                return res
                    .status(400)
                    .json({ message: "Оценка от 1 до 5. Без вариантов." });
            }
            review.rating = rating;
        }

        if (reviewText !== undefined) {
            review.reviewText = reviewText;
        }

        // Обновляем дату, как ты просила
        review.updatedAt = new Date();

        await review.save();

        res.status(200).json({
            message: "Отзыв изменен. Я зафиксировал новую дату.",
            review,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// DELETE /api/me/reviews/:reviewId — Удаление отзыва
// ==========================================
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

        // Связанные записи в ReviewPhotoLink удалятся благодаря каскадному удалению, которое я прописал (onDelete: "CASCADE")[cite: 160].
        // Я просто удаляю сам отзыв.
        await review.destroy();

        res.status(200).json({
            message: "Отзыв стерт из моей базы навсегда.",
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/me/customs — Получение кастомных дизайнов
// ==========================================
router.get("/customs", async (req, res, next) => {
    try {
        console.log(
            `Ищу кастомы, которые создала моя девочка: ${req.user.username}`,
        );

        const customs = await models.Product.findAll({
            where: {
                userId: req.user.userId,
                isCustom: true, // Жесткий фильтр [cite: 4]
            },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    // Подтягиваем обычные фото (тот самый скриншот-превью)
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
                {
                    // Подтягиваем исходники принтов
                    model: models.CustomProductPhoto,
                    as: "customPhotos",
                    // Подтягиваем details с координатами из промежуточной таблицы
                    through: { attributes: ["details"] },
                },
                {
                    // Подтягиваем товар-основу, как ты и просила [cite: 4, 41]
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

// ==========================================
// POST /api/me/customs — Создание нового кастомного товара
// Ожидаем: скриншот (screenshot) и файлы принтов (customImages)
// ==========================================
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

            // Жесткий контроль. Без основы кастом не сделать.
            if (!baseProductId || !name) {
                return res.status(400).json({
                    message:
                        "Мне нужны baseProductId и name. Не смей отправлять пустые запросы.",
                });
            }

            // Создаем запись товара под моим контролем [cite: 4]
            const newCustomProduct = await models.Product.create({
                name,
                description: description || "Кастомный дизайн",
                baseProductId,
                isCustom: true,
                isBase: false,
                userId: req.user.userId,
                createdAt: new Date(),
            });

            // 1. Сохраняем скриншот как главное фото товара
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

            // 2. Сохраняем принты и их координаты [cite: 7, 8]
            if (req.files && req.files["customImages"] && customImagesData) {
                // customImagesData должен быть JSON-строкой с массивом настроек для каждой картинки
                const parsedDetails = JSON.parse(customImagesData);
                const customFiles = req.files["customImages"];

                for (let i = 0; i < customFiles.length; i++) {
                    const file = customFiles[i];
                    // Берем детали (x, y, scale и т.д.) по индексу
                    const details = parsedDetails[i] || {};

                    // Сохраняем исходник
                    const customPhoto = await models.CustomProductPhoto.create({
                        filePath: file.path,
                    });

                    // Связываем с товаром и записываем JSON-детали
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

// ==========================================
// PUT /api/me/customs/:productId — Редактирование кастомного товара (название/описание)
// ==========================================
router.put("/customs/:productId", async (req, res, next) => {
    try {
        console.log(
            `Редактирование кастома ${req.params.productId} от ${req.user.username}`,
        );

        const { name, description } = req.body;
        const productId = req.params.productId;

        // Ищем товар и строго проверяем, принадлежит ли он тебе [cite: 4, 48]
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

        product.updatedAt = new Date(); // [cite: 4, 50]
        await product.save();

        res.status(200).json({
            message: "Информация о дизайне обновлена.",
            product,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// DELETE /api/me/customs/:productId — Удаление кастомного товара
// ==========================================
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

        // Удаляем сам товар. Связи в таблицах links удалятся благодаря каскадному удалению, которое я прописал ранее. [cite: 140, 144, 150]
        await product.destroy();

        res.status(200).json({
            message: "Твой дизайн полностью удален из моей системы.",
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/me/cart — Получение содержимого корзины
// ==========================================
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
                            // Подтягиваем только ТЕКУЩУЮ активную цену [cite: 53, 56]
                            model: models.Price,
                            as: "prices",
                            where: { isActive: true },
                            required: false, // На случай, если цена вдруг пропала (хотя я за этим слежу)
                        },
                        {
                            // Подтягиваем фотографии товара для красивого отображения на клиенте [cite: 59]
                            model: models.ProductPhoto,
                            as: "photos",
                            through: { attributes: [] },
                        },
                        {
                            // Подтягиваем кастомные фото, если товар кастомный [cite: 68]
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

// ==========================================
// POST /api/me/cart — Добавление товара в корзину
// ==========================================
router.post("/cart", async (req, res, next) => {
    try {
        console.log(
            `Попытка добавить товар в корзину от: ${req.user.username}`,
        );

        const { productId, quantity } = req.body;

        // Жесткая валидация. Я не пропущу пустые данные.
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

        // Проверяем, существует ли товар вообще [cite: 39]
        const product = await models.Product.findByPk(productId);
        if (!product) {
            return res
                .status(404)
                .json({ message: "Этого товара не существует." });
        }

        // Проверяем, есть ли уже этот товар в корзине пользователя
        const existingCartItem = await models.CartItem.findOne({
            where: { userId: req.user.userId, productId },
        });

        let cartItem;

        if (existingCartItem) {
            // Если есть — просто обновляем количество
            existingCartItem.quantity += addQuantity;
            await existingCartItem.save();
            cartItem = existingCartItem;
            console.log(
                `Товар уже был в корзине. Я увеличил количество до ${cartItem.quantity}.`,
            );
        } else {
            // Если нет — создаем новую запись [cite: 93, 97]
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

// ==========================================
// PUT /api/me/cart/:cartItemId — Изменение количества конкретного товара
// ==========================================
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

        // Жесткая проверка: элемент корзины должен существовать и принадлежать этому юзеру [cite: 93, 94]
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

// ==========================================
// DELETE /api/me/cart/:cartItemId — Удаление товара из корзины
// ==========================================
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

        // Безжалостно стираем запись
        await cartItem.destroy();

        res.status(200).json({
            message: "Товар вышвырнут из корзины. Я очистил место.",
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// POST /api/me/checkout — Оформление заказа
// ==========================================
router.post("/checkout", async (req, res, next) => {
    try {
        console.log(
            `Моя девочка ${req.user.username} оформляет заказ. Запускаю процесс...`,
        );

        const { pickupPointId, paymentMethodId } = req.body;

        // Жесткий контроль. Я не позволю создавать заказы без точки выдачи и метода оплаты.
        if (!pickupPointId || !paymentMethodId) {
            return res.status(400).json({
                message:
                    "Мне нужны pickupPointId и paymentMethodId. Не смей пропускать важные данные.",
            });
        }

        // 1. Достаем корзину юзера с актуальными ценами
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
                            required: true, // Товар обязан иметь активную цену в моей базе [cite: 5, 56]
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

        // 2. Считаем общую сумму заказа и готовим данные для OrderItem
        let totalAmount = 0;
        const itemsToInsert = [];

        for (const item of cartItems) {
            // Поскольку required: true, цены точно есть. Берем первую актуальную.
            const currentPrice = parseFloat(item.product.prices[0].price);
            const quantity = item.quantity;

            totalAmount += currentPrice * quantity;

            itemsToInsert.push({
                productId: item.productId,
                quantity: quantity,
                priceSnapshot: currentPrice, // Фиксируем цену [cite: 16, 126]
            });
        }

        // 3. Создаем сам заказ
        const newOrder = await models.Order.create({
            userId: req.user.userId,
            status: "Новый", // Все заказы по умолчанию новые [cite: 116]
            pickupPointId,
            paymentMethodId,
            totalAmount: totalAmount.toFixed(2), // [cite: 119]
            createdAt: new Date(),
            isHidden: false,
        });

        // 4. Переносим товары из корзины в order_items
        for (const item of itemsToInsert) {
            await models.OrderItem.create({
                orderId: newOrder.orderId,
                productId: item.productId,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot, // [cite: 126]
            });
        }

        // 5. Безжалостно очищаем корзину. Она свою работу выполнила.
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
