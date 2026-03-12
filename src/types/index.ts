export type UserRole = 'seeker' | 'company' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  phone?: string;
}

export interface SeekerProfile extends User {
  role: 'seeker';
  title?: string;
  bio?: string;
  skills: string[];
  location?: string;
  phone?: string;
  resumeUrl?: string;
  targetCountry?: string;
  targetCity?: string;
  experience?: string;
  education?: string;
  savedJobs: string[];
  appliedJobs: string[];
}

export interface CompanyProfile extends User {
  role: 'company';
  companyName: string;
  industry: string;
  size?: string;
  website?: string;
  description?: string;
  logo?: string;
  location: string;
  postedJobs: string[];
  verified: boolean;
  phone?: string;
}

export type JobType = 'full-time' | 'part-time' | 'remote' | 'freelance' | 'internship';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  sector: string;
  location: string;
  type: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  skills: string[];
  postedAt: string;
  deadline?: string;
  isActive: boolean;
  applicants: number;
  featured: boolean;
}

export type ApplicationStatus =
  | 'pending_approval'   // waiting admin to approve entry into system
  | 'approved'           // admin approved - now visible to company
  | 'pending'            // company reviewing
  | 'reviewed'           // company reviewed
  | 'interview'          // interview scheduled
  | 'accepted'           // accepted
  | 'rejected';          // rejected (by admin or company)

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  seekerPhone?: string;
  coverLetter?: string;
  appliedAt: string;
  status: ApplicationStatus;
}

export interface Sector {
  id: string;
  name: string;
  icon: string;
  jobCount: number;
}
