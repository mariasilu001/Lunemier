const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    
    
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    
    
    
    filename: (req, file, cb) => {
        
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true); 
    } else {
        cb(
            new Error("Неверный тип файла! Принимаются только изображения."),
            false,
        ); 
    }
};


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10, 
    },
});

module.exports = upload;
