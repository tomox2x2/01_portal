import * as AES from 'crypto-js/aes';
import * as Utf8 from 'crypto-js/enc-utf8';
import SHA256 from 'crypto-js/sha256'; 

export const encrypt = ( plainText: string, SECRET_KEY: string ): string => {

    try {
        const key = SHA256(SECRET_KEY);
        const enprypted = AES.encrypt(plainText, key.toString());
        return enprypted.toString();
    } catch(error) {
        console.error("Decryption error: ", error);
        throw new Error("Failed to decrypt data.");
    }
}

export const decrypt = ( cipherText: string, SECRET_KEY: string ): string => {
    try {
        const key = SHA256(SECRET_KEY);
        const decrypted = AES.decrypt(cipherText, key.toString());
        return decrypted.toString(Utf8);
    } catch(error) {
        console.error("Decryption error: ", error);
        throw new Error("Failed to decrypt data.");
    }
}
