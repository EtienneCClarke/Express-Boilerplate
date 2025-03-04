import { v4, Version4Options } from "uuid";

/**
 * @class UUIDService
 * @description A service class for UUID related operations
*/
class UUIDService {

    /**
     * Generates a UUID
     * @returns A UUID v4
     * @static
    */ 
    static generateV4(options?: Version4Options, buf?: undefined, offset?: number): string {
        return v4(options, buf, offset);
    }

}

export { UUIDService}