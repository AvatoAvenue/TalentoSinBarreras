import argon2 from "argon2";
import crypto from "crypto";

export class PasswordHashing {
    static genSalt(): string {
        return crypto.randomBytes(16).toString("base64");
    }

    static async hashPassword(password: string, salt: string): Promise<string> {
        return await argon2.hash(password, {
            type: argon2.argon2i,
            memoryCost: 65536,
            timeCost: 2,
            parallelism: 2,
            salt: Buffer.from(salt, 'base64')
        });
    }

    static async verify(password: string, storedHash: string, salt: string): Promise<boolean> {
        try {
            return await argon2.verify(storedHash, password);
        } catch (error) {
            console.error("Error verifying password:", error);
            return false;
        }
    }
}
