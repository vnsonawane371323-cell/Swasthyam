const Group = require('../models/Group');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Create a new group
 * @route   POST /api/groups
 * @access  Private
 */
exports.createGroup = asyncHandler(async (req, res) => {
  const { name, description, type, settings } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Group name is required'
    });
  }

  // Create group with current user as admin and active member
  const group = await Group.create({
    name,
    description,
    type: type || 'family',
    admin: req.user._id,
    members: [{
      userId: req.user._id,
      role: 'admin',
      status: 'active',
      joinedAt: new Date()
    }],
    settings: settings || {}
  });

  const populatedGroup = await Group.findById(group._id)
    .populate('admin', 'name email avatar')
    .populate('members.userId', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: populatedGroup
  });
});

/**
 * @desc    Get user's groups
 * @route   GET /api/groups
 * @access  Private
 */
exports.getMyGroups = asyncHandler(async (req, res) => {
  const groups = await Group.getUserGroups(req.user._id);

  res.status(200).json({
    success: true,
    data: groups
  });
});

/**
 * @desc    Get user's pending invitations
 * @route   GET /api/groups/invitations
 * @access  Private
 */
exports.getPendingInvitations = asyncHandler(async (req, res) => {
  const invitations = await Group.getUserPendingInvitations(req.user._id);

  res.status(200).json({
    success: true,
    data: invitations
  });
});

/**
 * @desc    Get groups where user is admin
 * @route   GET /api/groups/admin
 * @access  Private
 */
exports.getAdminGroups = asyncHandler(async (req, res) => {
  const groups = await Group.getUserAdminGroups(req.user._id);

  res.status(200).json({
    success: true,
    data: groups
  });
});

/**
 * @desc    Get single group details
 * @route   GET /api/groups/:id
 * @access  Private
 */
exports.getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('admin', 'name email avatar')
    .populate('members.userId', 'name email avatar');

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is member or admin
  const isAdmin = group.isAdmin(req.user._id);
  const isMember = group.isMember(req.user._id);
  const hasPendingInvite = group.hasPendingInvitation(req.user._id);
  
  console.log('Authorization check:', {
    userId: req.user._id.toString(),
    groupAdmin: group.admin.toString(),
    isAdmin,
    isMember,
    hasPendingInvite,
    membersCount: group.members.length,
    members: group.members.map(m => ({
      userId: m.userId._id ? m.userId._id.toString() : m.userId.toString(),
      status: m.status,
      role: m.role
    }))
  });
  
  if (!isAdmin && !isMember && !hasPendingInvite) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this group'
    });
  }

  res.status(200).json({
    success: true,
    data: group
  });
});

/**
 * @desc    Invite members to group
 * @route   POST /api/groups/:id/invite
 * @access  Private
 */
exports.inviteMembers = asyncHandler(async (req, res) => {
  const { userIds } = req.body; // Array of user IDs to invite

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide user IDs to invite'
    });
  }

  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user can invite (admin or member with permission)
  const isAdmin = group.isAdmin(req.user._id);
  const isMember = group.isMember(req.user._id);
  const canInvite = isAdmin || (isMember && group.settings.allowMemberInvites);

  if (!canInvite) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to invite members'
    });
  }

  // Verify all users exist
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    return res.status(400).json({
      success: false,
      message: 'Some user IDs are invalid'
    });
  }

  const invited = [];
  const alreadyMembers = [];
  const errors = [];

  for (const userId of userIds) {
    try {
      // Check if already member or has pending invitation
      if (group.isMember(userId) || group.hasPendingInvitation(userId)) {
        alreadyMembers.push(userId);
        continue;
      }

      await group.addMember(userId, 'member', 'pending');
      invited.push(userId);
    } catch (error) {
      errors.push({ userId, error: error.message });
    }
  }

  const updatedGroup = await Group.findById(group._id)
    .populate('admin', 'name email avatar')
    .populate('members.userId', 'name email avatar');

  res.status(200).json({
    success: true,
    message: `Invited ${invited.length} user(s)`,
    data: {
      group: updatedGroup,
      invited,
      alreadyMembers,
      errors
    }
  });
});

/**
 * @desc    Accept group invitation
 * @route   POST /api/groups/:id/accept
 * @access  Private
 */
exports.acceptInvitation = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.hasPendingInvitation(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'No pending invitation found'
    });
  }

  await group.acceptMember(req.user._id);

  const updatedGroup = await Group.findById(group._id)
    .populate('admin', 'name email avatar')
    .populate('members.userId', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Invitation accepted successfully',
    data: updatedGroup
  });
});

/**
 * @desc    Reject group invitation
 * @route   POST /api/groups/:id/reject
 * @access  Private
 */
exports.rejectInvitation = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.hasPendingInvitation(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'No pending invitation found'
    });
  }

  await group.removeMember(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Invitation rejected'
  });
});

/**
 * @desc    Leave group
 * @route   POST /api/groups/:id/leave
 * @access  Private
 */
exports.leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.isMember(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You are not a member of this group'
    });
  }

  // Admin cannot leave, must transfer ownership or delete group
  if (group.isAdmin(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Admin cannot leave group. Please transfer ownership or delete the group.'
    });
  }

  await group.removeMember(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Left group successfully'
  });
});

/**
 * @desc    Remove member from group
 * @route   DELETE /api/groups/:id/members/:userId
 * @access  Private (Admin only)
 */
exports.removeMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.isAdmin(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Only admin can remove members'
    });
  }

  const userIdToRemove = req.params.userId;

  // Cannot remove admin
  if (group.isAdmin(userIdToRemove)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove admin'
    });
  }

  await group.removeMember(userIdToRemove);

  const updatedGroup = await Group.findById(group._id)
    .populate('admin', 'name email avatar')
    .populate('members.userId', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Member removed successfully',
    data: updatedGroup
  });
});

/**
 * @desc    Update group settings
 * @route   PUT /api/groups/:id
 * @access  Private (Admin only)
 */
exports.updateGroup = asyncHandler(async (req, res) => {
  const { name, description, type, settings } = req.body;

  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.isAdmin(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Only admin can update group settings'
    });
  }

  if (name) group.name = name;
  if (description !== undefined) group.description = description;
  if (type) group.type = type;
  if (settings) group.settings = { ...group.settings, ...settings };

  await group.save();

  const updatedGroup = await Group.findById(group._id)
    .populate('admin', 'name email avatar')
    .populate('members.userId', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Group updated successfully',
    data: updatedGroup
  });
});

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private (Admin only)
 */
exports.deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.isAdmin(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Only admin can delete group'
    });
  }

  await group.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Group deleted successfully'
  });
});

/**
 * @desc    Promote member to admin
 * @route   POST /api/groups/:id/promote/:userId
 * @access  Private (Admin only)
 */
exports.promoteMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.isAdmin(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Only admin can promote members'
    });
  }

  await group.promoteToAdmin(req.params.userId);

  const updatedGroup = await Group.findById(group._id)
    .populate('admin', 'name email avatar')
    .populate('members.userId', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Member promoted to admin',
    data: updatedGroup
  });
});

/**
 * @desc    Search users to invite (by email or name)
 * @route   GET /api/groups/search-users
 * @access  Private
 */
exports.searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  const users = await User.find({
    $or: [
      { email: { $regex: query, $options: 'i' } },
      { name: { $regex: query, $options: 'i' } }
    ],
    _id: { $ne: req.user._id } // Exclude current user
  })
  .select('name email avatar')
  .limit(20);

  res.status(200).json({
    success: true,
    data: users
  });
});
