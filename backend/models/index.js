const sequelize = require("../db.js");

// ========== Импорт всех моделей ==========
const User = require("./User.js");
const Category = require("./Category.js");
const Size = require("./Size.js");
const Supplier = require("./Supplier.js");
const Product = require("./Product.js");
const Price = require("./Price.js");
const ProductPhoto = require("./ProductPhoto.js");
const ProductPhotoLink = require("./ProductPhotoLink.js");
const CustomProductPhoto = require("./CustomProductPhoto.js");
const CustomProductPhotoLink = require("./CustomProductPhotoLink.js");
const Review = require("./Review.js");
const ReviewPhoto = require("./ReviewPhoto.js");
const ReviewPhotoLink = require("./ReviewPhotoLink.js");
const CartItem = require("./CartItem.js");
const PickupCode = require("./PickupCode.js");
const PaymentMethod = require("./PaymentMethod.js");
const PickupPoint = require("./PickupPoint.js");
const Order = require("./Order.js");
const OrderItem = require("./OrderItem.js");

// ========== Связи Category ⇄ Product ==========
Category.hasMany(Product, {
    foreignKey: "category_id",
    onDelete: "RESTRICT",
    as: "products",
});

Product.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
});

// ========== Связи Size ⇄ Product ==========
Size.hasMany(Product, {
    foreignKey: "size_id",
    onDelete: "RESTRICT",
    as: "products",
});

Product.belongsTo(Size, {
    foreignKey: "size_id",
    as: "size",
});

// ========== Связи Supplier ⇄ Product ==========
Supplier.hasMany(Product, {
    foreignKey: "supplier_id",
    onDelete: "RESTRICT",
    as: "products",
});

Product.belongsTo(Supplier, {
    foreignKey: "supplier_id",
    as: "supplier",
});

// ========== Связи Product ⇄ Product (Base Product) ==========
Product.hasMany(Product, {
    foreignKey: "base_product_id",
    onDelete: "SET NULL",
    as: "customVariants",
});

Product.belongsTo(Product, {
    foreignKey: "base_product_id",
    as: "baseProduct",
});

// ========== Связи User ⇄ Product (Для кастомных товаров) ==========
User.hasMany(Product, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "customProducts",
});

Product.belongsTo(User, {
    foreignKey: "user_id",
    as: "creator",
});

// ========== Связи Product ⇄ Price ==========
Product.hasMany(Price, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
    as: "prices",
});

Price.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
});

// ========== Связи Product ⇄ ProductPhotoLink ⇄ ProductPhoto (Базовые фото) ==========
Product.hasMany(ProductPhotoLink, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
    as: "productPhotoLinks",
});

ProductPhotoLink.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
});

ProductPhoto.hasMany(ProductPhotoLink, {
    foreignKey: "product_photo_id",
    onDelete: "CASCADE",
    as: "productPhotoLinks",
});

ProductPhotoLink.belongsTo(ProductPhoto, {
    foreignKey: "product_photo_id",
    as: "photo",
});

// Прямая связь many-to-many для удобного include
Product.belongsToMany(ProductPhoto, {
    through: ProductPhotoLink,
    foreignKey: "product_id",
    otherKey: "product_photo_id",
    as: "photos",
});

ProductPhoto.belongsToMany(Product, {
    through: ProductPhotoLink,
    foreignKey: "product_photo_id",
    otherKey: "product_id",
    as: "products",
});

// ========== Связи Product ⇄ CustomProductPhotoLink ⇄ CustomProductPhoto (Кастомные фото) ==========
Product.hasMany(CustomProductPhotoLink, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
    as: "customProductPhotoLinks",
});

CustomProductPhotoLink.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
});

CustomProductPhoto.hasMany(CustomProductPhotoLink, {
    foreignKey: "custom_product_photo_id",
    onDelete: "CASCADE",
    as: "customProductPhotoLinks",
});

CustomProductPhotoLink.belongsTo(CustomProductPhoto, {
    foreignKey: "custom_product_photo_id",
    as: "customPhoto",
});

