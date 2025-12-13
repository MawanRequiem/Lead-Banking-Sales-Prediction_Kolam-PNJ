const multer = require('multer');

// Centralized multer configuration for reuse across routes
// Note: memoryStorage keeps the uploaded file in memory (Buffer).
// For larger files or production, consider diskStorage or streaming to a storage service.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    // Accept .xlsx and .csv only. .xls is intentionally rejected with guidance elsewhere.
    if (!file.originalname.match(/\.(xlsx|csv)$/i)) {
      return cb(new Error('Only .xlsx and .csv files are allowed'), false);
    }
    cb(null, true);
  },
});

function uploadSingle(fieldName) {
  return upload.single(fieldName);
}

module.exports = {
  upload,
  uploadSingle,
};
