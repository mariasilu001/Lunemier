const multer = require("multer");
const path = require("path");

// Куда сохранять файлы?
const storage = multer.diskStorage({
    // destination: 'путь/к/папке'
    // Мы говорим: "Складывай все файлы в папку 'uploads' в корне проекта".
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    // Как называть файлы?
    // Чтобы избежать конфликтов, когда два юзера загружают файл 'image.png',
    // мы создадим уникальное имя для каждого.
    filename: (req, file, cb) => {
        // Имя будет: 'image-' + <текущее_время_в_мс> + '.png'
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

// Мы можем добавить фильтр, чтобы принимать только картинки
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true); // Принять файл
    } else {
        cb(
            new Error("Неверный тип файла! Принимаются только изображения."),
            false,
        ); // Отклонить файл
    }
};

// Создаем и экспортируем настроенный multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10, // Ограничение на размер файла: 5 МБ
    },
});

module.exports = upload;
