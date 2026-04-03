# Group Management & Multi-User Oil Logging System

## Overview
Complete implementation of group-based oil consumption tracking where admins can log food consumption for multiple users simultaneously.

## Backend Implementation ✅

### 1. Database Models

#### Group Model (`backend/models/Group.js`)
- **Schema Fields:**
  - `name`, `description`, `type` (family/school/community/other)
  - `admin` (ObjectId ref to User)
  - `members[]`: userId, role (admin/member), status (pending/active), joinedAt
  - `settings`: allowMemberInvites, requireApproval, autoShareConsumption
  - `createdAt`, `updatedAt`

- **Methods:**
  - `isAdmin(userId)`, `isMember(userId)`, `hasPendingInvitation(userId)`
  - `addMember()`, `acceptMember()`, `removeMember()`, `promoteToAdmin()`
  
- **Static Methods:**
  - `getUserGroups()`, `getUserPendingInvitations()`, `getUserAdminGroups()`

#### OilConsumption Model Updates
- Added fields: `groupId`, `loggedBy`, `isGroupLog`
- Track which admin logged the entry and for which group

### 2. API Endpoints (`backend/controllers/groupController.js`)

#### Group Management
- `POST /api/groups` - Create new group
- `GET /api/groups` - Get user's active groups
- `GET /api/groups/invitations` - Get pending invitations
- `GET /api/groups/admin` - Get groups where user is admin
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group settings (admin only)
- `DELETE /api/groups/:id` - Delete group (admin only)

#### Member Management
- `POST /api/groups/:id/invite` - Invite members (admin or members with permission)
- `POST /api/groups/:id/accept` - Accept invitation
- `POST /api/groups/:id/reject` - Reject invitation
- `POST /api/groups/:id/leave` - Leave group (members only, not admin)
- `DELETE /api/groups/:id/members/:userId` - Remove member (admin only)
- `POST /api/groups/:id/promote/:userId` - Promote member to admin

#### User Search
- `GET /api/groups/search-users?query=` - Search users by email/name to invite

### 3. Group Oil Logging (`backend/controllers/oilConsumptionController.js`)

#### Bulk Logging Endpoint
- `POST /api/oil/log-group`
- **Request Body:**
  ```json
  {
    "groupId": "group_id",
    "consumptionData": [
      {
        "userId": "user_id",
        "foodName": "Paratha",
        "oilType": "Ghee",
        "oilAmount": 15,
        "quantity": 2,
        "unit": "pieces",
        "mealType": "Breakfast",
        "consumedAt": "2025-12-07T08:00:00Z"
      },
      // ... more entries
    ]
  }
  ```

- **Features:**
  - Verifies admin permission
  - Validates each member is in group
  - Computes personalized daily goals for each user
  - Logs consumption with groupId and loggedBy fields
  - Returns success/error for each entry

## Frontend Implementation ✅

### API Service (`src/services/api.ts`)

#### TypeScript Interfaces
```typescript
interface Group {
  _id: string;
  name: string;
  description?: string;
  type: 'family' | 'school' | 'community' | 'other';
  admin: { _id: string; name: string; email: string; avatar?: string };
  members: GroupMember[];
  settings: { allowMemberInvites: boolean; requireApproval: boolean; autoShareConsumption: boolean };
  createdAt: string;
  updatedAt: string;
}

interface GroupMember {
  userId: { _id: string; name: string; email: string; avatar?: string };
  role: 'admin' | 'member';
  status: 'pending' | 'active';
  joinedAt: string;
}

interface GroupConsumptionItem {
  userId: string;
  foodName: string;
  oilType: string;
  oilAmount: number;
  quantity: number;
  unit: 'grams' | 'bowls' | 'pieces';
  mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  consumedAt?: string;
}
```

#### API Methods
- `createGroup(data)` - Create new group
- `getMyGroups()` - Get user's groups
- `getPendingInvitations()` - Get pending invitations
- `getAdminGroups()` - Get groups where user is admin
- `getGroup(groupId)` - Get group details
- `inviteMembers(groupId, userIds[])` - Invite users
- `acceptInvitation(groupId)` - Accept invitation
- `rejectInvitation(groupId)` - Reject invitation
- `leaveGroup(groupId)` - Leave group
- `removeMember(groupId, userId)` - Remove member (admin)
- `promoteMember(groupId, userId)` - Promote to admin
- `updateGroup(groupId, data)` - Update group
- `deleteGroup(groupId)` - Delete group
- `searchUsers(query)` - Search users to invite
- `logGroupConsumption(groupId, consumptionData[])` - Bulk log for group

