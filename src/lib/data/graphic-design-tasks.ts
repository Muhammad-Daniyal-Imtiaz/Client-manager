export interface Task {
  id: string;
  name: string;
  phase: string;
  assignedTo: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  clientId?: string;
  description?: string;
}

export const graphicDesignTasks: Task[] = [
  // Phase 1: Intake & Project Brief
  {
    id: 'gd-1-1',
    name: 'Receive design request or assignment from client or internal team',
    description: 'Initial project intake and assignment',
    phase: 'Phase 1: Intake & Project Brief',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-1-2',
    name: 'Clarify objectives, deliverables, deadlines, and platforms/formats needed',
    description: 'Define project scope and requirements',
    phase: 'Phase 1: Intake & Project Brief',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-1-3',
    name: 'Gather all required assets (brand guidelines, logos, content, references)',
    description: 'Collect necessary design assets and materials',
    phase: 'Phase 1: Intake & Project Brief',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-1-4',
    name: 'Request missing files, inspiration, or details from requester if needed',
    description: 'Follow up for missing information or assets',
    phase: 'Phase 1: Intake & Project Brief',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-1-5',
    name: 'Confirm project brief, deadlines, and expectations with requester',
    description: 'Finalize project agreement and timeline',
    phase: 'Phase 1: Intake & Project Brief',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 2: Research & Ideation
  {
    id: 'gd-2-1',
    name: 'Review brand guidelines, past projects, and current visual assets',
    description: 'Analyze existing brand materials and design history',
    phase: 'Phase 2: Research & Ideation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-2-2',
    name: 'Research design trends relevant to project goals and platforms',
    description: 'Stay current with design trends and best practices',
    phase: 'Phase 2: Research & Ideation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-2-3',
    name: 'Analyze competitor visuals for inspiration and differentiation',
    description: 'Study competitor designs for market positioning',
    phase: 'Phase 2: Research & Ideation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-2-4',
    name: 'Brainstorm creative direction and sketch initial ideas/concepts',
    description: 'Develop initial design concepts and creative direction',
    phase: 'Phase 2: Research & Ideation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 3: Design & Creation
  {
    id: 'gd-3-1',
    name: 'Select appropriate tools or templates for project (e.g. Canva, Adobe, Figma)',
    description: 'Choose the right design tools and platforms',
    phase: 'Phase 3: Design & Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-3-2',
    name: 'Create draft designs based on project brief and brand style',
    description: 'Develop initial design drafts',
    phase: 'Phase 3: Design & Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-3-3',
    name: 'Incorporate required text, images, and elements (logos, colors, fonts)',
    description: 'Add all required content and brand elements',
    phase: 'Phase 3: Design & Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-3-4',
    name: 'Ensure design fits intended dimensions and platform requirements',
    description: 'Verify design specifications and platform compatibility',
    phase: 'Phase 3: Design & Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-3-5',
    name: 'Refine design based on internal feedback or initial review',
    description: 'Make initial revisions and improvements',
    phase: 'Phase 3: Design & Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4: Review & Approval
  {
    id: 'gd-4-1',
    name: 'Submit drafts for internal team or client feedback',
    description: 'Share designs for review and feedback',
    phase: 'Phase 4: Review & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-4-2',
    name: 'Make requested edits and revisions promptly',
    description: 'Implement feedback and make necessary changes',
    phase: 'Phase 4: Review & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-4-3',
    name: 'Confirm all brand guidelines and quality standards are met',
    description: 'Verify compliance with brand standards',
    phase: 'Phase 4: Review & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-4-4',
    name: 'Receive final approval from client or internal lead',
    description: 'Get final sign-off on completed designs',
    phase: 'Phase 4: Review & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 5: Exporting & Delivery
  {
    id: 'gd-5-1',
    name: 'Export final files in required formats (PNG, JPG, PDF, SVG, etc.)',
    description: 'Prepare files in all required formats',
    phase: 'Phase 5: Exporting & Delivery',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-5-2',
    name: 'Name and organize files clearly for easy reference',
    description: 'Organize deliverables with clear naming conventions',
    phase: 'Phase 5: Exporting & Delivery',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-5-3',
    name: 'Upload or deliver assets to client, shared drive, or relevant team member',
    description: 'Deliver final assets to appropriate recipients',
    phase: 'Phase 5: Exporting & Delivery',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-5-4',
    name: 'Archive source files and design assets for future use',
    description: 'Store source files and assets for future reference',
    phase: 'Phase 5: Exporting & Delivery',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 6: Quality Assurance & Maintenance
  {
    id: 'gd-6-1',
    name: 'Double-check final assets for resolution, cropping, and quality issues',
    description: 'Verify final deliverables meet quality standards',
    phase: 'Phase 6: Quality Assurance & Maintenance',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-6-2',
    name: 'Verify all links, layers, and transparency are correct in deliverables',
    description: 'Ensure technical specifications are accurate',
    phase: 'Phase 6: Quality Assurance & Maintenance',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-6-3',
    name: 'Update templates, asset libraries, and documentation as needed',
    description: 'Maintain design system and documentation',
    phase: 'Phase 6: Quality Assurance & Maintenance',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'gd-6-4',
    name: 'Record lessons learned or creative insights for future projects',
    description: 'Document insights and learnings for future reference',
    phase: 'Phase 6: Quality Assurance & Maintenance',
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