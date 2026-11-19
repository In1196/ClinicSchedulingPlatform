import { expect, test } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();
const provider = {
  displayName: 'Alex Example',
  providerType: 'PHYSICIAN',
  credential: 'MD',
};

test('returns validated data for a valid provider request and strips unknown fields', async () => {
  const response = await request(app)
    .post('/api/providers')
    .send({ ...provider, unexpected: 'ignored' });

  expect(response.status).toBe(200);
  expect(response.body.data).toMatchObject({
    ...provider,
    canDoExtendedVisits: false,
    pediatricEligible: true,
    isActive: true,
  });
  expect(response.body.data).not.toHaveProperty('unexpected');
});

test('returns a validation error for an invalid provider', async () => {
  const response = await request(app)
    .post('/api/providers')
    .send({ ...provider, providerType: 'INVALID' });

  expect(response.status).toBe(400);
  expect(response.body).toMatchObject({
    success: false,
    error: 'Validation failed',
  });
  expect(response.body.details).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'providerType' }),
  ]));
});
