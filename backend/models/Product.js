const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Product extends Model {}

Product.init(
    {
        productId: {
            field: "product_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            field: "description",
            type: DataTypes.TEXT,
            allowNull: true,
        },
        baseProductId: {
            field: "base_product_id",
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "products",
                key: "product_id",
            },
        },
        sizeId: {
            field: "size_id",
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "sizes",
                key: "size_id",
            },
        },
        categoryId: {
            field: "category_id",
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "categories",
                key: "category_id",
            },
        },
        supplierId: {
            field: "supplier_id",
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "suppliers",
                key: "supplier_id",
            },
        },
        isCustom: {
            field: "is_custom",
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isBase: {
            field: "is_base",
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        frontPhotoUrl: {
            field: "front_photo_url",
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        backPhotoUrl: {
            field: "back_photo_url",
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "user_id",
            },
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
        deletedAt: {
            field: "deleted_at",
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: false,
    }
);

module.exports = Product;