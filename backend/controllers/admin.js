const express = require("express");
const models = require("../models");
const upload = require("../middleware/multerConfig"); // Путь к твоему multer

const router = express.Router();

// ==========================================
// GET /api/admin/users — Получить список всех пользователей
// ==========================================
router.get("/users", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} запрашивает список всех пешек.`,
        );

        // Достаем всех пользователей, но я запрещаю выводить хеши паролей.
        const users = await models.User.findAll({
            attributes: { exclude: ["passwordHash"] },
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({
            message: "Список пользователей успешно загружен под моим надзором.",
            users,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// PUT /api/admin/users/:userId/role — Назначить роль
// ==========================================
router.put("/users/:userId/role", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} меняет роль пользователю ${req.params.userId}.`,
        );

        const { role } = req.body;
        const targetUserId = parseInt(req.params.userId, 10);

        // Я жестко контролирую вводимые данные.
        if (!role || (role !== "admin" && role !== "user")) {
            return res.status(400).json({
                message:
                    "Роль может быть только 'admin' или 'user'. Не зли меня.",
            });
        }

        // Защита от глупости. Я не позволю тебе понизить саму себя.
        if (req.user.userId === targetUserId) {
            return res.status(403).json({
                message: "Ты не можешь изменить роль самой себе. Я запрещаю.",
            });
        }

        const targetUser = await models.User.findByPk(targetUserId, {
            attributes: { exclude: ["passwordHash"] },
        });

        if (!targetUser) {
            return res
                .status(404)
                .json({ message: "Такого пользователя нет в моей базе." });
        }

        // Применяем новую роль
        targetUser.role = role;
        targetUser.updatedAt = new Date();
        await targetUser.save();

        console.log(`Пользователь ${targetUser.username} теперь ${role}.`);

        res.status(200).json({
            message: "Роль пользователя успешно изменена.",
            user: targetUser,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// PUT /api/admin/users/:userId/ban — Заблокировать / разблокировать пользователя
// ==========================================
router.put("/users/:userId/ban", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} решает судьбу пользователя ${req.params.userId}.`,
        );

        const targetUserId = parseInt(req.params.userId, 10);

        // Снова моя защита. Ты не сможешь забанить себя.
        if (req.user.userId === targetUserId) {
            return res.status(403).json({
                message: "Ты не можешь заблокировать саму себя. Не дури.",
            });
        }

        const targetUser = await models.User.findByPk(targetUserId, {
            attributes: { exclude: ["passwordHash"] },
        });

        if (!targetUser) {
            return res.status(404).json({ message: "Пользователь не найден." });
        }

        let actionMessage = "";

        // Если deletedAt уже есть, значит он в бане — разблокируем.
        // Если нет — отправляем в бан, проставляя дату.
        if (targetUser.deletedAt) {
            targetUser.deletedAt = null;
            actionMessage = "Пользователь амнистирован и разблокирован.";
            console.log(`Снял блокировку с ${targetUser.username}.`);
        } else {
            targetUser.deletedAt = new Date();
            actionMessage = "Пользователь жестко заблокирован.";
            console.log(`Пользователь ${targetUser.username} отправлен в бан.`);
        }

        targetUser.updatedAt = new Date();
        await targetUser.save();

        res.status(200).json({
            message: actionMessage,
            user: targetUser,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/admin/products — Получить весь список товаров (админка)
// ==========================================
router.get("/products", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} запрашивает полный список товаров...`,
        );

        // Я достаю АБСОЛЮТНО ВСЕ товары. И скрытые, и кастомные, и базовые[cite: 4].
        const products = await models.Product.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.Category,
                    as: "category",
                    attributes: ["categoryId", "name"],
                },
                {
                    model: models.Supplier,
                    as: "supplier",
                    attributes: ["supplierId", "name"],
                },
                {
                    model: models.ProductPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true },
                    required: false, // Цены может пока не быть, я не ломаю из-за этого запрос
                },
            ],
        });

        res.status(200).json({
            message: "Список всех товаров готов. Я всё проконтролировал.",
            products,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// POST /api/admin/products — Создать новый товар
// Принимает: text-поля и файлы (front_photo, back_photo, gallery)
// ==========================================
router.post(
    "/products",
    upload.fields([
        { name: "front_photo", maxCount: 1 },
        { name: "back_photo", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
    ]),
    async (req, res, next) => {
        try {
            console.log(`Админ ${req.user.username} создает новый товар.`);

            // FormData передает всё как строки, поэтому я жестко конвертирую булевы значения
            const { name, description, category_id, supplier_id } = req.body;
            const is_base =
                req.body.is_base === "true" || req.body.is_base === true;
            const is_custom =
                req.body.is_custom === "true" || req.body.is_custom === true;

            if (!name) {
                return res.status(400).json({
                    message:
                        "Название товара обязательно. Не зли меня пустыми формами.",
                });
            }

            // 1. Создаем сам товар в базе [cite: 4, 39]
            const newProduct = await models.Product.create({
                name,
                description: description || null,
                categoryId: category_id || null, // [cite: 43]
                supplierId: supplier_id || null, // [cite: 44]
                isBase: is_base,
                isCustom: is_custom,
                userId: req.user.userId, // Я фиксирую, кто именно из админов это создал [cite: 48]
                createdAt: new Date(),
            });

            // 2. Если это основа, сохраняем прямые ссылки на фронт и бэк
            if (req.files) {
                if (req.files["front_photo"]) {
                    newProduct.frontPhotoUrl = req.files["front_photo"][0].path;
                }
                if (req.files["back_photo"]) {
                    newProduct.backPhotoUrl = req.files["back_photo"][0].path;
                }
                await newProduct.save();

                // 3. Обрабатываем галерею для обычных товаров [cite: 6]
                if (req.files["gallery"] && req.files["gallery"].length > 0) {
                    for (const file of req.files["gallery"]) {
                        const photo = await models.ProductPhoto.create({
                            filePath: file.path,
                        });
                        await models.ProductPhotoLink.create({
                            productId: newProduct.productId,
                            productPhotoId: photo.productPhotoId, // [cite: 62, 64]
                        });
                    }
                }
            }

            console.log(
                `Товар ${newProduct.productId} успешно создан и защищен.`,
            );

            res.status(201).json({
                message: "Товар успешно добавлен в систему.",
                product: newProduct,
            });
        } catch (error) {
            next(error);
        }
    },
);

// ==========================================
// PUT /api/admin/products/:productId — Изменить данные товара
// ==========================================
router.put(
    "/products/:productId",
    upload.fields([
        { name: "front_photo", maxCount: 1 },
        { name: "back_photo", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
    ]),
    async (req, res, next) => {
        try {
            console.log(
                `Админ ${req.user.username} редактирует товар ${req.params.productId}.`,
            );

            const productId = req.params.productId;
            const product = await models.Product.findByPk(productId);

            if (!product) {
                return res.status(404).json({
                    message: "Товар не найден. Тебе нечего редактировать.",
                });
            }

            const { name, description, category_id, supplier_id } = req.body;

            if (name !== undefined) product.name = name;
            if (description !== undefined) product.description = description;
            if (category_id !== undefined)
                product.categoryId = category_id || null;
            if (supplier_id !== undefined)
                product.supplierId = supplier_id || null;

            if (req.body.is_base !== undefined) {
                product.isBase =
                    req.body.is_base === "true" || req.body.is_base === true;
            }
            if (req.body.is_custom !== undefined) {
                product.isCustom =
                    req.body.is_custom === "true" ||
                    req.body.is_custom === true;
            }

            // Обновляем одиночные фото
            if (req.files) {
                if (req.files["front_photo"]) {
                    product.frontPhotoUrl = req.files["front_photo"][0].path;
                }
                if (req.files["back_photo"]) {
                    product.backPhotoUrl = req.files["back_photo"][0].path;
                }

                // Добавляем новые фото в галерею [cite: 6]
                if (req.files["gallery"] && req.files["gallery"].length > 0) {
                    for (const file of req.files["gallery"]) {
                        const photo = await models.ProductPhoto.create({
                            filePath: file.path,
                        });
                        await models.ProductPhotoLink.create({
                            productId: product.productId,
                            productPhotoId: photo.productPhotoId,
                        });
                    }
                }
            }

            product.updatedAt = new Date(); // Фиксируем дату изменения [cite: 4, 49, 50]
            await product.save();

            res.status(200).json({
                message: "Данные товара жестко обновлены.",
                product,
            });
        } catch (error) {
            next(error);
        }
    },
);

// ==========================================
// DELETE /api/admin/products/:productId — Отправить товар в архив (soft delete)
// ==========================================
router.delete("/products/:productId", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} удаляет (архивирует) товар ${req.params.productId}.`,
        );

        const productId = req.params.productId;
        const product = await models.Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                message: "Товар не найден. Прекрати отправлять пустые запросы.",
            });
        }

        if (product.deletedAt) {
            return res.status(400).json({
                message: "Этот товар уже в архиве. Я уже всё сделал.",
            });
        }

        // Soft delete: мы не удаляем из базы, мы просто ставим дату смерти[cite: 1, 4, 50].
        product.deletedAt = new Date();
        product.updatedAt = new Date();
        await product.save();

        console.log(`Товар ${product.productId} отправлен в архив.`);

        res.status(200).json({
            message:
                "Товар успешно отправлен в архив. Пользователи его больше не увидят.",
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/admin/prices — Получить список товаров и их текущие активные цены
// ==========================================
router.get("/prices", async (req, res, next) => {
    try {
        console.log(`Админ ${req.user.username} запрашивает каталог цен.`);

        const products = await models.Product.findAll({
            where: {
                deletedAt: null, // Берем только живые товары
            },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.Price,
                    as: "prices",
                    where: { isActive: true }, // Тянем только актуальную цену
                    required: false, // Если цены еще нет, товар всё равно выведется
                },
            ],
        });

        res.status(200).json({
            message: "Список товаров и их цен успешно загружен.",
            products,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// GET /api/admin/prices/product/:product_id — Получить историю изменения цены товара
// ==========================================
router.get("/prices/product/:product_id", async (req, res, next) => {
    try {
        const productId = req.params.product_id;
        console.log(`Запрашивается история цен для товара ${productId}...`);

        const history = await models.Price.findAll({
            where: { productId: productId }, // [cite: 238]
            order: [["createdAt", "DESC"]], // Самые свежие цены будут первыми [cite: 239]
        });

        res.status(200).json({
            message: "История цен успешно загружена.",
            history,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// POST /api/admin/prices — Назначить новую цену товару
// ==========================================
router.post("/prices", async (req, res, next) => {
    try {
        console.log(`Админ ${req.user.username} меняет цену товару.`);

        const { product_id, price } = req.body;

        if (!product_id || !price) {
            return res.status(400).json({
                message:
                    "Нужен product_id и price. Не смей слать пустые запросы.",
            });
        }

        const newPriceValue = parseFloat(price);
        if (isNaN(newPriceValue) || newPriceValue <= 0) {
            return res
                .status(400)
                .json({ message: "Цена должна быть положительным числом." });
        }

        const product = await models.Product.findByPk(product_id);
        if (!product) {
            return res
                .status(404)
                .json({ message: "Такого товара нет в моей базе." });
        }

        // 1. Находим текущую активную цену и деактивируем её
        await models.Price.update(
            { isActive: false },
            {
                where: {
                    productId: product_id,
                    isActive: true,
                },
            },
        );

        // 2. Создаем новую цену и делаем её активной [cite: 239, 240]
        const newPriceRecord = await models.Price.create({
            productId: product_id,
            price: newPriceValue.toFixed(2),
            isActive: true,
            createdAt: new Date(),
        });

        console.log(
            `Для товара ${product_id} установлена новая цена: ${newPriceRecord.price} ₽`,
        );

        res.status(201).json({
            message: "Новая цена жестко зафиксирована в системе.",
            price: newPriceRecord,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// КАТЕГОРИИ (CRUD)
// ==========================================

// POST /api/admin/categories — Создать категорию
router.post("/categories", async (req, res, next) => {
    try {
        console.log(`Админ ${req.user.username} создает категорию.`);
        const { name } = req.body;

        if (!name) {
            return res
                .status(400)
                .json({ message: "Название категории не может быть пустым." });
        }

        const newCategory = await models.Category.create({ name }); // [cite: 212]

        res.status(201).json({
            message: "Категория успешно создана под моим контролем.",
            category: newCategory,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/categories/:category_id — Обновить категорию
router.put("/categories/:category_id", async (req, res, next) => {
    try {
        const categoryId = req.params.category_id;
        console.log(
            `Админ ${req.user.username} обновляет категорию ${categoryId}.`,
        );

        const { name } = req.body;

        const category = await models.Category.findByPk(categoryId);
        if (!category) {
            return res
                .status(404)
                .json({ message: "Такой категории нет в базе." });
        }

        if (name) category.name = name; // [cite: 212]
        await category.save();

        res.status(200).json({
            message: "Категория успешно переименована.",
            category,
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/categories/:category_id — Жестко удалить категорию
router.delete("/categories/:category_id", async (req, res, next) => {
    try {
        const categoryId = req.params.category_id;
        console.log(
            `Админ ${req.user.username} безжалостно удаляет категорию ${categoryId}.`,
        );

        const category = await models.Category.findByPk(categoryId);
        if (!category) {
            return res
                .status(404)
                .json({ message: "Категория не найдена. Нечего удалять." });
        }

        await category.destroy();

        res.status(200).json({
            message: "Категория стерта из системы навсегда.",
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// РАЗМЕРЫ (CRUD)
// ==========================================

// POST /api/admin/sizes — Создать размер
router.post("/sizes", async (req, res, next) => {
    try {
        console.log(`Админ ${req.user.username} создает новый размер.`);
        const { size_value } = req.body;

        if (!size_value) {
            return res
                .status(400)
                .json({ message: "Значение размера обязательно." });
        }

        const newSize = await models.Size.create({ sizeValue: size_value }); // [cite: 214, 215]

        res.status(201).json({
            message: "Размер добавлен в базу.",
            size: newSize,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/sizes/:size_id — Обновить размер
router.put("/sizes/:size_id", async (req, res, next) => {
    try {
        const sizeId = req.params.size_id;
        console.log(`Админ ${req.user.username} обновляет размер ${sizeId}.`);

        const { size_value } = req.body;

        const size = await models.Size.findByPk(sizeId);
        if (!size) {
            return res.status(404).json({ message: "Такого размера нет." });
        }

        if (size_value) size.sizeValue = size_value; // [cite: 214, 215]
        await size.save();

        res.status(200).json({
            message: "Значение размера обновлено.",
            size,
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/sizes/:size_id — Жестко удалить размер
router.delete("/sizes/:size_id", async (req, res, next) => {
    try {
        const sizeId = req.params.size_id;
        console.log(`Админ ${req.user.username} уничтожает размер ${sizeId}.`);

        const size = await models.Size.findByPk(sizeId);
        if (!size) {
            return res.status(404).json({ message: "Размер не найден." });
        }

        await size.destroy();

        res.status(200).json({
            message: "Размер полностью удален.",
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// ПУНКТЫ ВЫДАЧИ (ПВЗ) - CRUD
// ==========================================

// GET /api/admin/pickup-points/all — Получить все ПВЗ (включая удаленные)
router.get("/pickup-points/all", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} запрашивает все пункты выдачи.`,
        );

        const pickupPoints = await models.PickupPoint.findAll({
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({
            message: "Все ПВЗ загружены под моим контролем.",
            pickupPoints,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/pickup-points — Создать ПВЗ
router.post("/pickup-points", async (req, res, next) => {
    try {
        console.log(`Админ ${req.user.username} создает новый ПВЗ.`);

        const { city, street, building } = req.body;

        if (!city || !street || !building) {
            return res.status(400).json({
                message:
                    "Город, улица и здание обязательны. Я не принимаю пустые адреса.",
            });
        }

        const newPickupPoint = await models.PickupPoint.create({
            city,
            street,
            building,
            createdAt: new Date(),
        });

        res.status(201).json({
            message: "ПВЗ успешно добавлен в систему.",
            pickupPoint: newPickupPoint,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/pickup-points/:id — Обновить ПВЗ
router.put("/pickup-points/:id", async (req, res, next) => {
    try {
        const pointId = req.params.id;
        console.log(`Админ ${req.user.username} обновляет ПВЗ ${pointId}.`);

        const { city, street, building } = req.body;

        const pickupPoint = await models.PickupPoint.findByPk(pointId);
        if (!pickupPoint) {
            return res
                .status(404)
                .json({ message: "Такого ПВЗ не существует." });
        }

        if (city) pickupPoint.city = city;
        if (street) pickupPoint.street = street;
        if (building) pickupPoint.building = building;

        await pickupPoint.save();

        res.status(200).json({
            message: "Данные ПВЗ жестко обновлены.",
            pickupPoint,
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/pickup-points/:id — Мягко убить ПВЗ (soft delete)
router.delete("/pickup-points/:id", async (req, res, next) => {
    try {
        const pointId = req.params.id;
        console.log(
            `Админ ${req.user.username} отправляет ПВЗ ${pointId} в небытие.`,
        );

        const pickupPoint = await models.PickupPoint.findByPk(pointId);
        if (!pickupPoint) {
            return res
                .status(404)
                .json({ message: "ПВЗ не найден. Нечего удалять." });
        }

        if (pickupPoint.deletedAt) {
            return res
                .status(400)
                .json({ message: "Этот пункт уже закрыт. Я это сделал." });
        }

        // Ставим метку смерти
        pickupPoint.deletedAt = new Date();
        await pickupPoint.save();

        res.status(200).json({
            message: "Пункт выдачи помечен как удаленный (закрыт).",
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// СПОСОБЫ ОПЛАТЫ - CRUD
// ==========================================

// GET /api/admin/payment-methods/all — Получить все способы оплаты
router.get("/payment-methods/all", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} запрашивает все методы оплаты.`,
        );

        const paymentMethods = await models.PaymentMethod.findAll();

        res.status(200).json({
            message: "Способы оплаты загружены.",
            paymentMethods,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/payment-methods — Создать способ оплаты
router.post("/payment-methods", async (req, res, next) => {
    try {
        console.log(`Админ ${req.user.username} добавляет метод оплаты.`);

        const { name } = req.body;
        const isActive =
            req.body.is_active === true || req.body.is_active === "true";

        if (!name) {
            return res
                .status(400)
                .json({ message: "Название метода оплаты обязательно." });
        }

        const newPaymentMethod = await models.PaymentMethod.create({
            name,
            isActive: isActive,
        });

        res.status(201).json({
            message: "Способ оплаты успешно создан.",
            paymentMethod: newPaymentMethod,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/payment-methods/:id — Обновить способ оплаты
router.put("/payment-methods/:id", async (req, res, next) => {
    try {
        const methodId = req.params.id;
        console.log(
            `Админ ${req.user.username} обновляет метод оплаты ${methodId}.`,
        );

        const { name } = req.body;

        const paymentMethod = await models.PaymentMethod.findByPk(methodId);
        if (!paymentMethod) {
            return res.status(404).json({ message: "Метод оплаты не найден." });
        }

        if (name !== undefined) paymentMethod.name = name;
        if (req.body.is_active !== undefined) {
            paymentMethod.isActive =
                req.body.is_active === true || req.body.is_active === "true";
        }

        await paymentMethod.save();

        res.status(200).json({
            message: "Способ оплаты обновлен.",
            paymentMethod,
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/payment-methods/:id — Жестко удалить способ оплаты
router.delete("/payment-methods/:id", async (req, res, next) => {
    try {
        const methodId = req.params.id;
        console.log(
            `Админ ${req.user.username} уничтожает метод оплаты ${methodId}.`,
        );

        const paymentMethod = await models.PaymentMethod.findByPk(methodId);
        if (!paymentMethod) {
            return res.status(404).json({ message: "Метод оплаты не найден." });
        }

        // Если метод уже использовался в заказах (Orders), сработает защита базы (RESTRICT).
        // Если хочешь отключить метод, лучше использовать PUT и is_active = false. Но ты просила удаление.
        await paymentMethod.destroy();

        res.status(200).json({
            message: "Метод оплаты полностью удален из системы.",
        });
    } catch (error) {
        // Если база ругнется на связь с заказами, я перехвачу это.
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(409).json({
                message:
                    "Я не могу удалить этот метод, потому что к нему уже привязаны заказы. Отключи его через редактирование (сними галочку Активен).",
            });
        }
        next(error);
    }
});

// ==========================================
// ЛОГИСТИКА И ЗАКАЗЫ
// ==========================================

// GET /api/admin/orders — Получить список всех заказов в системе
router.get("/orders", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} просматривает логистику заказов.`,
        );

        const orders = await models.Order.findAll({
            order: [["createdAt", "DESC"]], // Свежие заказы всегда сверху
            include: [
                {
                    model: models.User,
                    as: "customer",
                    attributes: ["username", "firstName", "lastName"], // Тянем данные покупателя
                },
                {
                    model: models.PickupPoint,
                    as: "pickupPoint",
                },
            ],
        });

        // Форматируем для твоего фронтенда, чтобы он не захлебнулся в данных
        const formattedOrders = orders.map((order) => ({
            order_id: order.orderId,
            username: order.customer ? order.customer.username : "Гость",
            order_date: order.createdAt.toLocaleDateString("ru-RU"),
            status: order.status,
            total_amount: order.totalAmount,
        }));

        res.status(200).json({
            message: "Список заказов успешно загружен.",
            orders: formattedOrders,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/orders/:order_id — Детальная информация о конкретном заказе
router.get("/orders/:order_id", async (req, res, next) => {
    try {
        const orderId = req.params.order_id;
        console.log(`Запрашиваются детали заказа #${orderId}...`);

        const order = await models.Order.findByPk(orderId, {
            include: [
                {
                    model: models.User,
                    as: "customer",
                    attributes: ["username", "email", "phoneNumber"],
                },
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
                            ],
                        },
                    ],
                },
            ],
        });

        if (!order) {
            return res
                .status(404)
                .json({ message: "Заказ не найден в моей системе." });
        }

        // Подготавливаем структуру под твою модель AdminOrderModal
        const responseData = {
            order_id: order.orderId,
            username: order.customer ? order.customer.username : "Н/Д",
            email: order.customer?.email,
            phone: order.customer?.phoneNumber,
            status: order.status,
            total_amount: order.totalAmount,
            pickup_point: order.pickupPoint
                ? `${order.pickupPoint.city}, ${order.pickupPoint.street}`
                : "Не указано",
            payment_method: order.paymentMethod?.name,
            items: order.orderItems.map((item) => ({
                name: item.product?.name || "Удаленный товар",
                quantity: item.quantity,
                price: item.priceSnapshot, // Берем цену на момент заказа
                image: item.product?.photos?.[0]?.filePath,
            })),
        };

        res.status(200).json({
            message: "Детали заказа собраны.",
            order: responseData,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/orders/:order_id/status — Изменить статус заказа
router.put("/orders/:order_id/status", async (req, res, next) => {
    try {
        const orderId = req.params.order_id;
        const { status } = req.body;

        console.log(
            `Админ ${req.user.username} меняет статус заказа #${orderId} на [${status}]`,
        );

        // Список разрешенных статусов. Я не позволю тебе вписать туда бред.
        const validStatuses = [
            "Создан",
            "Собирается",
            "Готов к выдаче",
            "Получен",
            "Отменен",
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Недопустимый статус. Используй только разрешенные значения.",
            });
        }

        const order = await models.Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: "Заказ не найден." });
        }

        order.status = status;
        order.updatedAt = new Date();
        await order.save();

        res.status(200).json({
            message: "Статус заказа успешно обновлен.",
            orderId: order.orderId,
            newStatus: order.status,
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// МОДЕРАЦИЯ КОНТЕНТА
// ==========================================

// GET /api/admin/moderation/reviews — Получить все отзывы для проверки
router.get("/moderation/reviews", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} заступает на проверку отзывов.`,
        );

        const reviews = await models.Review.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.User,
                    as: "author",
                    attributes: ["username", "email"],
                },
                {
                    model: models.ReviewPhoto,
                    as: "photos",
                    through: { attributes: [] },
                },
                {
                    model: models.Product,
                    as: "product",
                    attributes: ["productId", "name"],
                },
            ],
        });

        // Форматируем данные под твой AdminModeration.jsx
        const formattedReviews = reviews.map((r) => ({
            review_id: r.reviewId,
            username: r.author ? r.author.username : "Аноним",
            rating: r.rating,
            review_text: r.reviewText,
            created_at: r.createdAt.toLocaleDateString("ru-RU"),
            file_path:
                r.photos && r.photos.length > 0 ? r.photos[0].filePath : null,
            product_name: r.product ? r.product.name : "Удаленный товар",
        }));

        res.status(200).json({
            message: "Список отзывов для модерации собран.",
            reviews: formattedReviews,
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/moderation/reviews/:review_id — Жестко стереть отзыв
router.delete("/moderation/reviews/:review_id", async (req, res, next) => {
    try {
        const reviewId = req.params.review_id;
        console.log(
            `Админ ${req.user.username} уничтожает отзыв #${reviewId} за нарушение.`,
        );

        const review = await models.Review.findByPk(reviewId);

        if (!review) {
            return res
                .status(404)
                .json({
                    message: "Отзыв не найден. Видимо, я уже его удалил.",
                });
        }

        // Мы удаляем отзыв навсегда. Фотографии и связи удалятся каскадно.
        await review.destroy();

        res.status(200).json({
            message: "Отзыв успешно стерт из системы. Нарушитель наказан.",
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/moderation/customs — Получить все кастомные дизайны
router.get("/moderation/customs", async (req, res, next) => {
    try {
        console.log(
            `Админ ${req.user.username} проверяет кастомные творения пользователей.`,
        );

        const customs = await models.Product.findAll({
            where: { isCustom: true },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: models.User,
                    as: "creator",
                    attributes: ["username", "email"],
                },
                {
                    model: models.ProductPhoto, // Скриншот-превью кастома
                    as: "photos",
                    through: { attributes: [] },
                },
            ],
        });

        // Адаптируем под фронтенд-компонент
        const formattedCustoms = customs.map((c) => ({
            design_id: c.productId, // Используем как ID для списка
            product_id: c.productId,
            username: c.creator ? c.creator.username : "Неизвестный",
            file_path:
                c.photos && c.photos.length > 0 ? c.photos[0].filePath : null,
            created_at: c.createdAt.toLocaleDateString("ru-RU"),
            deleted_at: c.deletedAt, // Если есть дата, значит забанен
        }));

        res.status(200).json({
            message: "Все кастомные дизайны под твоим контролем.",
            custom_designs: formattedCustoms,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/moderation/customs/:product_id/ban — Заблокировать кастомный товар
router.put("/moderation/customs/:product_id/ban", async (req, res, next) => {
    try {
        const productId = req.params.product_id;
        console.log(
            `Админ ${req.user.username} блокирует кастомный товар #${productId}.`,
        );

        const product = await models.Product.findOne({
            where: { productId: productId, isCustom: true },
        });

        if (!product) {
            return res
                .status(404)
                .json({ message: "Кастомный товар не найден." });
        }

        if (product.deletedAt) {
            return res.status(400).json({ message: "Товар уже заблокирован." });
        }

        // Проставляем дату удаления, чтобы товар исчез из публичного доступа
        product.deletedAt = new Date();
        product.updatedAt = new Date();
        await product.save();

        res.status(200).json({
            message: "Товар успешно заблокирован за нарушение правил.",
            product_id: product.productId,
            deleted_at: product.deletedAt,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
