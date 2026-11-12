const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');

const {
  listWorkspaceMembers,
  updateMemberRole,
  removeWorkspaceMember,
} = require('../controllers/workspaceController');

const router = express.Router();

router.get('/:workspace_id/members', authenticateUser, listWorkspaceMembers);

router.patch(
  '/:workspace_id/members/:user_id',
  authenticateUser,
  updateMemberRole
);

router.delete(
  '/:workspace_id/members/:user_id',
  authenticateUser,
  removeWorkspaceMember
);

module.exports = router;