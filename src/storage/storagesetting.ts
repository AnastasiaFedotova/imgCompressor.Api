import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'dist/uploads/');
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname)
  }
});


export default multer({ storage: storage }).single('file');
