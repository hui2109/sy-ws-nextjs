import {jwtVerify, SignJWT} from "jose";

const secretKey = process.env.JWT_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
    userId: number;
    username: string;
    name: string;
}

export async function createSessionToken(payload: SessionPayload) {
    return new SignJWT({...payload})
        .setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey);
}

export async function verifySessionToken(token: string) {
    try {
        const {payload} = await jwtVerify(token, encodedKey);
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}
