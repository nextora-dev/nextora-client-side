'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { UserManagementPage } from '@/components/features/user-management';
import { CreateUserRequest, UpdateUserRequest } from '@/features/admin';
import { CreateAdminRequest } from '@/features/super-admin';
import {
    // Thunks
    fetchUsersSuperAdmin,
    fetchUserStatsSuperAdmin,
    fetchUserByIdSuperAdmin,
    createUserSuperAdminAsync,
    createAdminUserAsync,
    updateUserSuperAdminAsync,
    activateUserSuperAdminAsync,
    deactivateUserSuperAdminAsync,
    suspendUserSuperAdminAsync,
    unlockUserSuperAdminAsync,
    softDeleteUserSuperAdminAsync,
    restoreUserSuperAdminAsync,
    permanentDeleteUserSuperAdminAsync,
    // Actions
    setSuperAdminSearchQuery,
    setSuperAdminRoleFilter,
    setSuperAdminStatusFilter,
    setSuperAdminCurrentPage,
    setSuperAdminPageSize,
    clearSuperAdminSelectedUserDetail,
    clearSuperAdminSuccessMessage,
    // Selectors
    selectSuperAdminUsers,
    selectSuperAdminTotalUsers,
    selectSuperAdminCurrentPage,
    selectSuperAdminPageSize,
    selectSuperAdminSearchQuery,
    selectSuperAdminRoleFilter,
    selectSuperAdminStatusFilter,
    selectSuperAdminStats,
    selectSuperAdminIsLoading,
    selectSuperAdminError,
    selectSuperAdminSelectedUserDetail,
    selectSuperAdminIsUserDetailLoading,
    selectSuperAdminIsCreating,
    selectSuperAdminIsCreatingAdmin,
    selectSuperAdminIsUpdating,
    selectSuperAdminIsStatusChanging,
    selectSuperAdminIsPermanentDeleting,
    selectSuperAdminSuccessMessage,
    selectSuperAdminCreateError,
    selectSuperAdminCreateAdminError,
    selectSuperAdminUpdateError,
    selectSuperAdminStatusChangeError,
    selectSuperAdminPermanentDeleteError,
} from '@/features/super-admin';
import { RoleType, StatusType } from '@/constants';

