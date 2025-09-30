export interface Task {
  id: string;
  name: string;
  phase: string;
  assignedTo: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  clientId?: string;
}

export const emailMarketingTasks: Task[] = [
  // Phase 1: Email Infrastructure Setup
  {
    id: 'em-1-1',
    name: 'Create or access client domain & hosting accounts',
    phase: 'Phase 1: Email Infrastructure Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-1-2',
    name: 'Set up sending domain or subdomain (e.g. mail.clientdomain.com)',
    phase: 'Phase 1: Email Infrastructure Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-1-3',
    name: 'Configure DNS records (SPF, DKIM, DMARC, MX, CNAME)',
    phase: 'Phase 1: Email Infrastructure Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-1-4',
    name: 'Set up SMTP service, dedicated email servers or self-hosted setup instead of Gmail/Outlook.etc.',
    phase: 'Phase 1: Email Infrastructure Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-1-5',
    name: 'Verify domain in email platform (MailWizz, Instantly, etc.)',
    phase: 'Phase 1: Email Infrastructure Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-1-6',
    name: 'Setup inboxes and test deliverability',
    phase: 'Phase 1: Email Infrastructure Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-1-7',
    name: 'Connect tracking domains & link tracking tools',
    phase: 'Phase 1: Email Infrastructure Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 2: Strategy & Content Planning
  {
    id: 'em-2-1',
    name: 'Research target audience, prospects and leads',
    phase: 'Phase 2: Strategy & Content Planning',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-2-2',
    name: 'Define email sequences (welcome/initial, warm-up, promo, re-engagement, etc.)',
    phase: 'Phase 2: Strategy & Content Planning',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-2-3',
    name: 'Segment email list based on behavior, interest, or demographics',
    phase: 'Phase 2: Strategy & Content Planning',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-2-4',
    name: 'Create email calendar / timeline',
    phase: 'Phase 2: Strategy & Content Planning',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-2-5',
    name: 'Prepare copywriting briefs and visual assets (such as images, banners, or GIFs) as needed, particularly for newsletters.',
    phase: 'Phase 2: Strategy & Content Planning',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 3: Email Creation & Approval
  {
    id: 'em-3-1',
    name: 'Write email copy (subject, preheader, body, CTA, Signature block)',
    phase: 'Phase 3: Email Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-3-2',
    name: 'Design email templates (HTML or drag-and-drop builder)',
    phase: 'Phase 3: Email Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-3-3',
    name: 'Personalize content (first name, company, etc.)',
    phase: 'Phase 3: Email Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-3-4',
    name: 'Ensure design and copy are approved before sending',
    phase: 'Phase 3: Email Creation & Approval',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4: Warm-up & Sending Setup
  {
    id: 'em-4-1',
    name: 'Warm-up domains and email accounts (e.g. via Instantly or MailWizz warmers, etc.)',
    phase: 'Phase 4: Warm-up & Sending Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-4-2',
    name: 'Create sending schedules and throttle volume gradually',
    phase: 'Phase 4: Warm-up & Sending Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-4-3',
    name: 'Connect multiple email accounts for rotation if needed',
    phase: 'Phase 4: Warm-up & Sending Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-4-4',
    name: 'Perform inbox placement tests',
    phase: 'Phase 4: Warm-up & Sending Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 5: Sending Campaigns
  {
    id: 'em-5-1',
    name: 'Schedule campaign based on timezone & best open rates',
    phase: 'Phase 5: Sending Campaigns',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-5-2',
    name: 'Use A/B testing for subject lines and CTAs',
    phase: 'Phase 5: Sending Campaigns',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-5-3',
    name: 'Monitor live campaign (bounces, clicks, opens, replies)',
    phase: 'Phase 5: Sending Campaigns',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-5-4',
    name: 'Respond to replies manually or via Unibox/shared inbox',
    phase: 'Phase 5: Sending Campaigns',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 6: Follow-Up Sequences
  {
    id: 'em-6-1',
    name: 'Set auto follow-ups (e.g., 1 day, 3 days, 7 days)',
    phase: 'Phase 6: Follow-Up Sequences',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-6-2',
    name: 'Track responses and engagement',
    phase: 'Phase 6: Follow-Up Sequences',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-6-3',
    name: 'Pause sequences for leads that reply or convert',
    phase: 'Phase 6: Follow-Up Sequences',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 7: Reporting & Optimization
  {
    id: 'em-7-1',
    name: 'Generate weekly/monthly performance reports',
    phase: 'Phase 7: Reporting & Optimization',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-7-2',
    name: 'Measure open rate, click rate, reply rate, bounce rate',
    phase: 'Phase 7: Reporting & Optimization',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-7-3',
    name: 'Analyze subject line & content performance',
    phase: 'Phase 7: Reporting & Optimization',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-7-4',
    name: 'Optimize copy, design, sending time, and list segmentation',
    phase: 'Phase 7: Reporting & Optimization',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-7-5',
    name: 'Share insights with the team',
    phase: 'Phase 7: Reporting & Optimization',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 8: Maintenance & List Hygiene
  {
    id: 'em-8-1',
    name: 'Regularly clean inactive/bounced emails',
    phase: 'Phase 8: Maintenance & List Hygiene',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-8-2',
    name: 'Rewarm domains if deliverability drops',
    phase: 'Phase 8: Maintenance & List Hygiene',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-8-3',
    name: 'Monitor reputation (via Google Postmaster, Talos, etc.)',
    phase: 'Phase 8: Maintenance & List Hygiene',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'em-8-4',
    name: 'Update templates and messaging based on trends',
    phase: 'Phase 8: Maintenance & List Hygiene',
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