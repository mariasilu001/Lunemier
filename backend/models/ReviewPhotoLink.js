const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class ReviewPhotoLink extends Model {}

ReviewPhotoLink.init(
    {
        reviewPhotoLinkId: {
            field: "review_photo_link_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        reviewId: {
            field: "review_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "reviews",
                key: "review_id",
            },
        },
        reviewPhotoId: {
            field: "review_photo_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "review_photos",
                key: "review_photo_id",
            },
        },
    },
    {
        sequelize,
        modelName: "ReviewPhotoLink",
        tableName: "review_photo_links",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["review_id", "review_photo_id"],
                name: "unique_review_photo_combination"
            }
        ]
    }
);

module.exports = ReviewPhotoLink;