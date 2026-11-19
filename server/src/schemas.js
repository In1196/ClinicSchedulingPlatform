import { z } from 'zod';

// User/Auth schemas
export const createUserSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  role: z.enum(['MANAGER', 'FRONT_DESK', 'PROVIDER'], {
    errorMap: () => ({ message: 'Role must be MANAGER, FRONT_DESK, or PROVIDER' })
  }),
  providerId: z.string().uuid().optional(),
});

// Provider schemas
export const createProviderSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  providerType: z.enum(['PHYSICIAN', 'NURSE_PRACTITIONER', 'PHYSICIAN_ASSISTANT'], {
    errorMap: () => ({ message: 'Invalid provider type' })
  }),
  credential: z.string().min(1, 'Credential is required'),
  canDoExtendedVisits: z.boolean().default(false),
  pediatricEligible: z.boolean().default(true),
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
  coveredVisits: z.number().int('Visit count must be a whole number').positive('Visit count must be positive'),
  startsOn: z.string().date('Must be a valid YYYY-MM-DD date'),
  endsOn: z.string().date('Must be a valid YYYY-MM-DD date'),
}).refine(
  (data) => new Date(data.startsOn) < new Date(data.endsOn),
  { message: 'startsOn must be before endsOn', path: ['endsOn'] }
);

export const updateCoverageSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID').optional(),
  coveredVisits: z.number().int('Visit count must be a whole number').positive('Visit count must be positive').optional(),
  startsOn: z.string().date('Must be a valid YYYY-MM-DD date').optional(),
  endsOn: z.string().date('Must be a valid YYYY-MM-DD date').optional(),
}).refine(
  (data) => {
    if (data.startsOn && data.endsOn) {
      return new Date(data.startsOn) < new Date(data.endsOn);
    }
    return true;
  },
  { message: 'startsOn must be before endsOn', path: ['endsOn'] }
);

// Appointment schemas
export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID'),
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  coverageId: z.string().uuid('Coverage ID must be a valid UUID'),
  setting: z.enum(['SCHEDULED', 'URGENT_CARE'], {
    errorMap: () => ({ message: 'Schedule type must be SCHEDULED or URGENT_CARE' })
  }),
  type: z.enum(['STANDARD', 'EXTENDED'], {
    errorMap: () => ({ message: 'Visit type must be STANDARD or EXTENDED' })
  }),
  startsAt: z.string().datetime('Must be a valid ISO 8601 datetime'),
  endsAt: z.string().datetime('Must be a valid ISO 8601 datetime'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be 500 characters or less').nullable().optional(),
}).refine(
  (data) => new Date(data.startsAt) < new Date(data.endsAt),
  { message: 'Start time must be before end time', path: ['endsAt'] }
);

export const updateAppointmentSchema = z.object({
  status: z.enum(['BOOKED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'], {
    errorMap: () => ({ message: 'Invalid appointment status' })
  }),
  reason: z.string().max(500).nullable().optional(),
});

// Availability schemas
export const createAvailabilitySchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  kind: z.enum(['WEEKLY', 'DATE_SPECIFIC']),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  localDate: z.string().date().nullable().optional(),
  startMinuteOfDay: z.number().int().min(0).max(1439),
  endMinuteOfDay: z.number().int().min(1).max(1440),
  isAvailable: z.boolean().default(true),
}).refine(
  (data) => data.kind === 'WEEKLY'
    ? data.dayOfWeek != null && data.localDate == null
    : data.localDate != null && data.dayOfWeek == null,
  { message: 'WEEKLY requires dayOfWeek; DATE_SPECIFIC requires localDate' }
).refine(
  (data) => data.startMinuteOfDay < data.endMinuteOfDay,
  { message: 'Start time must be before end time', path: ['endMinuteOfDay'] }
);

// Schedule-change request schemas
// export const createScheduleChangeRequestSchema = z.object({
//   providerId: z.string().uuid('Provider ID must be a valid UUID'),
//   requestType: z.enum(['unavailable', 'swap', 'additional_shift'], {
//     errorMap: () => ({ message: 'Invalid request type' })
//   }),
//   startTime: z.string().datetime('Must be a valid ISO 8601 datetime'),
//   endTime: z.string().datetime('Must be a valid ISO 8601 datetime'),
//   reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be 500 characters or less'),
//   requestedSwapWith: z.string().uuid().optional(),
// }).refine(
//   (data) => new Date(data.startTime) < new Date(data.endTime),
//   { message: 'Start time must be before end time', path: ['endTime'] }
// );
