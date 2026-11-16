import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAppointmentSchema,
  createAvailabilitySchema,
  createProviderSchema,
  createUserSchema,
  updateAppointmentSchema,
  updateProviderSchema,
} from '../src/schemas.js';

const id = '550e8400-e29b-41d4-a716-446655440000';
const provider = {
  firstName: 'Alex',
  lastName: 'Example',
  displayName: 'Alex Example',
  providerType: 'PHYSICIAN',
  credential: 'MD',
};
const appointment = {
  patientId: id,
  providerId: id,
  coverageId: id,
  setting: 'SCHEDULED',
  type: 'STANDARD',
  startsAt: '2026-11-12T14:00:00.000Z',
  endsAt: '2026-11-12T14:20:00.000Z',
};

test('user validation requires a display name', () => {
  const user = { displayName: 'Example', email: 'example@example.com', password: 'password1', role: 'provider' };
  assert.equal(createUserSchema.safeParse(user).success, true);
  assert.equal(createUserSchema.safeParse({ ...user, displayName: '' }).success, false);
  assert.equal(createUserSchema.safeParse({ ...user, displayName: undefined }).success, false);
});

test('provider validation accepts Prisma provider types and requires credential', () => {
  const result = createProviderSchema.parse(provider);
  assert.equal(result.providerType, 'PHYSICIAN');
  assert.equal(result.pediatricEligible, false);
  assert.equal(createProviderSchema.safeParse({ ...provider, providerType: 'md' }).success, false);
  assert.equal(createProviderSchema.safeParse({ ...provider, credential: '' }).success, false);
  assert.equal(updateProviderSchema.safeParse({ providerType: 'NURSE_PRACTITIONER' }).success, true);
});

test('appointment validation uses Prisma enums and supports an optional reason', () => {
  assert.equal(createAppointmentSchema.safeParse({ ...appointment, reason: 'Scheduling context' }).success, true);
  assert.equal(createAppointmentSchema.safeParse({ ...appointment, reason: null }).success, true);
  assert.equal(createAppointmentSchema.safeParse({ ...appointment, reason: 'x'.repeat(501) }).success, false);
  assert.equal(createAppointmentSchema.safeParse({ ...appointment, setting: 'scheduled' }).success, false);
  assert.equal(createAppointmentSchema.safeParse({ ...appointment, endsAt: appointment.startsAt }).success, false);
  assert.equal(updateAppointmentSchema.safeParse({ status: 'BOOKED', reason: null }).success, true);
  assert.equal(updateAppointmentSchema.safeParse({ status: 'scheduled' }).success, false);
});

test('availability validates Prisma window kinds and minute boundaries', () => {
  const weekly = {
    providerId: id,
    kind: 'WEEKLY',
    dayOfWeek: 1,
    startMinuteOfDay: 0,
    endMinuteOfDay: 1440,
  };
  assert.equal(createAvailabilitySchema.parse(weekly).isAvailable, true);
  assert.equal(createAvailabilitySchema.safeParse({
    providerId: id,
    kind: 'DATE_SPECIFIC',
    localDate: '2026-11-12',
    startMinuteOfDay: 540,
    endMinuteOfDay: 600,
    isAvailable: false,
  }).success, true);
  assert.equal(createAvailabilitySchema.safeParse({ ...weekly, localDate: '2026-11-12' }).success, false);
  assert.equal(createAvailabilitySchema.safeParse({ ...weekly, endMinuteOfDay: 1441 }).success, false);
  assert.equal(createAvailabilitySchema.safeParse({ ...weekly, endMinuteOfDay: 0 }).success, false);
});
