export interface BrandingConfig {
  agencyName: string;
  preparedByName: string;
  contactEmail: string;
  logoDataUrl: string | null;
  primaryColor: string;
  accentColor: string;
  footerText: string;
  hideFlyScopeBranding: boolean;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  agencyName: '',
  preparedByName: '',
  contactEmail: '',
  logoDataUrl: null,
  primaryColor: '#8B2020',
  accentColor: '#586851',
  footerText: 'Generated with FlyScope',
  hideFlyScopeBranding: false,
};
