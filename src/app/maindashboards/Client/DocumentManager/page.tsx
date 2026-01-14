'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Document {
  document_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  description: string
  project_name: string
  tags: string[]
  is_shared: boolean
  created_at: string
  updated_at: string
  download_url: string
  client_name: string
  company_name: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
  roleData: any
}

export default function DocumentManager() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    description: '',
    projectName: '',
    tags: ''
  })

  // Fetch user and documents
  useEffect(() => {
    fetchUserAndDocuments()
  }, [])

  const fetchUserAndDocuments = async () => {
    try {
      setLoading(true)
      
      // Fetch user from session API
      const userRes = await fetch('/api/auth/session')
      if (userRes.ok) {
        const { user: userData } = await userRes.json()
        setUser(userData)
        
        // Only fetch documents if user is client or admin
        if (userData?.role === 'client' || userData?.role === 'admin') {
          await fetchDocuments()
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not allowed')
      return
    }

    await uploadDocument(file)
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadDocument = async (file: File) => {
    if (!user || user.role !== 'client') {
      toast.error('Only clients can upload documents')
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', uploadForm.description)
      formData.append('projectName', uploadForm.projectName)
      formData.append('tags', uploadForm.tags)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Document uploaded successfully')
        setUploadForm({ description: '', projectName: '', tags: '' })
        await fetchDocuments() // Refresh list
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

  const handleDownload = async (document: Document) => {
    try {
      // Get signed URL
      const res = await fetch(`/api/documents/${document.document_id}/download`)
      if (res.ok) {
        const { url } = await res.json()
        window.open(url, '_blank')
      } else {
        toast.error('Failed to get download link')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Download failed')
    }
  }

  const handleEdit = (document: Document) => {
    // Navigate to edit page or open modal
    router.push(`/documents/${document.document_id}/edit`)
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Document deleted successfully')
        await fetchDocuments() // Refresh list
      } else {
        const data = await res.json()
        toast.error(data.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Delete failed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user?.role !== 'client' && user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <div className="text-amber-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only clients and administrators can access document management.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin' ? 'Manage all client documents' : 'Manage your project documents'}
          </p>
        </div>
        
        {user?.role === 'client' && (
          <div className="flex items-center space-x-4">
            <button
              onClick={handleFileSelect}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Document
                </>
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
            />
          </div>
        )}
      </div>

      {/* Upload Form (Collapsible) */}
      {user?.role === 'client' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Document Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={uploadForm.projectName}
                onChange={(e) => setUploadForm({...uploadForm, projectName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Related project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'client' ? 'Get started by uploading your first document.' : 'No documents found for this client.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.document_id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {doc.mime_type.includes('pdf') ? (
                        <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold">PDF</span>
                        </div>
                      ) : doc.mime_type.includes('word') ? (
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold">DOC</span>
                        </div>
                      ) : doc.mime_type.includes('image') ? (
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold">IMG</span>
                        </div>
                      ) : doc.mime_type.includes('excel') ? (
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold">XLS</span>
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 font-bold">FILE</span>
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.file_name}
                        </p>
                        {doc.is_shared && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Shared
                          </span>
                        )}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {doc.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{doc.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 space-x-4">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>Uploaded {formatDate(doc.created_at)}</span>
                        {doc.project_name && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">{doc.project_name}</span>
                          </>
                        )}
                        {user?.role === 'admin' && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600">{doc.company_name}</span>
                          </>
                        )}
                      </div>
                      
                      {doc.description && (
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                    
                    {(user?.role === 'admin' || (user?.role === 'client' && user.id === doc.client_id)) && (
                      <>
                        <button
                          onClick={() => handleEdit(doc)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDelete(doc.document_id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Statistics */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Documents</div>
            <div className="text-2xl font-semibold text-gray-900">{documents.length}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Size</div>
            <div className="text-2xl font-semibold text-gray-900">
              {formatFileSize(documents.reduce((sum, doc) => sum + doc.file_size, 0))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Shared Documents</div>
            <div className="text-2xl font-semibold text-gray-900">
              {documents.filter(doc => doc.is_shared).length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Last Upload</div>
            <div className="text-2xl font-semibold text-gray-900">
              {documents.length > 0 ? formatDate(documents[0].created_at).split(',')[0] : 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}