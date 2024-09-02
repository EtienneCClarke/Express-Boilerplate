import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomString } from "../utils/randomBytes";
import { CONFIG } from "../configs/aws.config";

const s3Client = new S3Client({
    region: CONFIG.region,
    credentials: {
		accessKeyId: <string> CONFIG.accessKey,
		secretAccessKey: <string> CONFIG.accessKeySecret
    }
});

/**
 * @class S3Service
 * @description A service class for aws s3 related operations
*/
class S3Service {

	/**
     * Uploads a file to an AWS S3 Bucket.
     * @param obj - A file object.
     * @param name - When a name is provided the provided file will overwrite any existing file with the same name in the bucket.
     * @returns A promise that resolves with true if upload is successful, false otherwise.
     * @static
    */
    static async uploadObject(obj: Express.Multer.File, name?: string): Promise<boolean> {
		try {
			const command = new PutObjectCommand({
				Bucket: CONFIG.s3.name,
				Key: name ? name : randomString(),
				Body: obj.buffer,
				ContentType: obj.mimetype
			});
			if(await s3Client.send(command)) return true;
			return false;
		} catch (e) {
			console.error(`S3_SERVICE uploadObject: ${e}`);
			return false;
		}
    }
	
	/**
	 * Retrieves a signed url for a file stored inside an AWS S3 Bucket
     * @param name - The file name.
     * @returns A promise that resolves with a signed url to the file if successful, null otherwise.
     * @static
    */
    static async getObject(name: string): Promise<string | null> {
		try {
			const command = new GetObjectCommand({
				Bucket: CONFIG.s3.name,
				Key: name,
			});
			return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
		} catch (e) {
			console.error(`S3_SERVICE getObject: ${e}`);
			return null;
		}
    }
	
	/**
     * Deletes a file from an AWS S3 bucket.
     * @param name - The file name.
     * @returns A promise that resolves with true if deletion is successful, false otherwise.
     * @static
    */
    static async deleteObject(name: string): Promise<boolean> {
		try {
			const command = new DeleteObjectCommand({
				Bucket: CONFIG.s3.name,
				Key: name
			});
			if(await s3Client.send(command)) return true;
			return false;
		} catch (e) {
			console.error(`S3_SERVICE deleteObject: ${e}`);
			return false;
		}
    }
}

export { S3Service }