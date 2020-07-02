import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

const directory = path.resolve(__dirname, '..', '..', 'tmp');

export default{
    directory:  directory,
    storage: multer.diskStorage({
        destination: directory,
        filename(request, file, callback){
            const filename = `${crypto.randomBytes(10).toString('hex')}-${file.originalname}`
            return callback(null, filename)
        }
    })
}