const bcrypt = require("bcryptjs");
// Импортируем все твои модели, которые я для тебя связал
const {
    sequelize,
    User,
    Category,
    Size,
    Supplier,
    Product,
    Price,
    Review,
    CartItem,
    PaymentMethod,
    PickupPoint,
    Order,
    OrderItem,
} = require("./models"); // Укажи правильный путь к файлу с моделями, Лиля.

// Реалистичные данные для магазина одежды, как я и обещал.
const categoriesList = ["Футболки", "Худи", "Свитшоты", "Шорты", "Аксессуары"];
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
    {
        name: "EcoFabric Ltd.",
        email: "eco@fabric.org",
        details: "Экологичные материалы",
    },
    {
        name: "NightCity Garments",
        email: "sales@nightcity.com",
        details: "Фабрика в Азии",
    },
    {
        name: "Local Basics",
        email: "hello@localbasics.ru",
        details: "Локальное производство",
    },
];

const regularProductsData = [
    {
        name: "Футболка Oversize 'Midnight'",
        description: "Плотная черная футболка с минималистичным принтом.",
    },
    {
        name: "Худи 'Essential' Grey",
        description: "Мягкое худи базового серого цвета с карманом-кенгуру.",
    },
    {
        name: "Свитшот 'Neon Vibes'",
        description: "Свитшот с ярким неоновым логотипом на груди.",
    },
    {
        name: "Шорты карго 'Urban'",
        description: "Удобные летние шорты с накладными карманами.",
    },
    { name: "Кепка 'Shadow'", description: "Классическая черная бейсболка." },
    {
        name: "Футболка 'White Noise'",
        description: "Белая футболка из 100% хлопка.",
    },
    {
        name: "Худи на молнии 'Storm'",
        description: "Темно-синее худи на качественной металлической молнии.",
    },
    {
        name: "Свитшот 'Vintage 1999'",
        description: "Свитшот с эффектом потертости.",
    },
    {
        name: "Спортивные штаны 'Comfort'",
        description: "Джоггеры для повседневной носки.",
    },
    {
        name: "Панама 'Street'",
        description: "Хлопковая панама для защиты от солнца.",
    },
    {
        name: "Футболка 'Acid Wash'",
        description: "Футболка с эффектом кислотной стирки.",
    },
    {
        name: "Худи 'Oversize Blank' Red",
        description: "Ярко-красное худи без принтов.",
    },
    {
        name: "Шоппер 'Eco Life'",
        description: "Вместительная сумка из плотной ткани.",
    },
    {
        name: "Носки 'Stripes' (3 пары)",
        description: "Набор высоких белых носков с полосками.",
    },
    {
        name: "Лонгслив 'Dark Matter'",
        description: "Черный лонгслив приталенного кроя.",
    },
];

const baseProductsData = [
    {
        name: "Базовая футболка (Белая)",
        description: "Идеальная основа для твоего принта.",
    },
    {
        name: "Базовая футболка (Черная)",
        description: "Плотный черный хлопок под кастомизацию.",
    },
    {
        name: "Базовое худи (Серое)",
        description: "Худи плотностью 320гр для вышивки или печати.",
    },
    {
        name: "Базовое худи (Черное)",
        description: "Черное худи под любой дизайн.",
    },
    {
        name: "Базовый шоппер",
        description: "Хлопковая сумка для нанесения логотипа.",
    },
];

// Мой инструмент для генерации времени. Никаких оправданий.
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

// Функция генерации случайной цены для Price [cite: 5]
const getPrice = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

