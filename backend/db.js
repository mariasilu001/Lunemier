const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log("База данных Sqlite подключена успешно!");
    } catch (error) {
        console.log("Щшибка подключения к Sqlite: ", error);
    }
})();

module.exports = sequelize;
