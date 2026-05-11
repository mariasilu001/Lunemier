const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class ProductPhoto extends Model {}

ProductPhoto.init(
    {
        productPhotoId: {
            field: "product_photo_id",
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
        modelName: "ProductPhoto",
        tableName: "product_photos",
        timestamps: false,
    }
);

module.exports = ProductPhoto;