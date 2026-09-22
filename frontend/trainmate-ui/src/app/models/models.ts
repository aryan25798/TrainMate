export type UserRole = 'COACH' | 'TRAINER' | 'ADMIN';

export interface User {
  userId: number;
  loginId: string;
  name: string;
  role: UserRole;
  coachId?: number;
  trainerId?: number;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  userId?: number;
  loginId?: string;
  name?: string;
  role?: UserRole;
  coachId?: number;
  trainerId?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ScoreBreakdown {
  skillScore: number;
  availabilityScore: number;
  workloadScore: number;
  experienceScore: number;
  previousCohortsScore: number;
  totalScore: number;
  explanation: string;
}

export interface Cohort {
  id: number;
  cohortCode: string;
  serviceLine: string;
  stream: string;
  requiredSkill: string;
  numberOfTrainees: number;
  startDate: string;
  endDate: string;
  vertical: string;
  location: string;
  status: 'PENDING' | 'PROCESSING' | 'ASSIGNED' | 'UNASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  coachId?: number;
  coachName?: string;
  coachEmployeeId?: string;
  assignedTrainerId?: number;
  assignedTrainerName?: string;
  assignedTrainerEmployeeId?: string;
  allocationScore?: number;
  allocationType?: 'AUTOMATIC' | 'ADMIN_OVERRIDE';
  allocationDate?: string;
  scoreBreakdown?: ScoreBreakdown;
  createdAt?: string;
  updatedAt?: string;
}

export interface Trainer {
  id: number;
  userId: number;
  name: string;
  email?: string;
  employeeId: string;
  serviceLine: string;
  vertical: string;
  experienceYears: number;
  availableFrom: string;
  availableTill: string;
  currentWorkload: number;
  maximumWorkload: number;
  workloadRatio: string;
  previouslyHandledCohorts: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'INACTIVE';
  skills: string[];
}

export interface CreateTrainerRequest {
  name: string;
  email: string;
  skillSet: string;
  experienceYears: number;
  availableFrom: string;
  availableTill: string;
  maxWorkload: number;
}

export interface CoachDashboard {
  totalCohorts: number;
  assigned: number;
  unassigned: number;
  upcoming: number;
}

export interface TrainerDashboard {
  active: number;
  upcoming: number;
  completed: number;
  unread: number;
}

export interface AdminDashboard {
  totalCohorts: number;
  assignedCohorts: number;
  unassignedCohorts: number;
  pendingCohorts: number;
  activeCohorts: number;
  completedCohorts: number;
  totalTrainers: number;
  availableTrainers: number;
  unavailableTrainers: number;
}

export interface ExcelValidationError {
  row: number;
  message: string;
}

export interface CohortUploadResponse {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ExcelValidationError[];
  allocatedCohorts?: Cohort[];
}

export interface NotificationItem {
  id: number;
  receiverUserId: number;
  receiverRole: string;
  title?: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
  createdDate?: string;
}

export interface TrainerOverrideRequest {
  trainerId: number;
  reason?: string;
}

export interface CreateCohortRequest {
  cohortCode: string;
  serviceLine: string;
  stream: string;
  requiredSkill: string;
  numberOfTrainees: number;
  startDate: string;
  endDate: string;
  vertical: string;
  location: string;
}
