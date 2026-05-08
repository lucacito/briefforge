import { IntegrationData } from '@/types/project';

export const INTEGRATIONS: IntegrationData[] = [
  { id: 'stripe', label: 'Stripe', complexityPoints: 8, category: 'Payment' },
  { id: 'paypal', label: 'PayPal', complexityPoints: 7, category: 'Payment' },
  { id: 'mailchimp', label: 'Mailchimp', complexityPoints: 4, category: 'Marketing' },
  { id: 'hubspot', label: 'HubSpot', complexityPoints: 8, category: 'CRM' },
  { id: 'salesforce', label: 'Salesforce', complexityPoints: 12, category: 'CRM' },
  { id: 'zapier', label: 'Zapier', complexityPoints: 5, category: 'Automation' },
  { id: 'google-analytics', label: 'Google Analytics', complexityPoints: 2, category: 'Analytics' },
  { id: 'meta-pixel', label: 'Meta Pixel', complexityPoints: 2, category: 'Analytics' },
  { id: 'calendly', label: 'Calendly', complexityPoints: 4, category: 'Scheduling' },
  { id: 'slack', label: 'Slack', complexityPoints: 5, category: 'Communication' },
  { id: 'airtable', label: 'Airtable', complexityPoints: 6, category: 'Productivity' },
  { id: 'notion', label: 'Notion', complexityPoints: 5, category: 'Productivity' },
  { id: 'custom-api', label: 'Custom API', complexityPoints: 15, category: 'Custom' },
];

export const INTEGRATION_CATEGORIES = ['Payment', 'Marketing', 'CRM', 'Automation', 'Analytics', 'Scheduling', 'Communication', 'Productivity', 'Custom'];
