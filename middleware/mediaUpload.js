const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// Check file type
const checkFileType = (file, cb) => {
  // Allowed image types
  const imageTypes = /jpeg|jpg|png|gif|svg|webp/;
  // Allowed video types
  const videoTypes = /mp4|avi|mov|mkv|webm|flv|wmv/;
  // Allowed document types
  const documentTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar/;

  const extname = imageTypes.test(path.extname(file.originalname).toLowerCase())
    ? 'image'
    : videoTypes.test(path.extname(file.originalname).toLowerCase())
    ? 'video'
    : documentTypes.test(path.extname(file.originalname).toLowerCase())
    ? 'document'
    : null;

  const mimetype = imageTypes.test(file.mimetype)
    ? 'image'
    : videoTypes.test(file.mimetype)
    ? 'video'
    : documentTypes.test(file.mimetype)
    ? 'document'
    : null;

  if (mimetype && extname) {
    return cb(null, true, extname);
  } else {
    cb('Error: Invalid file type. Only image, video, and document files are allowed!');
  }
};

// Init upload
const mediaUpload = multer({
  storage,
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600 // 100MB default
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

module.exports = mediaUpload;
