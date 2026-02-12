/**
 * Profile Components Index
 *
 * Industry-standard unified profile system that works for all user roles.
 *
 * Usage:
 * - Import UnifiedProfilePage for profile view
 * - Import UnifiedEditProfilePage for edit profile
 * - Import UnifiedSettingsPage for settings
 * - Import RoleProfileSection/RoleEditForm for role-specific content
 */

// Role-specific sections (used internally by unified pages)
export * from './RoleProfileSections';
export * from './RoleEditForms';

// Unified pages (use these in route pages)
export { default as UnifiedProfilePage } from './UnifiedProfilePage';
export { default as UnifiedEditProfilePage } from './UnifiedEditProfilePage';
export { default as UnifiedSettingsPage } from './UnifiedSettingsPage';

