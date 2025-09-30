'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestProgressForm() {
  const [formData, setFormData] = useState({
    client_name: '',
    department: '',
    total_tasks: 0,
    completed_tasks: 0,
    in_progress_tasks: 0,
    pending_tasks: 0
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_tasks') ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('test_progress')
        .insert([formData])
        .select();

      if (error) {
        setMessage(`Error: ${error.message}`);
        console.error('Supabase error:', error);
      } else {
        setMessage('Success! Data inserted with ID: ' + data[0].id);
        // Reset form
        setFormData({
          client_name: '',
          department: '',
          total_tasks: 0,
          completed_tasks: 0,
          in_progress_tasks: 0,
          pending_tasks: 0
        });
      }
    } catch (err) {
      setMessage('Unexpected error: ' + err.message);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Test Supabase Insert (New Table)</h2>
      <p>Environment variables:</p>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</li>
      </ul>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Client Name: </label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            required
            placeholder="e.g., Acme Corp"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Department: </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            placeholder="e.g., Marketing"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Total Tasks: </label>
          <input
            type="number"
            name="total_tasks"
            value={formData.total_tasks}
            onChange={handleChange}
            min="0"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Completed Tasks: </label>
          <input
            type="number"
            name="completed_tasks"
            value={formData.completed_tasks}
            onChange={handleChange}
            min="0"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>In Progress Tasks: </label>
          <input
            type="number"
            name="in_progress_tasks"
            value={formData.in_progress_tasks}
            onChange={handleChange}
            min="0"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Pending Tasks: </label>
          <input
            type="number"
            name="pending_tasks"
            value={formData.pending_tasks}
            onChange={handleChange}
            min="0"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Inserting...' : 'Insert Data'}
        </button>
      </form>
      
      {message && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
          border: `1px solid ${message.includes('Error') ? '#ffcdd2' : '#c8e6c9'}`,
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}