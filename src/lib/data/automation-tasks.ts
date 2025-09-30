export interface Task {
  id: string;
  name: string;
  phase: string;
  assignedTo: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  clientId?: string;
  description?: string;
}

export const automationTasks: Task[] = [
  // Phase 1: Initial Subaccount Creation
  {
    id: 'auto-1-1',
    name: 'Create Client Subaccount',
    description: 'Set up new subaccount under main agency',
    phase: 'Phase 1: Initial Subaccount Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-1-2',
    name: 'White-Label Setup',
    description: 'Configure branding including logo, colors, company info',
    phase: 'Phase 1: Initial Subaccount Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-1-3',
    name: 'User Access',
    description: 'Add client users with appropriate permissions',
    phase: 'Phase 1: Initial Subaccount Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-1-4',
    name: 'Domain Connection',
    description: 'Connect client\'s domain or create subdomain',
    phase: 'Phase 1: Initial Subaccount Creation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 2: Calendar & Booking Setup
  {
    id: 'auto-2-1',
    name: 'Calendar Setup',
    description: 'Create main calendar for client bookings',
    phase: 'Phase 2: Calendar & Booking Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-2-2',
    name: 'Calendar Setup',
    description: 'Create different booking types (consultation, follow-up, etc.)',
    phase: 'Phase 2: Calendar & Booking Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-2-3',
    name: 'Availability Settings',
    description: 'Configure business hours and booking availability',
    phase: 'Phase 2: Calendar & Booking Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-2-4',
    name: 'Booking Forms',
    description: 'Create intake forms for each booking type',
    phase: 'Phase 2: Calendar & Booking Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 3: Payment Integration Setup
  {
    id: 'auto-3-1',
    name: 'Payment Gateway Connection',
    description: 'Connect payment processor (Stripe, PayPal, etc.)',
    phase: 'Phase 3: Payment Integration Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-3-2',
    name: 'Configure Payment Settings',
    description: 'Configure payment settings and security',
    phase: 'Phase 3: Payment Integration Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-3-3',
    name: 'Product/Service Creation',
    description: 'Set up products/services with pricing in the system',
    phase: 'Phase 3: Payment Integration Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-3-4',
    name: 'Payment Form Integration',
    description: 'Add payment fields to booking forms',
    phase: 'Phase 3: Payment Integration Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-3-5',
    name: 'Invoice Templates',
    description: 'Create branded invoice templates',
    phase: 'Phase 3: Payment Integration Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-3-6',
    name: 'Subscription Setup',
    description: 'Configure recurring payment options if needed',
    phase: 'Phase 3: Payment Integration Setup',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 4: Client Capture Automation
  {
    id: 'auto-4-1',
    name: 'Lead Form Creation',
    description: 'Build lead capture forms for client website',
    phase: 'Phase 4: Client Capture Automation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-4-2',
    name: 'Pipeline Setup',
    description: 'Create client pipeline with appropriate stages',
    phase: 'Phase 4: Client Capture Automation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-4-3',
    name: 'Welcome Sequence',
    description: 'Create automatic email sequence for new leads',
    phase: 'Phase 4: Client Capture Automation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-4-4',
    name: 'SMS Notifications',
    description: 'Set up SMS alerts for new leads and appointments',
    phase: 'Phase 4: Client Capture Automation',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 5: Automation Workflows
  {
    id: 'auto-5-1',
    name: 'Lead Capture Workflow',
    description: 'Create workflow for new leads from form submission',
    phase: 'Phase 5: Automation Workflows',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-5-2',
    name: 'Appointment Workflow',
    description: 'Create workflow for appointment booking management',
    phase: 'Phase 5: Automation Workflows',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-5-3',
    name: 'Follow-up Workflow',
    description: 'Create workflow for automatic follow-ups',
    phase: 'Phase 5: Automation Workflows',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-5-4',
    name: 'Client Onboarding Workflow',
    description: 'Create workflow for new client onboarding process',
    phase: 'Phase 5: Automation Workflows',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Phase 6: Testing & Training
  {
    id: 'auto-6-1',
    name: 'System Testing',
    description: 'Test all workflows, forms, and automations',
    phase: 'Phase 6: Testing & Training',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-6-2',
    name: 'Client Training',
    description: 'Train client on using their GHL subaccount',
    phase: 'Phase 6: Testing & Training',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-6-3',
    name: 'Documentation',
    description: 'Create documentation for client reference',
    phase: 'Phase 6: Testing & Training',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'auto-6-4',
    name: 'Go Live',
    description: 'Activate account and begin capturing real leads',
    phase: 'Phase 6: Testing & Training',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  }
];

// Workflow tasks for detailed automation setup
export const workflowTasks: Task[] = [
  // New Lead Capture Workflow
  {
    id: 'workflow-1-1',
    name: 'Form Submission - Add contact to "New Leads" pipeline',
    description: 'Trigger: Form Submission, Action: Add contact to "New Leads" pipeline, Wait Time: Immediate',
    phase: 'New Lead Capture Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-1-2',
    name: 'Form Submission - Send welcome email with company info',
    description: 'Trigger: Form Submission, Action: Send welcome email with company info, Wait Time: Immediate',
    phase: 'New Lead Capture Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-1-3',
    name: 'Form Submission - Send SMS confirmation of inquiry',
    description: 'Trigger: Form Submission, Action: Send SMS confirmation of inquiry, Wait Time: 5 min',
    phase: 'New Lead Capture Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-1-4',
    name: 'Form Submission - Create task for follow-up call',
    description: 'Trigger: Form Submission, Action: Create task for follow-up call, Wait Time: Immediate',
    phase: 'New Lead Capture Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-1-5',
    name: 'Form Submission - Send follow-up email if no response',
    description: 'Trigger: Form Submission, Action: Send follow-up email if no response, Wait Time: 2 days',
    phase: 'New Lead Capture Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Appointment Booking Workflow
  {
    id: 'workflow-2-1',
    name: 'Calendar Booking - Send appointment confirmation email',
    description: 'Trigger: Calendar Booking, Action: Send appointment confirmation email, Wait Time: Immediate',
    phase: 'Appointment Booking Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-2-2',
    name: 'Calendar Booking - Send SMS confirmation with details',
    description: 'Trigger: Calendar Booking, Action: Send SMS confirmation with details, Wait Time: Immediate',
    phase: 'Appointment Booking Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-2-3',
    name: 'Calendar Booking - Create task for staff preparation',
    description: 'Trigger: Calendar Booking, Action: Create task for staff preparation, Wait Time: Immediate',
    phase: 'Appointment Booking Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-2-4',
    name: 'Calendar Booking - Send reminder email',
    description: 'Trigger: Calendar Booking, Action: Send reminder email, Wait Time: 24 hours before',
    phase: 'Appointment Booking Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-2-5',
    name: 'Calendar Booking - Send SMS reminder',
    description: 'Trigger: Calendar Booking, Action: Send SMS reminder, Wait Time: 1 hour before',
    phase: 'Appointment Booking Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },

  // Post-Appointment Workflow
  {
    id: 'workflow-3-1',
    name: 'Appointment End - Send thank you email with next steps',
    description: 'Trigger: Appointment End, Action: Send thank you email with next steps, Wait Time: 1 hour after',
    phase: 'Post-Appointment Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-3-2',
    name: 'Appointment End - Move contact to appropriate pipeline stage',
    description: 'Trigger: Appointment End, Action: Move contact to appropriate pipeline stage, Wait Time: Immediate',
    phase: 'Post-Appointment Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-3-3',
    name: 'Appointment End - Create follow-up task for account manager',
    description: 'Trigger: Appointment End, Action: Create follow-up task for account manager, Wait Time: Immediate',
    phase: 'Post-Appointment Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-3-4',
    name: 'Appointment End - Send SMS asking for feedback',
    description: 'Trigger: Appointment End, Action: Send SMS asking for feedback, Wait Time: 4 hours after',
    phase: 'Post-Appointment Workflow',
    assignedTo: 'Unassigned',
    status: 'Not Started'
  },
  {
    id: 'workflow-3-5',
    name: 'Appointment End - Send proposal if marked as qualified',
    description: 'Trigger: Appointment End, Action: Send proposal if marked as qualified, Wait Time: Conditional',
    phase: 'Post-Appointment Workflow',
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