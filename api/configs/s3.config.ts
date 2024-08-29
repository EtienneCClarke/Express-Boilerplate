require('dotenv').config()

const CONFIG = {

    region: 'eu-west-2',
    secretAccessKeyId: process.env.AWS_S3_SECRET_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY

}

export { CONFIG }