import multer from "multer"

// multer : package providing a file upload middleware
//  setup for image uploads

// define storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'temp/uploads')
    },

    filename :function(req, file, cb){
        const unique_name = `${Date.now()}-${file.originalname}`;
         cb(null,file.fieldname+'-'+unique_name)

    }
})

// multer() returns a middleware function
const upload = multer({storage: storage})

export default upload;