require('dotenv').config()

const CONFIG = {

    region: process.env.AWS_REGION,
    accessKey: process.env.AWS_ACCESS_KEY,
    accessKeySecret: process.env.AWS_ACCESS_KEY_SECRET,
    
    s3: {
        name: process.env.AWS_S3_BUCKET_NAME,
    }

}

export { CONFIG }