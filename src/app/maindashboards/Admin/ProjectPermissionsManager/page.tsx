'use client';
import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
}

interface Permission {
    permissionid: number;
    userid: string;
    projectid: number;
    can_create_phase: boolean;
    can_edit_phase: boolean;
    can_delete_phase: boolean;
    can_create_task: boolean;
    can_edit_task: boolean;
    can_delete_task: boolean;
    can_assign_task: boolean;
    can_delete_project: boolean;
    expires_at: string | null;
    is_active: boolean;
    granted_by: string;
    granted_at: string;
    users: User;
    granted_by_user: User;
}

interface ProjectPermissionsManagerProps {
    projectId: number;
    currentUserId: string;
    currentUserRole: string;
}

export default function ProjectPermissionsManager({
    projectId,
    currentUserId,
    currentUserRole
}: ProjectPermissionsManagerProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [permissionData, setPermissionData] = useState({
        can_create_phase: false,
        can_edit_phase: false,
        can_delete_phase: false,
        can_create_task: false,
        can_edit_task: false,
        can_delete_task: false,
        can_assign_task: false,
        can_delete_project: false,
        expires_at: ''
    });
    const [showForm, setShowForm] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

    const canManagePermissions = ['admin', 'project_manager', 'lead_full_stack_developer'].includes(currentUserRole);

    useEffect(() => {
        if (canManagePermissions) {
            fetchUsers();
            fetchPermissions();
        }
    }, [projectId, canManagePermissions]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users/list');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            if (data.users) {
                setUsers(data.users.filter((user: User) => user.id !== currentUserId));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchPermissions = async () => {
        try {
            setLoadingPermissions(true);
            const response = await fetch(`/api/projects/${projectId}/permissions`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch permissions');
            }

            const data = await response.json();
            setPermissions(data.permissions || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            setError(error instanceof Error ? error.message : 'Failed to load permissions');
            setPermissions([]);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setPermissionData(prev => ({ ...prev, [name]: checked }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPermissionData(prev => ({ ...prev, expires_at: e.target.value }));
    };

    const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        setSelectedUserId(userId);

        const existingPermission = permissions.find(p => p.userid === userId && p.is_active);
        if (existingPermission) {
            setEditingPermission(existingPermission);
            setPermissionData({
                can_create_phase: existingPermission.can_create_phase,
                can_edit_phase: existingPermission.can_edit_phase,
                can_delete_phase: existingPermission.can_delete_phase,
                can_create_task: existingPermission.can_create_task,
                can_edit_task: existingPermission.can_edit_task,
                can_delete_task: existingPermission.can_delete_task,
                can_assign_task: existingPermission.can_assign_task,
                can_delete_project: existingPermission.can_delete_project,
                expires_at: existingPermission.expires_at ?
                    new Date(existingPermission.expires_at).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingPermission(null);
            setPermissionData({
                can_create_phase: false,
                can_edit_phase: false,
                can_delete_phase: false,
                can_create_task: false,
                can_edit_task: false,
                can_delete_task: false,
                can_assign_task: false,
                can_delete_project: false,
                expires_at: ''
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) {
            setError('Please select a user');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/projects/${projectId}/permissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: selectedUserId,
                    ...permissionData,
                    expires_at: permissionData.expires_at || null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update permissions');
            }

            const data = await response.json();
            setSuccess(editingPermission ? 'Permissions updated!' : 'Permissions granted!');

            // Refresh the permissions list
            await fetchPermissions();

            // Reset form
            setSelectedUserId('');
            setPermissionData({
                can_create_phase: false,
                can_edit_phase: false,
                can_delete_phase: false,
                can_create_task: false,
                can_edit_task: false,
                can_delete_task: false,
                can_assign_task: false,
                can_delete_project: false,
                expires_at: ''
            });
            setEditingPermission(null);
            setShowForm(false);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokePermission = async (permissionId: number, userId: string) => {
        if (!confirm('Are you sure you want to revoke these permissions?')) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${projectId}/permissions?userid=${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to revoke permissions');
            }

            setSuccess('Permissions revoked successfully!');

            // Refresh permissions list
            await fetchPermissions();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to revoke permissions');
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'project_manager': return 'bg-purple-100 text-purple-800';
            case 'lead_full_stack_developer': return 'bg-orange-100 text-orange-800';
            case 'full_stack_developer': return 'bg-blue-100 text-blue-800';
            case 'seo_developer': return 'bg-green-100 text-green-800';
            case 'client': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    };

    // Filter out users who already have active permissions
    const availableUsers = users.filter(user =>
        !permissions.some(p => p.userid === user.id && p.is_active)
    );

    if (!canManagePermissions) {
        return null;
    }

    return (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Project Permissions</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    disabled={loadingPermissions}
                >
                    {showForm ? 'Cancel' : 'Grant Permissions'}
                </button>
            </div>

            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">
                        {editingPermission ? 'Edit Permissions' : 'Grant New Permissions'}
                    </h4>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Select User</label>
                            <select
                                value={selectedUserId}
                                onChange={handleUserSelect}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required
                                disabled={loadingPermissions}
                            >
                                <option value="">Select a user...</option>
                                {editingPermission ? (
                                    <option value={editingPermission.userid}>
                                        {editingPermission.users.name} ({editingPermission.users.email})
                                    </option>
                                ) : (
                                    availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email}) - {user.role.replace(/_/g, ' ')}
                                        </option>
                                    ))
                                )}
                            </select>
                            {availableUsers.length === 0 && !editingPermission && (
                                <p className="text-sm text-gray-500 mt-1">
                                    All users already have permissions for this project.
                                </p>
                            )}
                        </div>

                        {selectedUserId && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Phase Permissions</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="can_create_phase"
                                                name="can_create_phase"
                                                checked={permissionData.can_create_phase}
                                                onChange={handlePermissionChange}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor="can_create_phase" className="ml-2 text-sm">
                                                Create Phases
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="can_edit_phase"
                                                name="can_edit_phase"
                                                checked={permissionData.can_edit_phase}
                                                onChange={handlePermissionChange}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor="can_edit_phase" className="ml-2 text-sm">
                                                Edit Phases
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="can_delete_phase"
                                                name="can_delete_phase"
                                                checked={permissionData.can_delete_phase}
                                                onChange={handlePermissionChange}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor="can_delete_phase" className="ml-2 text-sm">
                                                Delete Phases
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Task Permissions</label>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="can_create_task"
                                                name="can_create_task"
                                                checked={permissionData.can_create_task}
                                                onChange={handlePermissionChange}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor="can_create_task" className="ml-2 text-sm">
                                                Create Tasks
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="can_edit_task"
                                                name="can_edit_task"
                                                checked={permissionData.can_edit_task}
                                                onChange={handlePermissionChange}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor="can_edit_task" className="ml-2 text-sm">
                                                Edit Tasks
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="can_delete_task"
                                                name="can_delete_task"
                                                checked={permissionData.can_delete_task}
                                                onChange={handlePermissionChange}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor="can_delete_task" className="ml-2 text-sm">
                                                Delete Tasks
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="can_assign_task"
                                                name="can_assign_task"
                                                checked={permissionData.can_assign_task}
                                                onChange={handlePermissionChange}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor="can_assign_task" className="ml-2 text-sm">
                                                Assign Tasks
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="can_delete_project"
                                            name="can_delete_project"
                                            checked={permissionData.can_delete_project}
                                            onChange={handlePermissionChange}
                                            className="h-4 w-4 text-red-600 rounded"
                                        />
                                        <label htmlFor="can_delete_project" className="ml-2 text-sm text-red-600 font-medium">
                                            Delete Project (Dangerous!)
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">
                                        Grants ability to delete the entire project - use with caution
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Expiration Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={permissionData.expires_at}
                                        onChange={handleDateChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave empty for permissions that never expire
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading || !selectedUserId}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : editingPermission ? 'Update Permissions' : 'Grant Permissions'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setSelectedUserId('');
                                    setEditingPermission(null);
                                    setError(null);
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                <h4 className="text-lg font-semibold mb-3">Current Permissions</h4>

                {loadingPermissions ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-3 text-gray-600">Loading permissions...</p>
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-gray-500">No custom permissions granted yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Use the "Grant Permissions" button to add new permissions</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {permissions.map(permission => (
                            <div key={permission.permissionid} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {permission.users.avatar_url ? (
                                                <img
                                                    src={permission.users.avatar_url}
                                                    alt={permission.users.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {permission.users.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">{permission.users.name}</span>
                                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getRoleColor(permission.users.role)}`}>
                                                    {permission.users.role.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 ml-10">{permission.users.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRevokePermission(permission.permissionid, permission.userid)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded"
                                        disabled={loading}
                                    >
                                        Revoke
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 ml-10">
                                    {permission.can_create_phase && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Create Phases</span>
                                    )}
                                    {permission.can_edit_phase && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Edit Phases</span>
                                    )}
                                    {permission.can_delete_phase && (
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">Delete Phases</span>
                                    )}
                                    {permission.can_create_task && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Create Tasks</span>
                                    )}
                                    {permission.can_edit_task && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Edit Tasks</span>
                                    )}
                                    {permission.can_delete_task && (
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">Delete Tasks</span>
                                    )}
                                    {permission.can_assign_task && (
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">Assign Tasks</span>
                                    )}
                                    {permission.can_delete_project && (
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold border border-red-300">Delete Project</span>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 ml-10 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Granted by: {permission.granted_by_user?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Granted: {formatDate(permission.granted_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Expires: {formatDate(permission.expires_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block w-2 h-2 rounded-full ${permission.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className={permission.is_active ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                            {permission.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}