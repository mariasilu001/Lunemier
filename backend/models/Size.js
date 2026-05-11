const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Size extends Model {}

Size.init(
    {
        sizeId: {
            field: "size_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sizeValue: {
            field: "size_value",
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: "Size",
        tableName: "sizes",
        timestamps: false,
    }
);

module.exports = Size;