/**
 * @fileoverview Authentication Components
 * @description Reusable UI components for authentication flows
 * @module components/auth
 */

// Login Components
export { LoginForm, type LoginFormProps, type RoleOption } from './LoginForm';
export { LoginCard, type LoginCardProps } from './LoginCard';
export { LoginLayout, UserLoginFooter, AdminLoginFooter, type LoginLayoutProps } from './LoginLayout';

// Password Reset Flow Components
export { ForgotPasswordForm, type ForgotPasswordFormProps } from './ForgotPasswordForm';
export { ResetPasswordForm, type ResetPasswordFormProps } from './ResetPasswordForm';
export { SuccessCard, type SuccessCardProps } from './SuccessCard';

// OTP Verification Components
export { OtpInput, type OtpInputProps } from './OtpInput';
export { OtpVerificationCard, type OtpVerificationCardProps } from './OtpVerificationCard';

// Alert Components
export { AuthAlert, SecurityAlert, WarningAlert, type AuthAlertProps } from './AuthAlert';

