export type UserRole = "broker" | "admin";
export type UserStatus = "pending" | "approved" | "suspended" | "deactivated";
export type ListingStatus = "pending" | "approved" | "rejected" | "expired";
export type DealType = "off_plan" | "secondary" | "distressed" | "urgent_sale";
export type PropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "penthouse"
  | "office"
  | "retail"
  | "warehouse"
  | "land";
export type RequirementUrgency = "hot" | "active" | "planning";
export type LeadType = "listing_enquiry" | "requirement_match";
export type LeadStatus = "new" | "contacted" | "won" | "closed";

export interface Agency {
  id: string;
  name: string;
  rera_brn: string | null;
  status: UserStatus;
}

export interface Area {
  id: string;
  name: string;
  city: string;
  slug: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  agency_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrokerProfile {
  user_id: string;
  agency_id: string | null;
  rera_brn: string | null;
  covered_area_ids: string[] | null;
  speciality: string | null;
  experience_years: number | null;
  whatsapp_number: string | null;
  bio: string | null;
  application_status: UserStatus;
  application_submitted_at: string | null;
  approved_at: string | null;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  is_cover: boolean;
}

export interface ListingDocument {
  id: string;
  listing_id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
}

export interface CommissionTerms {
  listing_id: string;
  co_broke_percent: number;
  payment_terms: string | null;
  notes: string | null;
}

export interface Listing {
  id: string;
  title: string;
  property_type: PropertyType;
  deal_type: DealType;
  bedrooms: number | null;
  size_sqft: number | null;
  area_id: string | null;
  developer: string | null;
  price: number;
  payment_plan: string | null;
  handover_date: string | null;
  yield_percent: number | null;
  notes: string | null;
  description: string | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  agency_id: string | null;
  renewal_due_at: string | null;
  approved_at: string | null;
  area?: Area | null;
  commission_terms?: CommissionTerms | null;
  listing_images?: ListingImage[];
  listing_documents?: ListingDocument[];
  owner?: PlatformUser | null;
  agency?: Agency | null;
  owner_active_listings_count?: number | null;
}

export interface Requirement {
  id: string;
  title: string;
  deal_type: DealType;
  property_type: PropertyType;
  bedrooms: number | null;
  area_id: string | null;
  budget_min: number | null;
  budget_max: number | null;
  urgency: RequirementUrgency;
  notes: string | null;
  created_at: string;
  posted_by: string;
  area?: Area | null;
  owner?: PlatformUser | null;
}

export interface Lead {
  id: string;
  listing_id: string | null;
  requirement_id: string | null;
  from_user_id: string;
  to_user_id: string;
  lead_type: LeadType;
  lead_status: LeadStatus;
  message: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  preferred_channel: "email" | "whatsapp" | "both";
  email_triggered_at: string | null;
  whatsapp_triggered_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  actor?: Pick<PlatformUser, "first_name" | "last_name" | "email"> | null;
}

export interface DashboardMetrics {
  myListings: number;
  myEnquiries: number;
  matchedRequirements: number;
  pendingListings: number;
}

export interface RequirementFormValues {
  title: string;
  dealType: DealType;
  propertyType: PropertyType;
  bedrooms: string;
  areaId: string;
  budgetMin: string;
  budgetMax: string;
  urgency: RequirementUrgency;
  notes: string;
}

export interface PublicOverview {
  approvedBrokerCount: number;
  approvedListingCount: number;
  activeRequirementCount: number;
  recentListings: Listing[];
}

export interface ApplicationPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  agencyName: string;
  reraBrn: string;
  coveredAreaIds: string[];
  speciality: string;
  experienceYears: number;
}

export interface ListingFormValues {
  title: string;
  propertyType: PropertyType;
  dealType: DealType;
  bedrooms: string;
  sizeSqft: string;
  areaId: string;
  developer: string;
  price: string;
  paymentPlan: string;
  handoverDate: string;
  yieldPercent: string;
  coBrokePercent: string;
  notes: string;
  description: string;
  paymentTerms: string;
}

