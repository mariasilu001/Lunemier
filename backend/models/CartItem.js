const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class CartItem extends Model {}

CartItem.init(
    {
        cartItemId: {
            field: "cart_item_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
        },
        productId: {
            field: "product_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "products",
                key: "product_id",
            },
        },
        quantity: {
            field: "quantity",
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "CartItem",
        tableName: "cart_items",
        timestamps: false,
    },
);

module.exports = CartItem;