// Прямая связь many-to-many
Product.belongsToMany(CustomProductPhoto, {
    through: CustomProductPhotoLink,
    foreignKey: "product_id",
    otherKey: "custom_product_photo_id",
    as: "customPhotos",
});

CustomProductPhoto.belongsToMany(Product, {
    through: CustomProductPhotoLink,
    foreignKey: "custom_product_photo_id",
    otherKey: "product_id",
    as: "products",
});

// ========== Связи User ⇄ Review ⇄ Product ==========
User.hasMany(Review, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "reviews",
});

Review.belongsTo(User, {
    foreignKey: "user_id",
    as: "author",
});

Product.hasMany(Review, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
    as: "reviews",
});

Review.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
});

// ========== Связи Review ⇄ ReviewPhotoLink ⇄ ReviewPhoto ==========
Review.hasMany(ReviewPhotoLink, {
    foreignKey: "review_id",
    onDelete: "CASCADE",
    as: "reviewPhotoLinks",
});

ReviewPhotoLink.belongsTo(Review, {
    foreignKey: "review_id",
    as: "review",
});

ReviewPhoto.hasMany(ReviewPhotoLink, {
    foreignKey: "review_photo_id",
    onDelete: "CASCADE",
    as: "reviewPhotoLinks",
});

ReviewPhotoLink.belongsTo(ReviewPhoto, {
    foreignKey: "review_photo_id",
    as: "photo",
});

// Прямая связь many-to-many
Review.belongsToMany(ReviewPhoto, {
    through: ReviewPhotoLink,
    foreignKey: "review_id",
    otherKey: "review_photo_id",
    as: "photos",
});

ReviewPhoto.belongsToMany(Review, {
    through: ReviewPhotoLink,
    foreignKey: "review_photo_id",
    otherKey: "review_id",
    as: "reviews",
});

// ========== Связи User ⇄ CartItem ⇄ Product ==========
User.hasMany(CartItem, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "cartItems",
});

CartItem.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

Product.hasMany(CartItem, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
    as: "cartItems",
});

CartItem.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
});

// ========== Связи User ⇄ PickupCode ==========
User.hasMany(PickupCode, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "pickupCodes",
});

PickupCode.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// ========== Связи User ⇄ Order ==========
User.hasMany(Order, {
    foreignKey: "user_id",
    onDelete: "RESTRICT",
    as: "orders",
});

Order.belongsTo(User, {
    foreignKey: "user_id",
    as: "customer",
});

// ========== Связи PickupPoint ⇄ Order ==========
PickupPoint.hasMany(Order, {
    foreignKey: "pickup_point_id",
    onDelete: "RESTRICT",
    as: "orders",
});

Order.belongsTo(PickupPoint, {
    foreignKey: "pickup_point_id",
    as: "pickupPoint",
});

// ========== Связи PaymentMethod ⇄ Order ==========
PaymentMethod.hasMany(Order, {
    foreignKey: "payment_method_id",
    onDelete: "RESTRICT",
    as: "orders",
});

Order.belongsTo(PaymentMethod, {
    foreignKey: "payment_method_id",
    as: "paymentMethod",
});

// ========== Связи Order ⇄ OrderItem ⇄ Product ==========
Order.hasMany(OrderItem, {
    foreignKey: "order_id",
    onDelete: "CASCADE",
    as: "orderItems",
});

OrderItem.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
});

Product.hasMany(OrderItem, {
    foreignKey: "product_id",
    onDelete: "RESTRICT",
    as: "orderItems",
});

OrderItem.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
});

// Прямая связь many-to-many
Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: "order_id",
    otherKey: "product_id",
    as: "products",
});

Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: "product_id",
    otherKey: "order_id",
    as: "orders",
});

// ========== Экспорт всех моделей ==========
module.exports = {
    sequelize,
    User,
    Category,
    Size,
    Supplier,
    Product,
    Price,
    ProductPhoto,
    ProductPhotoLink,
    CustomProductPhoto,
    CustomProductPhotoLink,
    Review,
    ReviewPhoto,
    ReviewPhotoLink,
    CartItem,
    PickupCode,
    PaymentMethod,
    PickupPoint,
    Order,
    OrderItem,
};
