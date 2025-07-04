import multer from "multer"

// multer setup

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'temp/uploads')
    },

    filename :function(req, file, cb){
        const unique_name = `${Date.now()}-${file.originalname}`;
         cb(null,file.fieldname+'-'+unique_name)

    }
})

const upload = multer({storage: storage})

export default upload;