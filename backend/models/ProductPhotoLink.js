const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class ProductPhotoLink extends Model {}

ProductPhotoLink.init(
    {
        productPhotoLinkId: {
            field: "product_photo_link_id",
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
        productPhotoId: {
            field: "product_photo_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "product_photos",
                key: "product_photo_id",
            },
        },
    },
    {
        sequelize,
        modelName: "ProductPhotoLink",
        tableName: "product_photo_links",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["product_id", "product_photo_id"],
                name: "unique_product_photo_combination"
            }
        ]
    }
);

module.exports = ProductPhotoLink;