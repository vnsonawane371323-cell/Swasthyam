const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createGroup,
  getMyGroups,
  getPendingInvitations,
  getAdminGroups,
  getGroup,
  inviteMembers,
  acceptInvitation,
  rejectInvitation,
  leaveGroup,
  removeMember,
  updateGroup,
  deleteGroup,
  promoteMember,
  searchUsers
} = require('../controllers/groupController');

// Apply authentication to all routes
router.use(protect);

// Group CRUD
router.post('/', createGroup);
router.get('/', getMyGroups);
router.get('/invitations', getPendingInvitations);
router.get('/admin', getAdminGroups);
router.get('/search-users', searchUsers);
router.get('/:id', getGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Member management
router.post('/:id/invite', inviteMembers);
router.post('/:id/accept', acceptInvitation);
router.post('/:id/reject', rejectInvitation);
router.post('/:id/leave', leaveGroup);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/promote/:userId', promoteMember);

module.exports = router;
