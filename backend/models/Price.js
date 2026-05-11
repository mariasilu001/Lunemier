const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Price extends Model {}

Price.init(
    {
        priceId: {
            field: "price_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
        price: {
            field: "price",
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        isActive: {
            field: "is_active",
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Price",
        tableName: "prices",
        timestamps: false,
    }
);

module.exports = Price;