## Usage Examples

### Example 1: Family Group - Mother Logs for Children

**Scenario:** Mother prepares breakfast and logs consumption for family

```javascript
// 1. Create family group
const group = await apiService.createGroup({
  name: "Singh Family",
  type: "family",
  description: "Our family group for tracking meals"
});

// 2. Invite family members
await apiService.inviteMembers(group.data._id, [
  childId1, childId2, fatherId
]);

// 3. After members accept, log breakfast
const breakfastLog = [
  {
    userId: childId1,
    foodName: "Paratha",
    oilType: "Ghee",
    oilAmount: 10,
    quantity: 2,
    unit: "pieces",
    mealType: "Breakfast"
  },
  {
    userId: childId2,
    foodName: "Poha",
    oilType: "Sunflower Oil",
    oilAmount: 8,
    quantity: 1,
    unit: "bowls",
    mealType: "Breakfast"
  },
  {
    userId: motherId, // self
    foodName: "Paratha",
    oilType: "Ghee",
    oilAmount: 15,
    quantity: 3,
    unit: "pieces",
    mealType: "Breakfast"
  }
];

await apiService.logGroupConsumption(group.data._id, breakfastLog);
```

### Example 2: School Group - Midday Meal Logging

```javascript
// 1. Create school group
const schoolGroup = await apiService.createGroup({
  name: "Class 5A - Midday Meal",
  type: "school",
  description: "Tracking midday meals for Class 5A"
});

// 2. Invite all students (batch invite)
await apiService.inviteMembers(schoolGroup.data._id, studentIds);

// 3. Log midday meal for entire class
const mealLog = students.map(student => ({
  userId: student.id,
  foodName: "Dal Rice",
  oilType: "Sunflower Oil",
  oilAmount: 12,
  quantity: 250,
  unit: "grams",
  mealType: "Lunch"
}));

await apiService.logGroupConsumption(schoolGroup.data._id, mealLog);
```

## Remaining UI Tasks

### 1. MobileGroups Screen (Todo #8)
- List all groups (tabs: My Groups, Admin Groups, Invitations)
- Create group button (FAB)
- Group cards showing name, type, member count
- Accept/Reject pending invitations
- Pull to refresh

### 2. GroupDetail Screen (Todo #9)
- Group info header (name, description, type)
- Members list with avatars, names, roles
- Admin controls:
  - Add members button → search users modal
  - Remove member button (swipe action)
  - Promote member option
  - Edit group settings
  - Delete group option
- Member controls:
  - Leave group button
- Recent group activity feed

### 3. Oil Tracker Group Logging (Todo #10)
- Add "Log for Group" toggle/button
- Group selector dropdown (admin groups only)
- Multi-member selector with checkboxes
- Batch entry form:
  - Select food item once
  - Assign different quantities to different members
  - Or duplicate same entry for all members
- Confirm bulk submission
- Show success count (e.g., "Logged for 5 members")

## Security & Validation

### Backend Validation
- ✅ Admin-only actions (invite, remove, delete, promote)
- ✅ Member verification before logging
- ✅ Group membership checks on all endpoints
- ✅ User existence validation on invites
- ✅ Prevent admin from leaving without transfer/delete

### Data Integrity
- ✅ Personalized daily goals computed per user
- ✅ SwasthaIndex calculations maintain per-user accuracy
- ✅ Logged entries track `loggedBy` for audit trail
- ✅ Group membership status (pending/active) prevents unauthorized logging

## Benefits

1. **Family Scenarios:**
   - Parent tracks children's consumption
   - Shared meal logging
   - Family health goals

2. **School Scenarios:**
   - Institutional meal tracking
   - Bulk student health monitoring
   - Compliance reporting

3. **Community:**
   - Support groups
   - Shared living spaces
   - Healthcare facilities

## Next Steps

1. Build UI screens (MobileGroups, GroupDetail)
2. Integrate group logging in MobileOilTracker
3. Add notifications for group invitations
4. Implement group activity feed
5. Add export/reporting for group admins
