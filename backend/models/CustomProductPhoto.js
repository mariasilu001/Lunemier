const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class CustomProductPhoto extends Model {}

CustomProductPhoto.init(
    {
        customProductPhotoId: {
            field: "custom_product_photo_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        filePath: {
            field: "file_path",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "CustomProductPhoto",
        tableName: "custom_product_photos",
        timestamps: false,
    }
);

module.exports = CustomProductPhoto;