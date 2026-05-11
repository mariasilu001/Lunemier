const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

class User extends Model {}

User.init(
    {
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            field: "username",
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        email: {
            field: "email",
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            field: "password_hash",
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        firstName: {
            field: "first_name",
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        lastName: {
            field: "last_name",
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        phoneNumber: {
            field: "phone_number",
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        role: {
            field: "role",
            type: DataTypes.STRING(50),
            allowNull: false,
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
        modelName: "User",
        tableName: "users",
        timestamps: false,
    },
);

module.exports = User;
