import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Receiving file:", file.originalname);
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
     console.log("Saving:", file.originalname);
    cb(null, file.originalname)         //TODO change the file name store in the temp as the user can upload the fiile with same name
  }
})

// export const upload = multer({ storage: storage })

export const upload= multer({
    storage,
})