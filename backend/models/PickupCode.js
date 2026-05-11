const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class PickupCode extends Model {}

PickupCode.init(
    {
        pickupCodeId: {
            field: "pickup_code_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
        },
        code: {
            field: "code",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        expiresAt: {
            field: "expires_at",
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "PickupCode",
        tableName: "pickup_codes",
        timestamps: false,
    }
);

module.exports = PickupCode;