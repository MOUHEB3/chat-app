import { sign, verify } from "jsonwebtoken";
import { BadTokenError, InternalError, TokenExpiredError } from "./ApiError";
import { tokenInfo } from "../config";

export class JwtPayload {
  aud: string;
  sub: string;
  iss: string;
  iat: number;
  exp: number;

  constructor(issuer: string, audience: string, subject: string, validity: number) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.iat = Math.floor(Date.now() / 1000);
    this.exp = this.iat + validity;
  }
}

// ✅ FIXED: Ensure expiration is explicitly set in sign()
const generateToken = async (payload: JwtPayload): Promise<string> => {
  if (!tokenInfo.jwtSecretKey) throw new InternalError("JWT Secret Key is missing");

  return new Promise<string>((resolve, reject) => {
    sign(
      { ...payload },
      tokenInfo.jwtSecretKey,
      { expiresIn: payload.exp - payload.iat }, // ✅ Explicitly setting expiration
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
