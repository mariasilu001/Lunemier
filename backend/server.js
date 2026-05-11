const express = require("express");
const path = require("path");

const authToken = require("./middleware/authToken.js");
const authAdmin = require("./middleware/authAdmin.js");

const publicRouter = require("./controllers/public.js");
const meRouter = require("./controllers/me.js");
const adminRouter = require("./controllers/admin.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // мидла для парса формдаты (изображения там, файлы всякие и тп)

const PORT = 3000;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", publicRouter);
app.use("/api/me", authToken, meRouter);
app.use("/api/admin", authToken, authAdmin, adminRouter);

app.use((err, req, res, next) => {
    console.error("Произошла ошибка:");
    console.log(err.message);
    console.error(err.stack);

    res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: err.message,
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
