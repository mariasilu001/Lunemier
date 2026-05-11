const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Order extends Model {}

Order.init(
    {
        orderId: {
            field: "order_id",
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
        status: {
            field: "status",
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        pickupPointId: {
            field: "pickup_point_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "pickup_points",
                key: "pickup_point_id",
            },
        },
        paymentMethodId: {
            field: "payment_method_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "payment_methods",
                key: "payment_method_id",
            },
        },
        totalAmount: {
            field: "total_amount",
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            field: "updated_at",
            type: DataTypes.DATE,
            allowNull: true,
        },
        isHidden: {
            field: "is_hidden",
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: "Order",
        tableName: "orders",
        timestamps: false,
    }
);

module.exports = Order;