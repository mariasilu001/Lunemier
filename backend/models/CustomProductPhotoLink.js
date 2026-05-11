const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class CustomProductPhotoLink extends Model {}

CustomProductPhotoLink.init(
    {
        customProductPhotoLinkId: {
            field: "custom_product_photo_link_id",
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
        details: {
            field: "details",
            type: DataTypes.JSON,
            allowNull: false,
        },
        customProductPhotoId: {
            field: "custom_product_photo_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "custom_product_photos",
                key: "custom_product_photo_id",
            },
        },
    },
    {
        sequelize,
        modelName: "CustomProductPhotoLink",
        tableName: "custom_product_photo_links",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["product_id", "custom_product_photo_id"],
                name: "unique_custom_product_photo_combination"
            }
        ]
    }
);

module.exports = CustomProductPhotoLink;