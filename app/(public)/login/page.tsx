'use client';

import { useState } from 'react';
import { ROLES, mapLegacyRole, ROLE_LABELS } from '@/constants/roles';
import { useToast } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { LoginLayout, LoginForm, ForgotPasswordModal } from '@/components/auth';
import { forgotPassword } from '@/features/auth/services';

// Only normal user roles (not admin/super-admin)
const USER_ROLE_OPTIONS = [
    { value: ROLES.STUDENT, label: ROLE_LABELS[ROLES.STUDENT] },
    { value: ROLES.ACADEMIC_STAFF, label: ROLE_LABELS[ROLES.ACADEMIC_STAFF] },
    { value: ROLES.NON_ACADEMIC_STAFF, label: ROLE_LABELS[ROLES.NON_ACADEMIC_STAFF] },
];

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const { showToast } = useToast();
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    const handleSubmit = async (data: { email: string; password: string; role?: string }) => {
        try {
            await login({
                email: data.email,
                password: data.password,
                role: mapLegacyRole(data.role || ROLES.STUDENT),
            });
            showToast('success', 'Login Successful', 'Welcome back to Nextora!');
        } catch (error) {
            showToast('error', 'Login Failed', error instanceof Error ? error.message : 'Invalid credentials');
            throw error;
        }
    };

    // Forgot password handler - calls backend API
    const handleSendEmail = async (email: string) => {
        const response = await forgotPassword({ email });
        if (!response.success) {
            throw new Error(response.message || 'Failed to send email');
        }
        showToast('success', 'Email Sent', 'Password reset link sent to your email');
    };

    return (
        <LoginLayout
            brandTitle="Nextora"
            heroTitle={
                <>
                    Empowering Education.
                    <br />
                    Simplifying Management.
                </>
            }
            heroSubtitle="A comprehensive campus management platform designed for students, staff, and administrators."
            footerText="Trusted by universities worldwide"
        >
            <LoginForm
                title="Welcome back"
                subtitle="Sign in to continue to Nextora"
                roleOptions={USER_ROLE_OPTIONS}
                showRoleSelector={true}
                showRememberMe={true}
                showForgotPassword={true}
                showDemoCredentials={true}
                onForgotPassword={() => setForgotPasswordOpen(true)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                open={forgotPasswordOpen}
                onClose={() => setForgotPasswordOpen(false)}
                onSendEmail={handleSendEmail}
            />
        </LoginLayout>
    );
}
