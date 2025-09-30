export interface Task {
  id: string;
  name: string;
  phase: string;
  assignedTo: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  clientId?: string;
}

export const seoTasks: Task[] = [
  // Phase 1 - Site Foundations
  {
    id: 'seo-1-1',
    name: 'Website Brief (Description, Audience, Conversions, Competitors, etc.)',
    phase: 'Phase 1 - Site Foundations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-1-2',
    name: 'Website Structure Mapping',
    phase: 'Phase 1 - Site Foundations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-1-3',
    name: 'Setup Google Search Console',
    phase: 'Phase 1 - Site Foundations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-1-4',
    name: 'Setup Google Analytics',
    phase: 'Phase 1 - Site Foundations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-1-5',
    name: 'Setup Google Business Profile',
    phase: 'Phase 1 - Site Foundations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-1-6',
    name: 'Initial Site Audit (WebsiteAuditor)',
    phase: 'Phase 1 - Site Foundations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-1-7',
    name: 'Initial Site Audit (ChatGPT)',
    phase: 'Phase 1 - Site Foundations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 2 - Keyword Research
  {
    id: 'seo-2-1',
    name: 'Keyword Research',
    phase: 'Phase 2 - Keyword Research',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-2-2',
    name: 'Keyword Clustering',
    phase: 'Phase 2 - Keyword Research',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 2 - Content Strategy
  {
    id: 'seo-2-3',
    name: 'Develop Content Strategy',
    phase: 'Phase 2 - Content Strategy',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-2-4',
    name: 'Submit Blog Post Pitches to Content Team',
    phase: 'Phase 2 - Content Strategy',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 3 - On-Page Optimizations
  {
    id: 'seo-3-1',
    name: 'URL Slugs',
    phase: 'Phase 3 - On-Page Optimizations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-2',
    name: 'Meta Tags',
    phase: 'Phase 3 - On-Page Optimizations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-3',
    name: 'Headlines (H1)',
    phase: 'Phase 3 - On-Page Optimizations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-4',
    name: 'Body Content (Keyword Targeting and Quality Assurance)',
    phase: 'Phase 3 - On-Page Optimizations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-5',
    name: 'Header Structure',
    phase: 'Phase 3 - On-Page Optimizations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-6',
    name: 'Internal Links',
    phase: 'Phase 3 - On-Page Optimizations',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 3 - Image and Video SEO
  {
    id: 'seo-3-7',
    name: 'Add Engaging Visual Content wherever appropriate',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-8',
    name: 'Image File Names',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-9',
    name: 'Image File Size',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-10',
    name: 'Image Alt Texts',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-11',
    name: 'Image Contextual Support',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-12',
    name: 'Video File Names',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-13',
    name: 'Video Files Size',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-14',
    name: 'Video Description',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-3-15',
    name: 'Video Contextual Support',
    phase: 'Phase 3 - Image and Video SEO',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4 - Indexation
  {
    id: 'seo-4-1',
    name: 'Make Sure Website is Indexable',
    phase: 'Phase 4 - Indexation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4 - Responsiveness
  {
    id: 'seo-4-2',
    name: 'Make Sure Website is Responsive to Mobile Screens',
    phase: 'Phase 4 - Responsiveness',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-4-3',
    name: 'Make Sure Website is Responsive to Tablet Screens',
    phase: 'Phase 4 - Responsiveness',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4 - Schema Markup
  {
    id: 'seo-4-4',
    name: 'Identify Existing Schema Markups',
    phase: 'Phase 4 - Schema Markup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-4-5',
    name: 'List Needed Schema Markups',
    phase: 'Phase 4 - Schema Markup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-4-6',
    name: 'Schema Markup Implementations',
    phase: 'Phase 4 - Schema Markup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4 - Site Speed
  {
    id: 'seo-4-7',
    name: 'Run PageSpeedInsights Audit',
    phase: 'Phase 4 - Site Speed',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-4-8',
    name: 'Make Website Speed Healthy',
    phase: 'Phase 4 - Site Speed',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4 - Follow-up Audit
  {
    id: 'seo-4-9',
    name: 'Run a Site Audit in WebSite Auditor',
    phase: 'Phase 4 - Follow-up Audit',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-4-10',
    name: 'Identify Relevant Issues',
    phase: 'Phase 4 - Follow-up Audit',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-4-11',
    name: 'Implement Necessary Fixes',
    phase: 'Phase 4 - Follow-up Audit',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 5 - Performance Trackers
  {
    id: 'seo-5-1',
    name: 'Setup Google Analytics',
    phase: 'Phase 5 - Performance Trackers',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-5-2',
    name: 'Setup Google Tag Manager',
    phase: 'Phase 5 - Performance Trackers',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-5-3',
    name: 'Identify Micro-conversions',
    phase: 'Phase 5 - Performance Trackers',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'seo-5-4',
    name: 'Track Micro-conversions',
    phase: 'Phase 5 - Performance Trackers',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 5 - Performance Reports
  {
    id: 'seo-5-5',
    name: 'Initiate Monthly SEO Reports',
    phase: 'Phase 5 - Performance Reports',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 6
  {
    id: 'seo-6-1',
    name: 'Develop Backlink Strategies',
    phase: 'Phase 6',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  }
];

export const getTasksByPhase = (tasks: Task[]) => {
  const phases = [...new Set(tasks.map(task => task.phase))];
  return phases.map(phase => ({
    phase,
    tasks: tasks.filter(task => task.phase === phase)
  }));
}; 