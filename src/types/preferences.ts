export interface Platform {
  id: string;
  name: string;
  url: string;
  isCustom?: boolean;
}

export interface UserPreferences {
  preferred_sites: string[];
  preferred_sites_updated_at: string;
  custom_sites?: CustomSite[];
}

export interface CustomSite {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

export interface SavePreferencesRequest {
  preferred_sites: string[];
}

export interface SavePreferencesResponse {
  data: UserPreferences;
  error: null | string;
}

export interface AddCustomSiteRequest {
  name: string;
  url: string;
}

export interface AddCustomSiteResponse {
  data: CustomSite;
  error: null | string;
}
