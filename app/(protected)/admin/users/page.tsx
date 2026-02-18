'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { UserManagementPage } from '@/components/features/user-management';
import { CreateUserRequest, UpdateUserRequest } from '@/features/admin';
import {
    // Thunks
    fetchUsers,
    fetchUserStats,
    fetchUserById,
    createUserAsync,
    updateUserAsync,
    activateUserAsync,
    deactivateUserAsync,
    suspendUserAsync,
    unlockUserAsync,
    softDeleteUserAsync,
    // Actions
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    clearSelectedUserDetail,
    clearSuccessMessage,
    // Selectors
    selectAdminUsers,
    selectAdminTotalUsers,
    selectAdminCurrentPage,
    selectAdminPageSize,
    selectAdminSearchQuery,
    selectAdminRoleFilter,
    selectAdminStatusFilter,
    selectAdminStats,
    selectAdminIsLoading,
    selectAdminError,
    selectSelectedUserDetail,
    selectIsUserDetailLoading,
    selectIsCreating,
    selectIsUpdating,
    selectIsStatusChanging,
    selectSuccessMessage,
    selectCreateError,
    selectUpdateError,
    selectStatusChangeError,
} from '@/features/admin';
import { RoleType, StatusType } from '@/constants';

export default function AdminUsersPage() {
    const dispatch = useAppDispatch();

    // Selectors
    const users = useAppSelector(selectAdminUsers);
    const totalUsers = useAppSelector(selectAdminTotalUsers);
    const page = useAppSelector(selectAdminCurrentPage);
    const rowsPerPage = useAppSelector(selectAdminPageSize);
    const searchQuery = useAppSelector(selectAdminSearchQuery);
    const roleFilter = useAppSelector(selectAdminRoleFilter);
    const statusFilter = useAppSelector(selectAdminStatusFilter);
    const userStats = useAppSelector(selectAdminStats);
    const loading = useAppSelector(selectAdminIsLoading);
    const error = useAppSelector(selectAdminError);
    const userDetail = useAppSelector(selectSelectedUserDetail);
    const userDetailLoading = useAppSelector(selectIsUserDetailLoading);
    const isCreating = useAppSelector(selectIsCreating);
    const isUpdating = useAppSelector(selectIsUpdating);
    const isStatusChanging = useAppSelector(selectIsStatusChanging);
    const successMessage = useAppSelector(selectSuccessMessage);
    const createError = useAppSelector(selectCreateError);
    const updateError = useAppSelector(selectUpdateError);
    const statusChangeError = useAppSelector(selectStatusChangeError);

    // Handlers
    const handleFetchUsers = useCallback(() => {
        dispatch(fetchUsers({ page, size: rowsPerPage, searchQuery, roleFilter, statusFilter }));
    }, [dispatch, page, rowsPerPage, searchQuery, roleFilter, statusFilter]);

    const handleFetchUserStats = useCallback(() => {
        dispatch(fetchUserStats());
    }, [dispatch]);

    const handleFetchUserById = useCallback((id: number) => {
        dispatch(fetchUserById(id));
    }, [dispatch]);

    const handleCreateUser = useCallback((data: CreateUserRequest) => {
        dispatch(createUserAsync(data));
    }, [dispatch]);

    const handleUpdateUser = useCallback((id: number, data: UpdateUserRequest) => {
        dispatch(updateUserAsync({ id, data }));
    }, [dispatch]);

    const handleActivateUser = useCallback((id: number) => {
        dispatch(activateUserAsync(id));
    }, [dispatch]);

    const handleDeactivateUser = useCallback((id: number) => {
        dispatch(deactivateUserAsync(id));
    }, [dispatch]);

    const handleSuspendUser = useCallback((id: number) => {
        dispatch(suspendUserAsync(id));
    }, [dispatch]);

    const handleUnlockUser = useCallback((id: number) => {
        dispatch(unlockUserAsync(id));
    }, [dispatch]);

    const handleSoftDeleteUser = useCallback((id: number) => {
        dispatch(softDeleteUserAsync(id));
    }, [dispatch]);

    const handleSetSearchQuery = useCallback((query: string) => {
        dispatch(setSearchQuery(query));
    }, [dispatch]);

    const handleSetRoleFilter = useCallback((role: RoleType | '') => {
        dispatch(setRoleFilter(role));
    }, [dispatch]);

    const handleSetStatusFilter = useCallback((status: StatusType | '') => {
        dispatch(setStatusFilter(status));
    }, [dispatch]);

    const handleSetPage = useCallback((newPage: number) => {
        dispatch(setCurrentPage(newPage));
    }, [dispatch]);

    const handleSetPageSize = useCallback((size: number) => {
        dispatch(setPageSize(size));
    }, [dispatch]);

    const handleClearSelectedUserDetail = useCallback(() => {
        dispatch(clearSelectedUserDetail());
    }, [dispatch]);

    const handleClearSuccessMessage = useCallback(() => {
        dispatch(clearSuccessMessage());
    }, [dispatch]);

    return (
        <UserManagementPage
            title="User Management"
            subtitle="Admin Dashboard - Manage all users"
            isSuperAdmin={false}
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
            isUpdating={isUpdating}
            isStatusChanging={isStatusChanging}
            error={error}
            successMessage={successMessage}
            createError={createError}
            updateError={updateError}
            statusChangeError={statusChangeError}
            onFetchUsers={handleFetchUsers}
            onFetchUserStats={handleFetchUserStats}
            onFetchUserById={handleFetchUserById}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onActivateUser={handleActivateUser}
            onDeactivateUser={handleDeactivateUser}
            onSuspendUser={handleSuspendUser}
            onUnlockUser={handleUnlockUser}
            onSoftDeleteUser={handleSoftDeleteUser}
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

