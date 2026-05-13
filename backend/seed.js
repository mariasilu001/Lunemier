const bcrypt = require("bcryptjs");
const {
    sequelize,
    User,
    Category,
    Size,
    Supplier,
    Product,
    Price,
    ProductPhoto,
    ProductPhotoLink,
    Review,
    PaymentMethod,
    PickupPoint,
    Order,
    OrderItem,
} = require("./models");

const categoriesList = [
    "Футболки",
    "Худи",
    "Свитшоты",
    "Шорты",
    "Аксессуары",
    "Платья",
];
const sizesList = ["XS", "S", "M", "L", "XL"];
const suppliersList = [
    {
        name: "Urban Threads Co.",
        email: "contact@urbanthreads.com",
        details: "Премиальный хлопок",
    },
    {
        name: "StreetWear Supply",
        email: "info@streetwear.com",
        details: "Поставщик плотных тканей",
    },
];

// Ровно 9 товаров. Одно фото — один товар. Как я и приказал.
const regularProductsData = [
    {
        name: "Футболка Oversize 'Midnight'",
        description: "Плотная черная футболка.",
        image: "42bafe9e5855594dbbdd6e972905da8d.jpg",
    },
    {
        name: "Худи 'Essential' Grey",
        description: "Мягкое худи базового серого цвета.",
        image: "66db5dec238598304e7c558adefa8f14.jpg",
    },
    {
        name: "Свитшот 'Neon Vibes'",
        description: "Свитшот с ярким неоновым логотипом.",
        image: "69b4bb2b91442ea76cf13a5d762d9609.jpg",
    },
    {
        name: "Шорты карго 'Urban'",
        description: "Удобные летние шорты.",
        image: "86cbed8163100601956345bfd9e52cf8.jpg",
    },
    {
        name: "Кепка 'Shadow'",
        description: "Классическая черная бейсболка.",
        image: "1901adfa8cdf64812d557e6347fb3764.jpg",
    },
    {
        name: "Футболка 'White Noise'",
        description: "Белая футболка из 100% хлопка.",
        image: "6399d4c61384f7f47f187d6a161ca5de.jpg",
    },
    {
        name: "Худи на молнии 'Storm'",
        description: "Темно-синее худи.",
        image: "25547b19146a5036a28d7b5828c3d113.jpg",
    },
    {
        name: "Свитшот 'Vintage 1999'",
        description: "Свитшот с эффектом потертости.",
        image: "678220b8b06a2308ee58802d1690da58.jpg",
    },
    {
        name: "Спортивные штаны 'Comfort'",
        description: "Джоггеры для повседневной носки.",
        image: "b5be5bbce54499ad27426659c049cd2b.jpg",
    },
];

// ЕДИНСТВЕННАЯ база для кастома.
const baseProductsData = [
    {
        name: "Базовое платье под кастом",
        description: "Идеальная основа для твоего дизайна. Перед и спинка.",
        frontImage: "dress-front7213252346.png",
        backImage: "dress-back128978435673.png",
    },
];

const getRandomDatePast30Days = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        0,
    );
    return date;
};

const getPrice = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

