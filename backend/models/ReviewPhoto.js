const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class ReviewPhoto extends Model {}

ReviewPhoto.init(
    {
        reviewPhotoId: {
            field: "review_photo_id",
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
        modelName: "ReviewPhoto",
        tableName: "review_photos",
        timestamps: false,
    }
);

module.exports = ReviewPhoto;