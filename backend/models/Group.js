const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'active'],
    default: 'pending'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['family', 'school', 'community', 'other'],
    default: 'family'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [groupMemberSchema],
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: false // Only admin can invite by default
    },
    requireApproval: {
      type: Boolean,
      default: true // Invitations require acceptance
    },
    autoShareConsumption: {
      type: Boolean,
      default: true // Members can see each other's consumption
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
groupSchema.index({ admin: 1 });
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ createdAt: -1 });

// Update timestamp on save
groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods

// Check if user is admin
groupSchema.methods.isAdmin = function(userId) {
  return this.admin.toString() === userId.toString();
};

// Check if user is member (active)
groupSchema.methods.isMember = function(userId) {
  return this.members.some(m => {
    const memberId = m.userId._id ? m.userId._id.toString() : m.userId.toString();
    return memberId === userId.toString() && m.status === 'active';
  });
};

// Check if user has pending invitation
groupSchema.methods.hasPendingInvitation = function(userId) {
  return this.members.some(m => {
    const memberId = m.userId._id ? m.userId._id.toString() : m.userId.toString();
    return memberId === userId.toString() && m.status === 'pending';
  });
};

// Get active members
groupSchema.methods.getActiveMembers = function() {
  return this.members.filter(m => m.status === 'active');
};

// Get pending members
groupSchema.methods.getPendingMembers = function() {
  return this.members.filter(m => m.status === 'pending');
};

// Add member
groupSchema.methods.addMember = function(userId, role = 'member', status = 'pending') {
  // Check if already exists
  const exists = this.members.some(m => m.userId.toString() === userId.toString());
  if (exists) {
    throw new Error('User is already a member or has pending invitation');
  }
  
  this.members.push({
    userId,
    role,
    status,
    joinedAt: new Date()
  });
  
  return this.save();
};

// Accept invitation (change status to active)
groupSchema.methods.acceptMember = function(userId) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found');
  }
  if (member.status === 'active') {
    throw new Error('Member is already active');
  }
  
  member.status = 'active';
  member.joinedAt = new Date();
  
  return this.save();
};

// Remove member
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
  return this.save();
};

// Make member admin (promote)
groupSchema.methods.promoteToAdmin = function(userId) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found');
  }
  if (member.status !== 'active') {
    throw new Error('Cannot promote pending member');
  }
  
  member.role = 'admin';
  return this.save();
};

// Static methods

// Get user's groups (active membership OR admin)
groupSchema.statics.getUserGroups = function(userId) {
  return this.find({
    $or: [
      { admin: userId },
      {
        'members': {
          $elemMatch: {
            userId: userId,
            status: 'active'
          }
        }
      }
    ]
  })
  .populate('admin', 'name email avatar')
  .populate('members.userId', 'name email avatar')
  .sort({ updatedAt: -1 });
};

// Get user's pending invitations
groupSchema.statics.getUserPendingInvitations = function(userId) {
  return this.find({
    'members': {
      $elemMatch: {
        userId: userId,
        status: 'pending'
      }
    }
  })
  .populate('admin', 'name email avatar')
  .sort({ createdAt: -1 });
};

// Get groups where user is admin
groupSchema.statics.getUserAdminGroups = function(userId) {
  return this.find({ admin: userId })
    .populate('members.userId', 'name email avatar')
    .sort({ updatedAt: -1 });
};

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
