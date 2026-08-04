import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route/controller to the given roles.
 * Example: @Roles(Role.ADMIN, Role.EDITOR)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
