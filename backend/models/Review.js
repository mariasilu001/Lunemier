const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Review extends Model {}

Review.init(
    {
        reviewId: {
            field: "review_id",
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
        rating: {
            field: "rating",
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reviewText: {
            field: "review_text",
            type: DataTypes.TEXT,
            allowNull: true,
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
    },
    {
        sequelize,
        modelName: "Review",
        tableName: "reviews",
        timestamps: false,
    }
);

module.exports = Review;