async function seedDatabase() {
    try {
        console.log(
            "Слушай внимательно, Лиля. Я запускаю скрипт и очищаю твою базу...",
        );
        await sequelize.sync({ force: true });
        console.log(
            "База стерильна. Начинаю заливку данных под моим жестким контролем.",
        );

        // 1. Пользователи
        const passwordHash = await bcrypt.hash("pass123", 10);
        const users = [];

        for (let i = 1; i <= 10; i++) {
            users.push(
                await User.create({
                    username: `user${i}`,
                    email: `user${i}@example.com`,
                    passwordHash: passwordHash,
                    firstName: i === 1 ? "Сильвер" : `Имя${i}`,
                    lastName: i === 1 ? "Админ" : `Фамилия${i}`,
                    role: i === 1 ? "admin" : "user",
                    createdAt: getRandomDatePast30Days(),
                }),
            );
        }

        // 2. Справочники
        const categories = [];
        for (const name of categoriesList) {
            categories.push(await Category.create({ name }));
        }

        const sizes = [];
        for (const val of sizesList) {
            sizes.push(await Size.create({ sizeValue: val }));
        }

        const suppliers = [];
        for (const s of suppliersList) {
            suppliers.push(
                await Supplier.create({ ...s, createdAt: new Date() }),
            );
        }

        const payMethods = await Promise.all([
            PaymentMethod.create({ name: "Картой онлайн", isActive: true }),
            PaymentMethod.create({ name: "СБП", isActive: true }),
        ]);

        const pickupPoints = await Promise.all([
            PickupPoint.create({
                city: "Москва",
                street: "Тверская",
                building: "10",
                createdAt: new Date(),
            }),
            PickupPoint.create({
                city: "Санкт-Петербург",
                street: "Невский",
                building: "1",
                createdAt: new Date(),
            }),
        ]);

        // 3. Базовый товар (ЕДИНСТВЕННЫЙ)
        const baseProduct = await Product.create({
            name: baseProductsData[0].name,
            description: baseProductsData[0].description,
            categoryId: categories[5].categoryId, // Платья
            sizeId: sizes[2].sizeId, // M
            supplierId: suppliers[0].supplierId,
            isCustom: false,
            isBase: true,
            frontPhotoUrl: baseProductsData[0].frontImage,
            backPhotoUrl: baseProductsData[0].backImage,
            createdAt: new Date(),
        });

        await Price.create({
            productId: baseProduct.productId,
            price: getPrice(1500, 2000),
            isActive: true,
            createdAt: new Date(),
        });

        // 4. Обычные товары (строго 9 штук с одной картинкой каждый)
        const regularProducts = [];
        for (const rp of regularProductsData) {
            const product = await Product.create({
                name: rp.name,
                description: rp.description,
                categoryId:
                    categories[
                        Math.floor(Math.random() * (categories.length - 1))
                    ].categoryId,
                sizeId: sizes[Math.floor(Math.random() * sizes.length)].sizeId,
                supplierId:
                    suppliers[Math.floor(Math.random() * suppliers.length)]
                        .supplierId,
                isCustom: false,
                isBase: false,
                createdAt: getRandomDatePast30Days(),
            });

            await Price.create({
                productId: product.productId,
                price: getPrice(1000, 5000),
                isActive: true,
                createdAt: new Date(),
            });

            // Правильная привязка фото по твоей архитектуре
            const photo = await ProductPhoto.create({
                filePath: rp.image,
            });

            await ProductPhotoLink.create({
                productId: product.productId,
                productPhotoId: photo.productPhotoId,
            });

            regularProducts.push(product);
        }

        // 5. Отзывы на обычные товары
        for (const product of regularProducts) {
            const reviewsCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < reviewsCount; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                await Review.create({
                    userId: randomUser.userId,
                    productId: product.productId,
                    rating: Math.floor(Math.random() * 2) + 4,
                    reviewText: "Идеальное качество. Папа одобряет.",
                    createdAt: getRandomDatePast30Days(),
                });
            }
        }

        // 6. Заказы за последние 30 дней
        for (let i = 0; i < 15; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomPickup = pickupPoints[Math.floor(Math.random() * pickupPoints.length)];
            const randomPayMethod = payMethods[Math.floor(Math.random() * payMethods.length)];
            const randomProduct = regularProducts[Math.floor(Math.random() * regularProducts.length)];
            const randomQuantity = Math.floor(Math.random() * 3) + 1;
            const priceVal = getPrice(1000, 5000);
            const total = (parseFloat(priceVal) * randomQuantity).toFixed(2);

            const order = await Order.create({
                userId: randomUser.userId,
                status: "Доставлен",
                pickupPointId: randomPickup.pickupPointId,
                paymentMethodId: randomPayMethod.paymentMethodId,
                totalAmount: total,
                createdAt: getRandomDatePast30Days(),
                isHidden: false,
            });

            await OrderItem.create({
                orderId: order.orderId,
                productId: randomProduct.productId,
                quantity: randomQuantity,
                priceSnapshot: priceVal,
            });
        }

        console.log(
            "Всё сделано, моя маленькая Лиля. Твоя база идеальна и покорна моим правилам. Успокойся, сделай вдох — твой папа обо всем позаботился.",
        );
        process.exit(0);
    } catch (error) {
        console.error(
            "Произошла ошибка. Я разберусь с этим дерьмом, просто смотри и учись:",
            error,
        );
        process.exit(1);
    }
}

seedDatabase();