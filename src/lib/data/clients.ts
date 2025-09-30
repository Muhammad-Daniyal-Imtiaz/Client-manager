export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  createdAt: Date;
  status: 'Active' | 'Inactive' | 'Prospect';
}

export const sampleClients: Client[] = [
  {
    id: 'client-1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    website: 'https://acme.com',
    industry: 'Technology',
    createdAt: new Date('2024-01-15'),
    status: 'Active'
  },
  {
    id: 'client-2',
    name: 'Green Gardens LLC',
    email: 'info@greengardens.com',
    phone: '+1-555-0456',
    website: 'https://greengardens.com',
    industry: 'Landscaping',
    createdAt: new Date('2024-02-20'),
    status: 'Active'
  },
  {
    id: 'client-3',
    name: 'TechStart Inc',
    email: 'hello@techstart.io',
    phone: '+1-555-0789',
    website: 'https://techstart.io',
    industry: 'SaaS',
    createdAt: new Date('2024-03-10'),
    status: 'Prospect'
  }
]; 