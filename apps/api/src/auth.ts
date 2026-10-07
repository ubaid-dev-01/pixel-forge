import { ConvexHttpClient } from "convex/browser";
import type { Request, Response, NextFunction } from "express";
import { ERROR_CODES } from "@pixelforge/types";
import { describeError } from "@pixelforge/shared";

export interface AuthedRequest extends Request {
  convexToken?: string;
  convex?: ConvexHttpClient;
  requestId?: string;
  rawBody?: string;
}

export function authMiddleware(convexUrl: string) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      const error = describeError(ERROR_CODES.UNAUTHORIZED);
      res.status(401).json(error);
      return;
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      const error = describeError(ERROR_CODES.UNAUTHORIZED);
      res.status(401).json(error);
      return;
    }
    const client = new ConvexHttpClient(convexUrl);
    client.setAuth(token);
    req.convexToken = token;
    req.convex = client;
    next();
  };
}
