export interface Task {
  id: string;
  name: string;
  phase: string;
  assignedTo: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  clientId?: string;
}

export const socialMediaTasks: Task[] = [
  // Phase 1: Strategy & Research
  {
    id: 'sm-1-1',
    name: 'Create or update the client\'s Social Media Strategy file (brand overview, voice, goals, target audience)',
    phase: 'Phase 1: Strategy & Research',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-1-2',
    name: 'Research client\'s industry, audience behavior, and content preferences',
    phase: 'Phase 1: Strategy & Research',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-1-3',
    name: 'Identify direct competitors and leading industry accounts for best practices and inspiration',
    phase: 'Phase 1: Strategy & Research',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-1-4',
    name: 'Review B2B or B2C differences to tailor the approach',
    phase: 'Phase 1: Strategy & Research',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-1-5',
    name: 'Select relevant social media platforms for client goals',
    phase: 'Phase 1: Strategy & Research',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-1-6',
    name: 'Present strategy to client for review, collect feedback, and revise as needed',
    phase: 'Phase 1: Strategy & Research',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 2: Content Planning & Calendar
  {
    id: 'sm-2-1',
    name: 'Build monthly content calendar (topics, themes, promos, campaigns)',
    phase: 'Phase 2: Content Planning & Calendar',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-2-2',
    name: 'Define content pillars (educational, promotional, community, trends, etc.)',
    phase: 'Phase 2: Content Planning & Calendar',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-2-3',
    name: 'Plan content formats (images, videos, carousels, stories, polls, etc.)',
    phase: 'Phase 2: Content Planning & Calendar',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-2-4',
    name: 'Note key dates, holidays, and any client-specific promotions',
    phase: 'Phase 2: Content Planning & Calendar',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-2-5',
    name: 'Assign responsibilities for copywriting, design, and approvals',
    phase: 'Phase 2: Content Planning & Calendar',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 3: Content Creation & Approval
  {
    id: 'sm-3-1',
    name: 'Draft social media copy for each post (captions, hashtags, tags)',
    phase: 'Phase 3: Content Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-3-2',
    name: 'Design visuals (graphics, images, videos) aligned to brand style',
    phase: 'Phase 3: Content Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-3-3',
    name: 'Personalize posts as needed for platform or audience',
    phase: 'Phase 3: Content Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-3-4',
    name: 'Review all content internally for quality and brand fit',
    phase: 'Phase 3: Content Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-3-5',
    name: 'Send content to client for review/approval (if required)',
    phase: 'Phase 3: Content Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-3-6',
    name: 'Make revisions as requested by client or internal team',
    phase: 'Phase 3: Content Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4: Scheduling & Publishing
  {
    id: 'sm-4-1',
    name: 'Schedule approved posts in content scheduling tools (e.g. GoHighLevel, Buffer, native platforms)',
    phase: 'Phase 4: Scheduling & Publishing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-4-2',
    name: 'Set optimal posting times based on audience activity and platform insights',
    phase: 'Phase 4: Scheduling & Publishing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-4-3',
    name: 'Manually publish last-minute or time-sensitive content if needed',
    phase: 'Phase 4: Scheduling & Publishing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-4-4',
    name: 'Double-check platform previews and links before publishing',
    phase: 'Phase 4: Scheduling & Publishing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-4-5',
    name: 'Monitor scheduled posts for any errors or issues',
    phase: 'Phase 4: Scheduling & Publishing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 5: Engagement & Community Management
  {
    id: 'sm-5-1',
    name: 'Monitor comments, direct messages, and mentions daily',
    phase: 'Phase 5: Engagement & Community Management',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-5-2',
    name: 'Respond to inquiries, questions, and feedback',
    phase: 'Phase 5: Engagement & Community Management',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-5-3',
    name: 'Like, share, or repost relevant content from community and industry accounts',
    phase: 'Phase 5: Engagement & Community Management',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-5-4',
    name: 'Follow and engage with new followers, groups, and influencers',
    phase: 'Phase 5: Engagement & Community Management',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-5-5',
    name: 'Alternate engagement routines across platforms (e.g. group activities, influencer outreach, Q&A days)',
    phase: 'Phase 5: Engagement & Community Management',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-5-6',
    name: 'Escalate urgent or negative comments to client promptly',
    phase: 'Phase 5: Engagement & Community Management',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 6: Analytics & Reporting
  {
    id: 'sm-6-1',
    name: 'Collect performance data (reach, impressions, engagement, clicks, follower growth, conversions)',
    phase: 'Phase 6: Analytics & Reporting',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-6-2',
    name: 'Analyze top and underperforming content for insights',
    phase: 'Phase 6: Analytics & Reporting',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-6-3',
    name: 'Prepare monthly (or client-preferred) analytics report',
    phase: 'Phase 6: Analytics & Reporting',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-6-4',
    name: 'Share results and recommendations with client in a call or email',
    phase: 'Phase 6: Analytics & Reporting',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-6-5',
    name: 'Adjust KPIs and goals based on findings and client feedback',
    phase: 'Phase 6: Analytics & Reporting',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 7: Optimization & Repurposing
  {
    id: 'sm-7-1',
    name: 'Identify high-performing posts for repurposing to other platforms or formats',
    phase: 'Phase 7: Optimization & Repurposing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-7-2',
    name: 'Adjust content strategy and calendar based on analytics and engagement trends',
    phase: 'Phase 7: Optimization & Repurposing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-7-3',
    name: 'Test new content types, posting times, or features as platforms update',
    phase: 'Phase 7: Optimization & Repurposing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-7-4',
    name: 'Document lessons learned and update best practices',
    phase: 'Phase 7: Optimization & Repurposing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-7-5',
    name: 'Regularly refresh content ideas and strategy with new trends and platform updates',
    phase: 'Phase 7: Optimization & Repurposing',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 8: Maintenance & Quality Assurance
  {
    id: 'sm-8-1',
    name: 'Audit social profiles regularly for branding, info accuracy, and inactive links',
    phase: 'Phase 8: Maintenance & Quality Assurance',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-8-2',
    name: 'Remove or update outdated content as needed',
    phase: 'Phase 8: Maintenance & Quality Assurance',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-8-3',
    name: 'Check platform notifications and updates for changes that may affect client',
    phase: 'Phase 8: Maintenance & Quality Assurance',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-8-4',
    name: 'Stay current on platform policies and algorithm changes',
    phase: 'Phase 8: Maintenance & Quality Assurance',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'sm-8-5',
    name: 'Maintain an organized content archive and update templates or assets as necessary',
    phase: 'Phase 8: Maintenance & Quality Assurance',
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