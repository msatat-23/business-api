import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * For routes that are open to both anonymous and signed-in users
 * (e.g. GET /home, POST /contact) but that may want to know who the
 * caller is when a valid token IS provided. Never throws on missing
 * or invalid tokens - it simply leaves req.user undefined.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Swallow errors/absence of user instead of throwing 401
    return user || null;
  }
}
