const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class PickupPoint extends Model {}

PickupPoint.init(
    {
        pickupPointId: {
            field: "pickup_point_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        city: {
            field: "city",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        street: {
            field: "street",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        building: {
            field: "building",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        deletedAt: {
            field: "deleted_at",
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "PickupPoint",
        tableName: "pickup_points",
        timestamps: false,
    }
);

module.exports = PickupPoint;