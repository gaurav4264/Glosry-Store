import multer from "multer";
import os from "os";

export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, os.tmpdir()),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
    })
})
