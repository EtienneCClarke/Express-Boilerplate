import { SES } from "@aws-sdk/client-ses";
import { CONFIG } from "../../configs/aws.config";
import { randomString } from "../../utils/randomBytes";

const SESClient = new SES({
    region: CONFIG.region,
    credentials: {
        accessKeyId: <string> CONFIG.accessKey,
        secretAccessKey: <string> CONFIG.accessKeySecret
    }
})

/**
 * @class SESService
 * @description A service class for AWS SES (Simple Email Service) related operations.
*/
class SESService {



}