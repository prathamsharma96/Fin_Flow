import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

export interface AuthUser {
  id: string;
  email: string;
  role: "VIEWER" | "ANALYST" | "ADMIN";
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res
        .status(401)
        .json({ success: false, message: "User not found or inactive" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as "VIEWER" | "ANALYST" | "ADMIN",
      name: user.name,
    };
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
