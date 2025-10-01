'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProjectDocumentManager() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch documents when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchDocuments(selectedProject.projectid);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdat', { ascending: false });
      
      if (error) throw error;
      
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error.message);
      alert('Error loading projects: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (projectId) => {
    try {
      // List files in the project folder from Supabase Storage
      const { data, error } = await supabase.storage
        .from('project_documents')
        .list(`${selectedProject.projectname}/`);
      
      if (error) throw error;
      
      // Filter out folders and get document details
      const docs = data
        .filter(item => item.id !== null)
        .map(item => ({
          name: item.name,
          path: `${selectedProject.projectname}/${item.name}`,
          created: item.created_at,
          metadata: item.metadata
        }));
      
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error.message);
      alert('Error loading documents: ' + error.message);
    }
  };

  const handleUpload = async (e) => {
    try {
      setUploading(true);
      
      if (!selectedProject) {
        alert('Please select a project first');
        return;
      }
      
      const file = e.target.files[0];
      if (!file) return;
      
      // Get file name from user
      const fileName = prompt('Enter a name for this document:', file.name) || file.name;
      
      // Upload file to Supabase Storage in the project folder
      const { data, error } = await supabase.storage
        .from('project_documents')
        .upload(`${selectedProject.projectname}/${fileName}`, file);
      
      if (error) throw error;
      
      // Refresh documents list
      fetchDocuments(selectedProject.projectid);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error.message);
      alert('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const downloadDocument = async (documentPath, documentName) => {
    try {
      const { data, error } = await supabase.storage
        .from('project_documents')
        .download(documentPath);
      
      if (error) throw error;
      
      // Create a temporary URL for download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error.message);
      alert('Error downloading file: ' + error.message);
    }
  };

  const previewDocument = async (documentPath, documentName) => {
    try {
      const { data, error } = await supabase.storage
        .from('project_documents')
        .download(documentPath);
      
      if (error) throw error;
      
      // Create a temporary URL for preview
      const url = URL.createObjectURL(data);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing file:', error.message);
      alert('Error previewing file: ' + error.message);
    }
  };

  const deleteDocument = async (documentPath, documentName) => {
    if (!confirm(`Are you sure you want to delete "${documentName}"?`)) return;
    
    try {
      const { error } = await supabase.storage
        .from('project_documents')
        .remove([documentPath]);
      
      if (error) throw error;
      
      // Refresh documents list
      fetchDocuments(selectedProject.projectid);
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error.message);
      alert('Error deleting file: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Project Document Management System</h1>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Project Selection Panel */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ color: '#444', marginBottom: '20px' }}>Projects</h2>
          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.map(project => (
                <div
                  key={project.projectid}
                  onClick={() => setSelectedProject(project)}
                  style={{
                    padding: '15px',
                    borderRadius: '6px',
                    backgroundColor: selectedProject?.projectid === project.projectid ? '#e3f2fd' : 'white',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = selectedProject?.projectid === project.projectid ? '#e3f2fd' : 'white';
                  }}
                >
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{project.projectname}</h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{project.projecttype}</p>
                  {project.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#777' }}>
                      {project.description.length > 100 
                        ? `${project.description.substring(0, 100)}...` 
                        : project.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Document Management Panel */}
        <div style={{ flex: '2', minWidth: '500px' }}>
          {selectedProject ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#444', margin: 0 }}>
                  Documents for: {selectedProject.projectname}
                </h2>
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="file-upload"
                    style={{
                      padding: '10px 15px',
                      backgroundColor: uploading ? '#ccc' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </label>
                </div>
              </div>
              
              {documents.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '8px',
                  border: '2px dashed #ddd'
                }}>
                  <p style={{ color: '#777', margin: '0' }}>No documents found for this project.</p>
                  <p style={{ color: '#999', margin: '10px 0 0 0' }}>Upload a document to get started.</p>
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>File Name</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Uploaded</th>
                        <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                          <td style={{ padding: '12px 15px', borderBottom: '1px solid #eee' }}>{doc.name}</td>
                          <td style={{ padding: '12px 15px', borderBottom: '1px solid #eee' }}>
                            {new Date(doc.created).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 15px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                            <button
                              onClick={() => previewDocument(doc.path, doc.name)}
                              style={{ 
                                margin: '0 5px', 
                                padding: '5px 10px', 
                                backgroundColor: '#2196F3', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => downloadDocument(doc.path, doc.name)}
                              style={{ 
                                margin: '0 5px', 
                                padding: '5px 10px', 
                                backgroundColor: '#4CAF50', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Download
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.path, doc.name)}
                              style={{ 
                                margin: '0 5px', 
                                padding: '5px 10px', 
                                backgroundColor: '#f44336', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '8px',
              border: '2px dashed #ddd'
            }}>
              <p style={{ color: '#777' }}>Select a project to view its documents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}