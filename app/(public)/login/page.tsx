'use client';

import { useRouter } from 'next/navigation';
import { ROLES, mapLegacyRole, ROLE_LABELS } from '@/constants/roles';
import { useToast } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { LoginLayout, LoginCard, LoginForm, UserLoginFooter, RoleOption } from '@/components/auth';

// Only normal user roles (not admin/super-admin)
const USER_ROLE_OPTIONS: RoleOption[] = [
    { value: ROLES.STUDENT, label: ROLE_LABELS[ROLES.STUDENT] },
    { value: ROLES.ACADEMIC_STAFF, label: ROLE_LABELS[ROLES.ACADEMIC_STAFF] },
    { value: ROLES.NON_ACADEMIC_STAFF, label: ROLE_LABELS[ROLES.NON_ACADEMIC_STAFF] },
];

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const { showToast } = useToast();

    const handleSubmit = async (data: { email: string; password: string; role: string }) => {
        try {
            await login({
                email: data.email,
                password: data.password,
                role: mapLegacyRole(data.role),
            });
            showToast('success', 'Login Successful', 'Welcome back to Nextora!');
        } catch (error) {
            showToast('error', 'Login Failed', error instanceof Error ? error.message : 'Invalid credentials');
            throw error;
        }
    };

    return (
        <LoginLayout
            onBack={() => router.push('/')}
            backgroundGradient="linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)"
            footerText={<UserLoginFooter />}
        >
            <LoginCard
                title="Welcome Back"
                subtitle="Sign in to continue to Nextora"
                headerGradient="linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)"
            >
                <LoginForm
                    roleOptions={USER_ROLE_OPTIONS}
                    roleLabel="Select Role *"
                    emailLabel="Email *"
                    emailPlaceholder="your.email@university.edu"
                    submitButtonText="Sign In"
                    submitButtonGradient="linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)"
                    submitButtonHoverGradient="linear-gradient(90deg, #1D4ED8 0%, #6D28D9 100%)"
                    showRememberMe={true}
                    showForgotPassword={true}
                    onForgotPassword={() => router.push('/forgot-password')}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </LoginCard>
        </LoginLayout>
    );
}
