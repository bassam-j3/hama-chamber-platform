import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'HamaChamber_Super_Secret_Key_2026',
    });
  }

  async validate(payload: any) {
    // هذا الكائن سيصبح متاحاً في أي مسار محمي عبر (req.user)
    return { userId: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  }
}