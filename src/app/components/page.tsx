'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Search, Filter, Download, Trash2, Eye, 
  FileText, Calendar, User, Building, 
  ChevronLeft, ChevronRight, CheckCircle,
  FileUp, AlertCircle, Users, FolderOpen,
  Shield, Briefcase, Code, Users2
} from 'lucide-react'
import { format } from 'date-fns'

interface TeamDocument {
  document_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  description: string
  role_type: string
  project_name: string
  department: string
  tags: string[]
  is_shared: boolean
  access_roles: string[]
  uploaded_by: string
  uploader_name: string
  uploader_email: string
  uploader_role: string
  created_at: string
  updated_at: string
  download_url: string
}

interface UserInfo {
  id: string
  email: string
  name: string
  role: string
}

export default function TeamDocumentsManager() {
  const router = useRouter()
  
  // State
  const [documents, setDocuments] = useState<TeamDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    roleType: '',
    projectName: '',
    department: '',
    showOnlyMine: false
  })

  const [showFilters, setShowFilters] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [uploading, setUploading] = useState(false)

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUserInfo(data.user)
          return data.user
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching user info:', error)
      return null
    }
  }, [])

  // Fetch team documents
  const fetchTeamDocuments = useCallback(async () => {
    try {
      setLoading(true)
      
      const user = await fetchUserInfo()
      if (!user) {
        toast.error('Please log in to access team documents')
        router.push('/login')
        return
      }

      // Check if user has team role
      const teamRoles = ['admin', 'project_manager', 'full_stack_developer', 'lead_full_stack_developer']
      if (!teamRoles.includes(user.role)) {
        toast.error('Access denied: Team members only')
        router.push('/')
        return
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.roleType) params.append('roleType', filters.roleType)
      if (filters.projectName) params.append('projectName', filters.projectName)
      if (filters.department) params.append('department', filters.department)

      const response = await fetch(`/api/team/documents?${params}`)
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Team access required')
          router.push('/')
          return
        }
        throw new Error('Failed to fetch team documents')
      }

      const data = await response.json()
      
      if (data.success) {
        let filteredDocs = data.documents || []
        
        // Filter to show only my documents if enabled
        if (filters.showOnlyMine && user) {
          filteredDocs = filteredDocs.filter((doc: TeamDocument) => doc.uploaded_by === user.id)
        }
        
        setDocuments(filteredDocs)
      } else {
        toast.error(data.error || 'Failed to load team documents')
      }
    } catch (error) {
      console.error('Error fetching team documents:', error)
      toast.error('Failed to load team documents')
    } finally {
      setLoading(false)
    }
  }, [filters, fetchUserInfo, router])

  // Initial load
  useEffect(() => {
    fetchUserInfo()
    fetchTeamDocuments()
  }, [fetchTeamDocuments, fetchUserInfo])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
  }

  // Get file icon based on type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel')) return '📊'
    if (mimeType.includes('image')) return '🖼️'
    return '📎'
  }

  // Get role icon and color
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { icon: <Shield className="h-4 w-4" />, color: 'bg-red-100 text-red-800', label: 'Admin' }
      case 'project_manager':
        return { icon: <Briefcase className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800', label: 'Project Manager' }
      case 'lead_full_stack_developer':
        return { icon: <Users2 className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800', label: 'Lead Developer' }
      case 'full_stack_developer':
        return { icon: <Code className="h-4 w-4" />, color: 'bg-green-100 text-green-800', label: 'Developer' }
      default:
        return { icon: <User className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800', label: role }
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!userInfo) {
      toast.error('Please log in to upload documents')
      return
    }

    // Check file size (max 50MB for team)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/gif',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', 'application/x-rar-compressed',
      'application/x-7z-compressed'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not allowed')
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', 'Team document')
      formData.append('projectName', 'General')
      formData.append('department', 'Development')

      const response = await fetch('/api/team/documents', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Document uploaded successfully')
        fetchTeamDocuments() // Refresh list
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Handle filter change
  const handleFilterChange = (key: keyof typeof filters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Apply filters
  const applyFilters = () => {
    fetchTeamDocuments()
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      roleType: '',
      projectName: '',
      department: '',
      showOnlyMine: false
    })
    fetchTeamDocuments()
  }

  // Handle document download
  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/team/documents/${documentId}/download`)
      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          const a = document.createElement('a')
          a.href = data.url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } else {
        toast.error('Failed to download document')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Download failed')
    }
  }

  // Handle document delete
  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/team/documents/${documentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Document deleted successfully')
        fetchTeamDocuments() // Refresh list
      } else {
        toast.error(data.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Delete failed')
    }
  }

  if (loading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if user has team role
  if (userInfo && !['admin', 'project_manager', 'full_stack_developer', 'lead_full_stack_developer'].includes(userInfo.role)) {
    return (
      <div className="text-center p-8">
        <div className="text-amber-600 mb-4">
          <Shield className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Team Access Required</h3>
        <p className="text-gray-600">Only team members (Admin, Project Manager, Developers) can access this area.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Documents</h1>
            <p className="text-gray-600 mt-2">Shared documents for team collaboration</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {userInfo && getRoleInfo(userInfo.role).icon}
              <span className="font-medium">{userInfo?.name || 'Team Member'}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleInfo(userInfo?.role || '').color}`}>
                {getRoleInfo(userInfo?.role || '').label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Documents</div>
              <div className="text-2xl font-semibold text-gray-900">{documents.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Team Members</div>
              <div className="text-2xl font-semibold text-gray-900">
                {new Set(documents.map(doc => doc.uploaded_by)).size}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FolderOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Projects</div>
              <div className="text-2xl font-semibold text-gray-900">
                {new Set(documents.map(doc => doc.project_name).filter(Boolean)).size}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FileUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Shared</div>
              <div className="text-2xl font-semibold text-gray-900">
                {documents.filter(doc => doc.is_shared).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search team documents..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Role Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Type
                </label>
                <select
                  value={filters.roleType}
                  onChange={(e) => handleFilterChange('roleType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="lead_full_stack_developer">Lead Developer</option>
                  <option value="full_stack_developer">Developer</option>
                </select>
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <input
                  type="text"
                  placeholder="Project name..."
                  value={filters.projectName}
                  onChange={(e) => handleFilterChange('projectName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Department..."
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Show Only Mine */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showOnlyMine"
                  checked={filters.showOnlyMine}
                  onChange={(e) => handleFilterChange('showOnlyMine', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="showOnlyMine" className="ml-2 text-sm text-gray-700">
                  Show only my documents
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Upload Team Document</h3>
            <p className="text-sm text-gray-500">Share files with your team members</p>
          </div>
          
          <input
            type="file"
            id="team-file-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
              e.target.value = ''
            }}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx,.zip,.rar,.7z"
          />
          
          <button
            onClick={() => document.getElementById('team-file-upload')?.click()}
            disabled={uploading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.values(filters).some(v => v && v !== false) 
                ? 'No documents match your filters' 
                : 'Be the first to upload a team document!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => {
                  const roleInfo = getRoleInfo(doc.uploader_role)
                  return (
                    <tr key={doc.document_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{getFileIcon(doc.mime_type)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {doc.file_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doc.description || 'No description'}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-400">
                                {formatFileSize(doc.file_size)}
                              </span>
                              {doc.tags && doc.tags.length > 0 && (
                                <>
                                  <span className="mx-2">•</span>
                                  <div className="flex flex-wrap gap-1">
                                    {doc.tags.slice(0, 2).map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {doc.tags.length > 2 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        +{doc.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${roleInfo.color.split(' ')[0]}`}>
                            {roleInfo.icon}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {doc.uploader_name}
                            </div>
                            <div className="text-xs text-gray-500">{doc.uploader_email}</div>
                            <div className={`mt-1 px-2 py-0.5 rounded text-xs font-medium ${roleInfo.color}`}>
                              {roleInfo.label}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {doc.project_name || 'General'}
                        </div>
                        {doc.department && (
                          <div className="text-xs text-gray-500">{doc.department}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {doc.access_roles?.map((role, idx) => {
                            const accessRoleInfo = getRoleInfo(role)
                            return (
                              <span
                                key={idx}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${accessRoleInfo.color}`}
                                title={`Accessible by ${accessRoleInfo.label}`}
                              >
                                {accessRoleInfo.icon}
                              </span>
                            )
                          })}
                          {doc.is_shared && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Users className="h-3 w-3 mr-1" />
                              Shared
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(doc.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {doc.download_url && (
                            <button
                              onClick={() => handleDownload(doc.document_id, doc.file_name)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {(userInfo?.role === 'admin' || userInfo?.id === doc.uploaded_by) && (
                            <button
                              onClick={() => handleDelete(doc.document_id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}