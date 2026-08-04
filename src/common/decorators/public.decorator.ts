import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public. Combine with OptionalJwtAuthGuard when the
 * route should still resolve `req.user` for signed-in requests without
 * requiring authentication (e.g. GET /home, POST /contact).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
