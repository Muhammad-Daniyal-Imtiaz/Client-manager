// In the GET method, after fetching documents:
const { data: documents, error } = await supabase
  .rpc('get_client_documents', { client_uuid: targetClientId })

if (error) {
  console.error('Error fetching documents:', error)
  return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
}

// Generate download URLs for each document
const documentsWithUrls = await Promise.all(
  documents.map(async (doc: any) => {
    try {
      const { data: signedUrl } = await supabase
        .storage
        .from('client_project_documents')
        .createSignedUrl(doc.file_path.replace('client_project_documents/', ''), 60)
      
      return {
        ...doc,
        download_url: signedUrl?.signedUrl || null
      }
    } catch (urlError) {
      console.error('Error generating URL for document:', doc.document_id, urlError)
      return {
        ...doc,
        download_url: null
      }
    }
  })
)

return NextResponse.json({ documents: documentsWithUrls })