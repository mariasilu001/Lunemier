const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Category extends Model {}

Category.init(
    {
        categoryId: {
            field: "category_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: "Category",
        tableName: "categories",
        timestamps: false,
    }
);

module.exports = Category;