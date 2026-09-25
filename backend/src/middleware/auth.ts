import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Business } from '../models';

export interface AuthUser {
  userId: string;
  businessId: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      businessId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'vyaparai_super_secret_jwt_key_2025_dev_only';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        userId: decoded.userId,
        businessId: decoded.businessId,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
      };
      req.businessId = decoded.businessId;
      return next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired authentication token' });
      return;
    }
  }

  // Fallback for seamless Demo Mode: Automatically attach Shree General Store demo user if available
  try {
    const demoUser = await User.findOne({ isDemoUser: true });
    if (demoUser) {
      req.user = {
        userId: demoUser._id.toString(),
        businessId: demoUser.businessId.toString(),
        role: demoUser.role,
        name: demoUser.name,
        email: demoUser.email,
      };
      req.businessId = demoUser.businessId.toString();
      return next();
    }
  } catch (err) {
    // If DB is not yet populated, continue
  }

  res.status(401).json({ error: 'Authentication required. No authorization token provided.' });
}

export function requireRole(allowedRoles: Array<'OWNER' | 'MANAGER' | 'STAFF'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges for this business operation' });
      return;
    }
    next();
  };
}
