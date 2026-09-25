import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Business } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'vyaparai_super_secret_jwt_key_2025_dev_only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials. User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const business = await Business.findById(user.businessId);

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          businessId: user.businessId.toString(),
          role: user.role,
          name: user.name,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as any
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        business,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await User.findById(req.user.userId).select('-passwordHash');
      const business = await Business.findById(req.user.businessId);

      res.json({ user, business });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async listBusinesses(req: Request, res: Response): Promise<void> {
    try {
      const businesses = await Business.find().select('name businessType city state annualTurnover gstin');
      const users = await User.find().select('businessId name email role');

      const result = businesses.map((b) => {
        const ownerUser = users.find((u) => u.businessId.toString() === b._id.toString());
        return {
          id: b._id,
          name: b.name,
          businessType: b.businessType,
          city: b.city,
          state: b.state,
          annualTurnover: b.annualTurnover,
          gstin: b.gstin,
          userEmail: ownerUser?.email,
          userName: ownerUser?.name,
        };
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async switchBusiness(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.body;
      if (!businessId) {
        res.status(400).json({ error: 'businessId is required' });
        return;
      }

      const business = await Business.findById(businessId);
      if (!business) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }

      const user = await User.findOne({ businessId });
      if (!user) {
        res.status(404).json({ error: 'No user found for this business' });
        return;
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          businessId: user.businessId.toString(),
          role: user.role,
          name: user.name,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as any
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        business,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
