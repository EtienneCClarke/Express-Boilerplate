import { randomBytes } from "crypto"

const randomString = (bytes: number = 32) => randomBytes(bytes).toString('hex');

export { randomString }