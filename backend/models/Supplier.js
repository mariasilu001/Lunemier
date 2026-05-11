const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class Supplier extends Model {}

Supplier.init(
    {
        supplierId: {
            field: "supplier_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            field: "email",
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        details: {
            field: "details",
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
        deletedAt: {
            field: "deleted_at",
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Supplier",
        tableName: "suppliers",
        timestamps: false,
    }
);

module.exports = Supplier;