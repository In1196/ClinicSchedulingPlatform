import { z } from 'zod';

// User/Auth schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['practice_manager', 'front_desk', 'provider'], {
    errorMap: () => ({ message: 'Role must be practice_manager, front_desk, or provider' })
  }),
  providerId: z.string().uuid().optional(),
});

// Provider schemas
export const createProviderSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  providerType: z.enum(['md', 'do', 'pa', 'np'], {
    errorMap: () => ({ message: 'Invalid provider type' })
  }),
  hasExtendedVisitCredential: z.boolean().default(false),
  canSeePediatric: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateProviderSchema = createProviderSchema.partial();

// Patient schemas
export const createPatientSchema = z.object({
  displayName: z.string().min(1, 'Patient name is required'),
  isPediatric: z.boolean().default(false),
});

export const updatePatientSchema = createPatientSchema.partial();

// Coverage schemas
export const createCoverageSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID'),
  visitCount: z.number().int('Visit count must be a whole number').positive('Visit count must be positive'),
  visitLimit: z.number().int().positive().nullable().default(null),
  validFrom: z.string().datetime('Must be a valid ISO 8601 datetime'),
  validUntil: z.string().datetime('Must be a valid ISO 8601 datetime'),
}).refine(
  (data) => new Date(data.validFrom) < new Date(data.validUntil),
  { message: 'validFrom must be before validUntil', path: ['validUntil'] }
);

export const updateCoverageSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID').optional(),
  visitCount: z.number().int('Visit count must be a whole number').positive('Visit count must be positive').optional(),
  visitLimit: z.number().int().positive().nullable().optional(),
  validFrom: z.string().datetime('Must be a valid ISO 8601 datetime').optional(),
  validUntil: z.string().datetime('Must be a valid ISO 8601 datetime').optional(),
}).refine(
  (data) => {
    if (data.validFrom && data.validUntil) {
      return new Date(data.validFrom) < new Date(data.validUntil);
    }
    return true;
  },
  { message: 'validFrom must be before validUntil', path: ['validUntil'] }
);

// Appointment schemas
export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID'),
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  coverageId: z.string().uuid('Coverage ID must be a valid UUID'),
  scheduleType: z.enum(['scheduled', 'urgent_care'], {
    errorMap: () => ({ message: 'Schedule type must be scheduled or urgent_care' })
  }),
  visitType: z.enum(['standard', 'extended'], {
    errorMap: () => ({ message: 'Visit type must be standard or extended' })
  }),
  startTime: z.string().datetime('Must be a valid ISO 8601 datetime'),
  endTime: z.string().datetime('Must be a valid ISO 8601 datetime'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be 500 characters or less').optional(),
}).refine(
  (data) => new Date(data.startTime) < new Date(data.endTime),
  { message: 'Start time must be before end time', path: ['endTime'] }
);

export const updateAppointmentSchema = z.object({
  status: z.enum(['scheduled', 'cancelled', 'completed', 'no_show'], {
    errorMap: () => ({ message: 'Invalid appointment status' })
  }),
  reason: z.string().max(500).optional(),
});

// Availability schemas
export const createAvailabilitySchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().time('Must be a valid time (HH:MM)'),
  endTime: z.string().time('Must be a valid time (HH:MM)'),
  specificDate: z.string().date().optional(),
}).refine(
  (data) => {
    if (data.dayOfWeek === undefined && !data.specificDate) {
      return false;
    }
    return true;
  },
  { message: 'Must provide either dayOfWeek or specificDate' }
).refine(
  (data) => data.startTime < data.endTime,
  { message: 'Start time must be before end time', path: ['endTime'] }
);

// Schedule-change request schemas
export const createScheduleChangeRequestSchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  requestType: z.enum(['unavailable', 'swap', 'additional_shift'], {
    errorMap: () => ({ message: 'Invalid request type' })
  }),
  startTime: z.string().datetime('Must be a valid ISO 8601 datetime'),
  endTime: z.string().datetime('Must be a valid ISO 8601 datetime'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be 500 characters or less'),
  requestedSwapWith: z.string().uuid().optional(),
}).refine(
  (data) => new Date(data.startTime) < new Date(data.endTime),
  { message: 'Start time must be before end time', path: ['endTime'] }
);
