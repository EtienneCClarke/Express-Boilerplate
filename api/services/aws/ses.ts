import { SendEmailCommandInput, SES } from "@aws-sdk/client-ses";
import { CONFIG } from "../../configs/aws.config";

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

    /**
     * Sends an email using AWS SES.
     * 
     * @param args The input parameters for sending the email.
     * @returns A promise that resolves to true if the email was sent successfully, otherwise false.
     * @throws Throws an error if the email sending fails.
    */
    public static async sendEmail(args: SendEmailCommandInput): Promise<boolean> {

        try {
            if(await SESClient.sendEmail(args)) {
                return true;
            }
            return false;
        } catch (e) {
            console.error(`SES_SERVICE sendEmail: ${e}`);
            return false;
        }

    }

}

export { SESService}