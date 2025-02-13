import { Types } from "mongoose";
import { tokenInfo } from "../../config";
import { AuthFailureError, InternalError } from "../../core/ApiError";
import JWT, { JwtPayload } from "../../core/JWT";
import User from "../../database/model/User";

// Function to split the Bearer token and get the actual token value
export const splitAccessToken = (token: string) => {
  if (!token) throw new AuthFailureError("missing authorization token");

  if (!token.startsWith("Bearer "))
    throw new AuthFailureError("invalid authorization token");

  return token.split(" ")[1]; // Return the token part after "Bearer "
};

// Create Access and Refresh tokens for the user
export const createTokens = async (
  user: User
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Generate Access Token with validity
  const accessToken = await JWT.generateToken(
    new JwtPayload(
      tokenInfo.issuer,
      tokenInfo.audience,
      user._id.toString(),
      tokenInfo.accessTokenValidity
    ),
    tokenInfo.accessTokenValidity // Pass validity to generateToken
  );

  if (!accessToken) throw new InternalError("Error creating access token");

  // Generate Refresh Token with validity
  const refreshToken = await JWT.generateToken(
    new JwtPayload(
      tokenInfo.issuer,
      tokenInfo.audience,
      user._id.toString(),
      tokenInfo.refreshTokenValidity
    ),
    tokenInfo.refreshTokenValidity // Pass validity to generateToken
  );

  if (!refreshToken) throw new Error("Error creating refresh token");

  return {
    accessToken,
    refreshToken,
  };
};

// Validate the token payload data
export const validateTokenData = (payload: JwtPayload): boolean => {
  if (
    !payload ||
    !payload.iss ||
    !payload.aud ||
    !payload.sub ||
    payload.iss !== tokenInfo.issuer ||
    payload.aud !== tokenInfo.audience ||
    !Types.ObjectId.isValid(payload.sub)
  )
    throw new AuthFailureError("invalid access token");

  return true;
};
