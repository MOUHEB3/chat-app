import { sign, verify } from "jsonwebtoken";
import { BadTokenError, InternalError, TokenExpiredError } from "./ApiError";
import { tokenInfo } from "../config";

export class JwtPayload {
  aud: string;
  sub: string;
  iss: string;
  iat: number;
  // Removed exp property from the class
  constructor(issuer: string, audience: string, subject: string, validity: number) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.iat = Math.floor(Date.now() / 1000); // Set issued time
    // We no longer need exp directly here.
  }
}

// ✅ FIXED: No need for exp property, only use expiresIn
const generateToken = async (payload: JwtPayload, validity: number): Promise<string> => {
  if (!tokenInfo.jwtSecretKey) throw new InternalError("JWT Secret Key is missing");

  return new Promise<string>((resolve, reject) => {
    // Pass expiresIn as the validity directly, no need to add exp to the payload
    sign(
      { ...payload },
      tokenInfo.jwtSecretKey,
      { expiresIn: validity }, // Pass the validity (e.g., "1h" for 1 hour) to expiresIn
      (err, token) => {
        if (err) {
          console.error("JWT Signing Error:", err);
          reject(err);
        }
        resolve(token as string);
      }
    );
  });
};

// ✅ FIXED: Proper error handling & debugging for validation
const validateToken = async (token: string): Promise<JwtPayload> => {
  if (!token) throw new InternalError("No token provided");

  return new Promise<JwtPayload>((resolve, reject) => {
    verify(token, tokenInfo.jwtSecretKey, (err, decoded) => {
      if (err) {
        console.error("JWT Validation Error:", err); // ✅ Added logging for debugging
        if (err.name === "TokenExpiredError") return reject(new TokenExpiredError());
        return reject(new BadTokenError("Invalid token"));
      }
      resolve(decoded as JwtPayload);
    });
  });
};

// ✅ FIXED: Decode token with better error handling
const decodeToken = async (token: string): Promise<JwtPayload> => {
  if (!token) throw new InternalError("No token provided");

  return new Promise<JwtPayload>((resolve, reject) => {
    verify(token, tokenInfo.jwtSecretKey, { ignoreExpiration: true }, (err, decoded) => {
      if (err) {
        console.error("JWT Decoding Error:", err); // ✅ Debugging error log
        return reject(new BadTokenError("Malformed token"));
      }
      resolve(decoded as JwtPayload);
    });
  });
};

export default {
  generateToken,
  validateToken,
  decodeToken,
};
