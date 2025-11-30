import argon2 from "argon2";
import crypto from "crypto";

export class PasswordHashing {
    static genSalt(): string {
        return crypto.randomBytes(16).toString("base64");
    }

    static async hashPassword(password: string, salt: string): Promise<string> {
        return await argon2.hash(password + salt, {
            type: argon2.argon2i,
            memoryCost: 65536,
            timeCost: 2,
            parallelism: 2
        });
    }

    static async verify(password: string, storedHash: string, salt: string): Promise<boolean> {
        const computed = await PasswordHashing.hashPassword(password, salt);
        return computed === storedHash;
    }
}
