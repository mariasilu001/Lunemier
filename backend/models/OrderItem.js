const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class OrderItem extends Model {}

OrderItem.init(
    {
        orderItemId: {
            field: "order_item_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        orderId: {
            field: "order_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "orders",
                key: "order_id",
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
        priceSnapshot: {
            field: "price_snapshot",
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "OrderItem",
        tableName: "order_items",
        timestamps: false,
    }
);

module.exports = OrderItem;