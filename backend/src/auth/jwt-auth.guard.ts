import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    
    // Fail fast and loud if the secret is missing
    if (!secret) {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // هذا الكائن سيصبح متاحاً في أي مسار محمي عبر (req.user)
    return { userId: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  }
}