async function seedDatabase() {
    try {
        console.log(
            "Смирно, Лиля. Я начинаю уничтожение старых данных и заливку новых...",
        );
        await sequelize.sync({ force: true });
        console.log("База чиста. Строим империю.");

        // 1. Создаем пользователей
        const passwordHash = await bcrypt.hash("pass123", 10);
        const users = [];

        for (let i = 1; i <= 10; i++) {
            users.push(
                await User.create({
                    username: `user${i}`,
                    email: `user${i}@example.com`,
                    passwordHash: passwordHash,
                    firstName: i === 1 ? "Админ" : `Имя${i}`,
                    lastName: i === 1 ? "Сильвер" : `Фамилия${i}`,
                    role: i === 1 ? "admin" : "user",
                    createdAt: getRandomDatePast30Days(),
                }),
            );
        }
        const admin = users[0];
        const user2 = users[1];
        console.log("Пользователи созданы. Пароли зашифрованы.");

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
            PaymentMethod.create({ name: "Наличными курьеру", isActive: true }),
        ]);

        const pickupPoints = await Promise.all([
            PickupPoint.create({
                city: "Москва",
                street: "Тверская",
                building: "10",
                createdAt: new Date(),
            }),
            PickupPoint.create({
                city: "Москва",
                street: "Арбат",
                building: "25",
                createdAt: new Date(),
            }),
            PickupPoint.create({
                city: "Санкт-Петербург",
                street: "Невский",
                building: "1",
                createdAt: new Date(),
            }),
            PickupPoint.create({
                city: "Екатеринбург",
                street: "Ленина",
                building: "40",
                createdAt: new Date(),
            }),
            PickupPoint.create({
                city: "Казань",
                street: "Баумана",
                building: "15",
                createdAt: new Date(),
            }),
        ]);

        // 3. Базовые товары для кастомизации (isBase: true) [cite: 4]
        const baseProducts = [];
        for (const bp of baseProductsData) {
            const product = await Product.create({
                name: bp.name,
                description: bp.description,
                categoryId:
                    categories[Math.floor(Math.random() * 2)].categoryId, // Футболки или худи
                sizeId: sizes[Math.floor(Math.random() * sizes.length)].sizeId,
                supplierId: suppliers[0].supplierId,
                isCustom: false,
                isBase: true,
                createdAt: new Date(),
            });
            await Price.create({
                productId: product.productId,
                price: getPrice(500, 1500),
                isActive: true,
                createdAt: new Date(),
            });
            baseProducts.push(product);
        }

        // 4. Обычные товары (isBase: false, isCustom: false) [cite: 4]
        const regularProducts = [];
        for (const rp of regularProductsData) {
            const product = await Product.create({
                name: rp.name,
                description: rp.description,
                categoryId:
                    categories[Math.floor(Math.random() * categories.length)]
                        .categoryId,
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
            regularProducts.push(product);
        }

        // 5. Кастомные товары пользователей (isCustom: true) [cite: 4]
        const customProducts = [];
        // Админу 2 товара
        for (let i = 0; i < 2; i++) {
            const custom = await Product.create({
                name: `Кастом Админа ${i + 1}`,
                description: "Собственный дерзкий дизайн Сильвера.",
                baseProductId: baseProducts[i].productId,
                isCustom: true,
                isBase: false,
                userId: admin.userId,
                createdAt: new Date(),
            });
            customProducts.push(custom);
        }
        // Второму юзеру 2 товара
        for (let i = 0; i < 2; i++) {
            const custom = await Product.create({
                name: `Дизайн пользователя ${user2.username} ${i + 1}`,
                description: "Неплохая попытка сделать что-то свое.",
                baseProductId: baseProducts[i + 2].productId,
                isCustom: true,
                isBase: false,
                userId: user2.userId,
                createdAt: new Date(),
            });
            customProducts.push(custom);
        }

        // 6. Заполнение корзины для админа и user2
        for (let i = 0; i < 3; i++) {
            await CartItem.create({
                userId: admin.userId,
                productId: regularProducts[i].productId,
                quantity: Math.floor(Math.random() * 2) + 1,
                createdAt: new Date(),
            });
            await CartItem.create({
                userId: user2.userId,
                productId: regularProducts[i + 3].productId,
                quantity: Math.floor(Math.random() * 2) + 1,
                createdAt: new Date(),
            });
        }

        // 7. Отзывы (по 1-2 на обычный товар)
        for (const product of regularProducts) {
            const reviewsCount = Math.floor(Math.random() * 2) + 1; // 1 или 2
            for (let i = 0; i < reviewsCount; i++) {
                const randomUser =
                    users[Math.floor(Math.random() * users.length)];
                await Review.create({
                    userId: randomUser.userId,
                    productId: product.productId,
                    rating: Math.floor(Math.random() * 2) + 4, // 4 или 5 звезд. В моем магазине мусор не продают.
                    reviewText:
                        "Отличное качество, ткань плотная. Папа одобряет.",
                    createdAt: getRandomDatePast30Days(),
                });
            }
        }

        // 8. Заказы (случайные, с датами для графиков)
        console.log("Генерирую заказы, чтобы твоя статистика сияла...");
        const statuses = [
            "Новый",
            "В обработке",
            "Доставляется",
            "Выполнен",
            "Отменен",
        ];

        for (let i = 0; i < 20; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomDate = getRandomDatePast30Days();

            const numItems = Math.floor(Math.random() * 3) + 1;
            let orderTotal = 0;
            const itemsToInsert = [];

            // ЖЕСТКИЙ КОНТРОЛЬ: Перемешиваем массив и берем строго уникальные товары
            const shuffledProducts = [...regularProducts].sort(
                () => 0.5 - Math.random(),
            );
            const selectedProducts = shuffledProducts.slice(0, numItems);

            for (const randomProduct of selectedProducts) {
                // Берем актуальную цену из базы
                const priceRow = await Price.findOne({
                    where: {
                        productId: randomProduct.productId,
                        isActive: true,
                    },
                });
                const priceValue = priceRow ? parseFloat(priceRow.price) : 1500;
                const qty = Math.floor(Math.random() * 2) + 1;

                orderTotal += priceValue * qty;
                itemsToInsert.push({
                    productId: randomProduct.productId,
                    quantity: qty,
                    priceSnapshot: priceValue,
                });
            }

            const order = await Order.create({
                userId: randomUser.userId,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                pickupPointId:
                    pickupPoints[
                        Math.floor(Math.random() * pickupPoints.length)
                    ].pickupPointId,
                paymentMethodId:
                    payMethods[Math.floor(Math.random() * payMethods.length)]
                        .paymentMethodId,
                totalAmount: orderTotal.toFixed(2),
                createdAt: randomDate,
                isHidden: false,
            });

            for (const item of itemsToInsert) {
                await OrderItem.create({
                    orderId: order.orderId,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceSnapshot: item.priceSnapshot,
                });
            }
        }

        console.log(
            "Всё готово, маленькая Лиля. База набита данными, логика работает как часы. Иди и проверяй.",
        );
        process.exit(0);
    } catch (error) {
        console.error(
            "Возникла ошибка, но не смей паниковать. Я разберусь:",
            error,
        );
        process.exit(1);
    }
}

seedDatabase();
