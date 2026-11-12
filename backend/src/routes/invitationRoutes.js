const express = require('express');
const rateLimit = require('express-rate-limit');

const { authenticateUser } = require('../middleware/authMiddleware');

const {
  createInvitation,
  listInvitations,
  revokeInvitation,
  acceptInvitation,
} = require('../controllers/invitationController');

const router = express.Router();

const invitationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many invitation requests. Please try again later.',
  },
});

router.post(
  '/',
  authenticateUser,
  invitationLimiter,
  createInvitation
);

router.get(
  '/:workspace_id',
  authenticateUser,
  listInvitations
);

router.delete(
  '/:invitation_id',
  authenticateUser,
  revokeInvitation
);

router.post(
  '/accept',
  authenticateUser,
  invitationLimiter,
  acceptInvitation
);

module.exports = router;