export default function SuperAdminUsersPage() {
    const dispatch = useAppDispatch();

    // Selectors
    const users = useAppSelector(selectSuperAdminUsers);
    const totalUsers = useAppSelector(selectSuperAdminTotalUsers);
    const page = useAppSelector(selectSuperAdminCurrentPage);
    const rowsPerPage = useAppSelector(selectSuperAdminPageSize);
    const searchQuery = useAppSelector(selectSuperAdminSearchQuery);
    const roleFilter = useAppSelector(selectSuperAdminRoleFilter);
    const statusFilter = useAppSelector(selectSuperAdminStatusFilter);
    const userStats = useAppSelector(selectSuperAdminStats);
    const loading = useAppSelector(selectSuperAdminIsLoading);
    const error = useAppSelector(selectSuperAdminError);
    const userDetail = useAppSelector(selectSuperAdminSelectedUserDetail);
    const userDetailLoading = useAppSelector(selectSuperAdminIsUserDetailLoading);
    const isCreating = useAppSelector(selectSuperAdminIsCreating);
    const isCreatingAdmin = useAppSelector(selectSuperAdminIsCreatingAdmin);
    const isUpdating = useAppSelector(selectSuperAdminIsUpdating);
    const isStatusChanging = useAppSelector(selectSuperAdminIsStatusChanging);
    const isPermanentDeleting = useAppSelector(selectSuperAdminIsPermanentDeleting);
    const successMessage = useAppSelector(selectSuperAdminSuccessMessage);
    const createError = useAppSelector(selectSuperAdminCreateError);
    const createAdminError = useAppSelector(selectSuperAdminCreateAdminError);
    const updateError = useAppSelector(selectSuperAdminUpdateError);
    const statusChangeError = useAppSelector(selectSuperAdminStatusChangeError);
    const permanentDeleteError = useAppSelector(selectSuperAdminPermanentDeleteError);

    // Handlers
    const handleFetchUsers = useCallback(() => {
        dispatch(fetchUsersSuperAdmin({
            page,
            size: rowsPerPage,
            searchQuery,
            roleFilter,
            statusFilter
        }));
    }, [dispatch, page, rowsPerPage, searchQuery, roleFilter, statusFilter]);

    const handleFetchUserStats = useCallback(() => {
        dispatch(fetchUserStatsSuperAdmin());
    }, [dispatch]);

    const handleFetchUserById = useCallback((id: number) => {
        dispatch(fetchUserByIdSuperAdmin(id));
    }, [dispatch]);

    const handleCreateUser = useCallback((data: CreateUserRequest) => {
        dispatch(createUserSuperAdminAsync(data));
    }, [dispatch]);

    const handleCreateAdmin = useCallback((data: CreateAdminRequest) => {
        dispatch(createAdminUserAsync(data));
    }, [dispatch]);

    const handleUpdateUser = useCallback((id: number, data: UpdateUserRequest) => {
        dispatch(updateUserSuperAdminAsync({ id, data }));
    }, [dispatch]);

    const handleActivateUser = useCallback((id: number) => {
        dispatch(activateUserSuperAdminAsync(id));
    }, [dispatch]);

    const handleDeactivateUser = useCallback((id: number) => {
        dispatch(deactivateUserSuperAdminAsync(id));
    }, [dispatch]);

    const handleSuspendUser = useCallback((id: number) => {
        dispatch(suspendUserSuperAdminAsync(id));
    }, [dispatch]);

    const handleUnlockUser = useCallback((id: number) => {
        dispatch(unlockUserSuperAdminAsync(id));
    }, [dispatch]);

    const handleSoftDeleteUser = useCallback((id: number) => {
        dispatch(softDeleteUserSuperAdminAsync(id));
    }, [dispatch]);

    const handleRestoreUser = useCallback((id: number) => {
        dispatch(restoreUserSuperAdminAsync(id));
    }, [dispatch]);

    const handlePermanentDeleteUser = useCallback((id: number) => {
        dispatch(permanentDeleteUserSuperAdminAsync(id));
    }, [dispatch]);

    const handleSetSearchQuery = useCallback((query: string) => {
        dispatch(setSuperAdminSearchQuery(query));
    }, [dispatch]);

    const handleSetRoleFilter = useCallback((role: RoleType | '') => {
        dispatch(setSuperAdminRoleFilter(role));
    }, [dispatch]);

    const handleSetStatusFilter = useCallback((status: StatusType | '') => {
        dispatch(setSuperAdminStatusFilter(status));
    }, [dispatch]);

    const handleSetPage = useCallback((newPage: number) => {
        dispatch(setSuperAdminCurrentPage(newPage));
    }, [dispatch]);

    const handleSetPageSize = useCallback((size: number) => {
        dispatch(setSuperAdminPageSize(size));
    }, [dispatch]);

    const handleClearSelectedUserDetail = useCallback(() => {
        dispatch(clearSuperAdminSelectedUserDetail());
    }, [dispatch]);

    const handleClearSuccessMessage = useCallback(() => {
        dispatch(clearSuperAdminSuccessMessage());
    }, [dispatch]);

    return (
        <UserManagementPage
            title="User Management"
            subtitle="Super Admin Dashboard - Full Control"
            isSuperAdmin={true}
            users={users}
            totalUsers={totalUsers}
            page={page}
            rowsPerPage={rowsPerPage}
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            userStats={userStats}
            userDetail={userDetail}
            loading={loading}
            userDetailLoading={userDetailLoading}
            isCreating={isCreating}
            isCreatingAdmin={isCreatingAdmin}
            isUpdating={isUpdating}
            isStatusChanging={isStatusChanging}
            isPermanentDeleting={isPermanentDeleting}
            error={error}
            successMessage={successMessage}
            createError={createError}
            createAdminError={createAdminError}
            updateError={updateError}
            statusChangeError={statusChangeError}
            permanentDeleteError={permanentDeleteError}
            onFetchUsers={handleFetchUsers}
            onFetchUserStats={handleFetchUserStats}
            onFetchUserById={handleFetchUserById}
            onCreateUser={handleCreateUser}
            onCreateAdmin={handleCreateAdmin}
            onUpdateUser={handleUpdateUser}
            onActivateUser={handleActivateUser}
            onDeactivateUser={handleDeactivateUser}
            onSuspendUser={handleSuspendUser}
            onUnlockUser={handleUnlockUser}
            onSoftDeleteUser={handleSoftDeleteUser}
            onRestoreUser={handleRestoreUser}
            onPermanentDeleteUser={handlePermanentDeleteUser}
            onSetSearchQuery={handleSetSearchQuery}
            onSetRoleFilter={handleSetRoleFilter}
            onSetStatusFilter={handleSetStatusFilter}
            onSetPage={handleSetPage}
            onSetPageSize={handleSetPageSize}
            onClearSelectedUserDetail={handleClearSelectedUserDetail}
            onClearSuccessMessage={handleClearSuccessMessage}
        />
    );
}

