import express from 'express';
import { validate } from '../middleware/validate.js';
import { createProviderSchema, updateProviderSchema } from '../schemas.js';

const router = express.Router();

// Example: POST /api/providers
// Creates a new provider with validated input
router.post('/', validate('body', createProviderSchema), (req, res) => {
  // At this point, req.body is validated and safe
  // req.body contains only: firstName, lastName, providerType,
  // hasExtendedVisitCredential, canSeePediatric, isActive
  // Any extra fields sent by the client are stripped out

  const { firstName, lastName, providerType } = req.body;

  // Next step: save to database with Prisma
  // const provider = await prisma.provider.create({ data: req.body });

  res.json({
    success: true,
    message: `Provider ${firstName} ${lastName} created`,
    data: req.body,
  });
});

// Example: GET /api/providers/:id
// Just shows the pattern; no validation needed for a simple ID lookup
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Fetching provider ${req.params.id}`,
  });
});

// Example: PATCH /api/providers/:id
// Updates a provider with validated partial data
router.patch('/:id', validate('body', updateProviderSchema), (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Next step: update in database with Prisma
  // const provider = await prisma.provider.update({
  //   where: { id },
  //   data: updates,
  // });

  res.json({
    success: true,
    message: `Provider ${id} updated`,
    data: updates,
  });
});

export default router;
