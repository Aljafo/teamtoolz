# Database Schema - TaskFlow Mobile App

**Last Updated:** 2026-04-13  
**Status:** Design Phase - Not yet implemented

## Overview
This schema supports a mobile task management system with:
- Custom color-coded task categories (organizations define their own during setup)
- Team-based task assignment with claim/unclaim functionality
- Individual vs Team task distinction (jade vs purple)
- Photo-based observations that can be converted to tasks
- Real-time notifications

## Tables

### 1. `organizations`
Top-level organization/company records with subscription information.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'standard', -- 'standard' or 'premium'
  subscription_status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  max_users INTEGER DEFAULT 50, -- Subscription limit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:**
- Central record for each company/organization using the system
- Links all users, tasks, and data to a single organization
- Manages subscription tier and billing via Stripe
- Enforces user limits based on plan

**Subscription Tiers:**
- **Standard**: $29/month - 50 users, images/PDFs/docs, standard support
- **Premium**: $79/month - 100 users, all Standard + 15s videos, priority support

---

### 2. `users` (Team Members)
Stores team member information and authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT, -- URL to profile photo, null if using initials
  role TEXT, -- Job title e.g., "Project Lead", "Developer", "QA Engineer"
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notes:**
- If `avatar_url` is null, UI displays initials from `name`
- Email used for authentication via Supabase Auth
- `role` is job title (displayed in UI but doesn't control permissions)
- `organization_id` links user to their organization (required)
- All users inherit subscription tier from their organization
- User's actual permissions (admin vs member) stored in `user_roles` table

---

### 3. `user_roles`
Maps users to organizations with role-based permissions (admin or member).

```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, organization_id)
);
```

**Purpose:**
- Defines whether a user is an admin or regular member
- Tracks invitation chain (who invited whom)
- Supports future multi-org memberships

**Permissions:**
- **Admin**: Can invite/remove users, manage subscription, edit categories, create teams
- **Member**: Can create tasks/observations, claim tasks, chat, upload files

---

### 4. `invitations`
Tracks pending user invitations sent by admins.

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL, -- Secure random token for invitation link
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:**
- Secure token-based invitation system
- Prevents unauthorized signups (invite-only)
- Tracks invitation lifecycle

**Invitation Flow:**
1. Admin creates invitation → `status = 'pending'`, token generated
2. Email sent to invitee with unique link containing token
3. User clicks link → validates token, creates account
4. Account created → `status = 'accepted'`
5. Tokens expire after 7 days → `status = 'expired'`

**Security:**
- Tokens are one-time use (UUID v4)
- Tokens expire after 7 days
- Email must match invitation
- Only admins can create invitations

---

### 5. `categories`
Custom categories defined by the organization during setup.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL, -- Hex color (e.g., '#7c8ba8')
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notes:**
- Each organization defines their own categories during initial setup
- Categories are scoped to organization (cannot be shared across orgs)
- Each category has a custom name and hex color
- Default categories typically include Maintenance (#7c8ba8), Operations (#ff8c42), and H&S (#fbbf24)
- Only admins can create/edit/delete categories
- Category colors are displayed as banners on task and observation cards throughout the system

---

### 6. `teams`
Teams for organizing users and assigning tasks to groups.

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
```

**Notes:**
- Teams are scoped to organization (cannot be shared across orgs)
- Teams are created during organization setup (desktop only)
- Only admins can create/edit/delete teams
- Users can belong to multiple teams within their org (many-to-many relationship via `team_members`)
- Team names are editable in the desktop Teams management page
- Members can be added/removed from teams through the desktop interface
- Team tasks appear in the "Team Tasks" tab for all team members
- Any team member can claim an unclaimed team task

**Team Task Flow:**
1. **Unclaimed team task**: `assigned_to_team_id` set, `assigned_to` null → shown in "Team Tasks" tab for all team members
2. **Claimed team task**: `assigned_to_team_id` set, `assigned_to` set → moves to claimer's "Tasks" tab, retains purple border
3. **Unclaim**: User can revert task back to team → sets `assigned_to` to null, task returns to "Team Tasks" tab

---

### 7. `external_contacts`
Tracks external parties who have been assigned tasks via email.

```sql
CREATE TABLE external_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT, -- Optional display name (e.g., "ACME Plumbing", "John Smith")
  last_used TIMESTAMPTZ DEFAULT NOW(),
  used_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);
```

**Purpose:**
- Autocomplete suggestions when assigning tasks to external parties
- Track frequency of external assignments
- Display name makes dropdown more user-friendly

**Usage:**
- When user assigns task to external party, email is validated and stored
- If email already exists, `last_used` is updated and `used_count` is incremented
- If new email, new record is created with `used_count = 1`
- UI shows top 3 most recently used external contacts for quick selection
- Users can still type any new email address

**UI Display:**
- Recent external contacts shown in assignment dropdown with mail icon
- Orange badge and border color (#f59e0b) distinguishes external tasks
- Email address displayed on task cards instead of user avatar

---

### 8. `observations`
Photo-based field observations that can be converted into tasks.

```sql
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number SERIAL UNIQUE NOT NULL, -- Sequential number for reporting (e.g., OBS-001)
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  photos TEXT[], -- Array of photo URLs (legacy field for initial photos)
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Additional attachments (beyond initial photos) are stored in the attachments table
-- and linked via observation_id foreign key
```

**Numbering:**
- `number` field is auto-incrementing and unique
- Displayed as "OBS-001", "OBS-002", etc. in the UI
- Used for history and reporting purposes
- Only shown in observation detail screens, not in summary cards

**Card Design:**
- Blue border (#5b9bd5) for all observations
- Compact summary card with 2-line title
- Author initials in top-right corner
- Shows count of tasks created from observation (e.g., "2 tasks created")
- "Convert to task" button always available (becomes "Create another task" after first conversion)

---

### 9. `tasks`
Tasks created manually or converted from observations.

```sql
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number SERIAL UNIQUE NOT NULL, -- Sequential number for reporting (e.g., TSK-001)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL NOT NULL,
  assigned_to_team_id UUID REFERENCES teams(id) ON DELETE SET NULL, -- Team assignment (null = individual task)
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL, -- Individual assignment
  assigned_to_external TEXT, -- External party email (null = internal task)
  status task_status DEFAULT 'pending',
  photos TEXT[], -- Array of photo URLs (legacy field, inherited from observations)
  created_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  observation_id UUID REFERENCES observations(id) ON DELETE SET NULL, -- If converted from observation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_single_assignment CHECK (
    (assigned_to IS NOT NULL)::integer + 
    (assigned_to_team_id IS NOT NULL)::integer + 
    (assigned_to_external IS NOT NULL)::integer <= 1
  )
);

-- Note: Additional attachments (beyond inherited photos) are stored in the attachments table
-- and linked via task_id foreign key
```

**Numbering:**
- `number` field is auto-incrementing and unique
- Displayed as "TSK-001", "TSK-002", etc. in the UI
- Used for history and reporting purposes
- Only shown in task detail screens, not in summary cards

**Task Types & Display:**
- **Individual task**: `assigned_to` set, `assigned_to_team_id = null`, `assigned_to_external = null` → Jade border (#4dd0e1)
- **Unclaimed team task**: `assigned_to_team_id` set, `assigned_to = null`, `assigned_to_external = null` → Purple border (#9c88ff), shown in "Team Tasks" tab
- **Claimed team task**: `assigned_to_team_id` set, `assigned_to` set, `assigned_to_external = null` → Purple border (#9c88ff), shown in claimer's "Tasks" tab
- **External task**: `assigned_to_external` set (email), `assigned_to = null`, `assigned_to_team_id = null` → Orange border (#f59e0b)
- Team name displayed on all team tasks (claimed and unclaimed)
- External email displayed on all external tasks with mail icon
- Claim button appears on unclaimed team tasks for team members
- Unclaim button appears on claimed team tasks for the assigned user

**Assignment Constraint:**
- Only ONE of `assigned_to`, `assigned_to_team_id`, or `assigned_to_external` can be set at a time
- Enforced by database constraint `check_single_assignment`
- Prevents invalid states like a task being assigned to both a person and a team

**Color Coding:**
- Category banner shows custom color from `categories.color`
- Border color determined by assignment type:
  - `assigned_to_external` set → Orange border (#f59e0b) → External task
  - `assigned_to_team_id` set → Purple border (#9c88ff) → Team task (claimed or unclaimed)
  - Neither set (or only `assigned_to` set) → Jade border (#4dd0e1) → Individual task

**Status Indicators:**
- `pending` → Grey circle
- `in-progress` → Blue circle (filled)
- `completed` → Green circle (filled)

---

### 10. `notifications`
System notifications (shown as red badge on contacts icon).

```sql
CREATE TYPE notification_type AS ENUM ('task_assigned', 'observation_created', 'task_completed', 'team_mention');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  related_observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
  message TEXT NOT NULL, -- Notification text
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI Display:**
- Unread count shown as red badge on purple contacts icon
- Badge shows number of `is_read = false` for current user

---

### 11. `messages`
Chat messages for global team communication and contextual task/observation discussions.

```sql
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- NULL for global/observation chats
  observation_id UUID REFERENCES observations(id) ON DELETE CASCADE, -- NULL for global/task chats
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW() -- For status updates
);
```

**Message Types:**
1. **Global Chat**: Both `task_id` and `observation_id` are NULL
   - General team communication
   - Accessible via "Chat" in desktop navigation or team icon in mobile
   - All team members can send and view
2. **Task Chat**: `task_id` set, `observation_id` is NULL
   - Discussion specific to a task
   - Accessible via chat button in task detail view
   - Filtered by `task_id` in queries
3. **Observation Chat**: `observation_id` set, `task_id` is NULL
   - Discussion specific to an observation
   - Accessible via chat button in observation detail view
   - Filtered by `observation_id` in queries

**Message Status Flow:**
1. **sent**: Initial state when message is created
2. **delivered**: Auto-updated 500ms after creation (simulating server receipt)
3. **read**: Updated when recipient views message (1 second after appearing in chat)

**WhatsApp-Style Indicators:**
- ✓ (single check): `sent` - Grey color
- ✓✓ (double check): `delivered` - Grey color
- ✓✓ (double check): `read` - Blue color (#3b82f6)

**UI Features:**
- Messages from current user align right with blue background
- Messages from others align left with grey background
- Sender avatar and name shown for others' messages
- Auto-scroll to latest message when chat opens
- Unread count badge on chat buttons
- Messages auto-marked as read after 1 second of being visible

**Constraints:**
- `task_id` and `observation_id` cannot both be set (application-level check)
- At least one of `task_id`, `observation_id`, or global (both NULL) must apply
- Messages deleted when parent task/observation is deleted (CASCADE)

---

### 12. `attachments`
File attachments for tasks and observations (beyond initial photos).

```sql
CREATE TYPE attachment_type AS ENUM ('image', 'document', 'video');

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type attachment_type NOT NULL,
  url TEXT NOT NULL, -- URL to file in Supabase Storage
  name TEXT NOT NULL, -- Original filename
  size INTEGER NOT NULL, -- File size in bytes
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- NULL for observation attachments
  observation_id UUID REFERENCES observations(id) ON DELETE CASCADE, -- NULL for task attachments
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Attachment Types:**
- **image**: Photos, PNG, JPG, etc. (all subscription tiers)
- **document**: PDFs, Word docs, Excel sheets (all subscription tiers)
- **video**: Video files - 15 second max (premium subscription only)

**File Upload:**
- Files uploaded to Supabase Storage bucket
- URL format: `https://{project}.supabase.co/storage/v1/object/public/attachments/{filename}`
- Client-side validation checks subscription tier before allowing video uploads
- Server-side validation enforces file type restrictions based on user's subscription_tier

**Usage:**
- Team members can add attachments to tasks and observations at any time
- Attachments appear in FileUpload component on desktop (drag-and-drop zone)
- Attachments appear in MobileFileUpload component on mobile (Camera/Files buttons)
- Subscription tier determines allowed file types:
  - Standard: images (.jpg, .png, etc.), PDFs (.pdf), documents (.doc, .docx, .xls, .xlsx)
  - Premium: All standard types plus videos (15 second max, compressed)
- Attachments can be removed by any team member
- Attachment list shows file previews, names, sizes, and remove buttons

**Storage Limits:**
- Video files: 15 seconds max duration (enforced in UI and backend)
- Video compression applied automatically for premium users
- File size limits managed via Supabase Storage bucket policies

**Constraints:**
- Either `task_id` or `observation_id` must be set (not both, not neither)
- Attachments deleted when parent task/observation is deleted (CASCADE)
- `uploaded_by` becomes NULL if user is deleted (prevents data loss)

---

## Indexes

```sql
-- Performance indexes for common queries
CREATE INDEX idx_organizations_stripe_customer ON organizations(stripe_customer_id);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_organization_id ON user_roles(organization_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

CREATE INDEX idx_tasks_number ON tasks(number); -- For searching by task number
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_to_team_id ON tasks(assigned_to_team_id);
CREATE INDEX idx_tasks_assigned_to_external ON tasks(assigned_to_external);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

CREATE INDEX idx_teams_organization_id ON teams(organization_id);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

CREATE INDEX idx_categories_organization_id ON categories(organization_id);

CREATE INDEX idx_external_contacts_organization_id ON external_contacts(organization_id);
CREATE INDEX idx_external_contacts_email ON external_contacts(organization_id, email);
CREATE INDEX idx_external_contacts_last_used ON external_contacts(last_used DESC);

CREATE INDEX idx_observations_number ON observations(number); -- For searching by observation number
CREATE INDEX idx_observations_author ON observations(author_id);
CREATE INDEX idx_observations_category_id ON observations(category_id);
CREATE INDEX idx_observations_created_at ON observations(created_at DESC);
CREATE INDEX idx_tasks_observation_id ON tasks(observation_id); -- For counting tasks per observation

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_task_id ON messages(task_id);
CREATE INDEX idx_messages_observation_id ON messages(observation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_status ON messages(status);
-- Composite index for finding unread messages by context
CREATE INDEX idx_messages_task_status ON messages(task_id, status) WHERE task_id IS NOT NULL;
CREATE INDEX idx_messages_observation_status ON messages(observation_id, status) WHERE observation_id IS NOT NULL;
CREATE INDEX idx_messages_global ON messages(created_at DESC) WHERE task_id IS NULL AND observation_id IS NULL;

CREATE INDEX idx_attachments_task_id ON attachments(task_id);
CREATE INDEX idx_attachments_observation_id ON attachments(observation_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_uploaded_at ON attachments(uploaded_at DESC);
```

---

## Row Level Security (RLS)

**When implementing in Supabase:**

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users see own organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Organizations: Only admins can update their organization
CREATE POLICY "Admins can update organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users: Users can only see members of their organization
CREATE POLICY "Users see org members" ON users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Users: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User Roles: Users can see roles in their organization
CREATE POLICY "Users see org roles" ON user_roles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- User Roles: Only admins can manage roles
CREATE POLICY "Admins manage roles" ON user_roles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Invitations: Users can see invitations in their organization
CREATE POLICY "Users see org invitations" ON invitations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Invitations: Only admins can create/manage invitations
CREATE POLICY "Admins manage invitations" ON invitations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Invitations: Public read for token validation (during signup)
CREATE POLICY "Anyone can validate invitation token" ON invitations
  FOR SELECT USING (status = 'pending' AND expires_at > NOW());

-- Categories: Users see org categories
CREATE POLICY "Users see org categories" ON categories
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Categories: Only admins can manage categories
CREATE POLICY "Admins manage categories" ON categories
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Teams: Users see org teams
CREATE POLICY "Users see org teams" ON teams
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Teams: Only admins can manage teams
CREATE POLICY "Admins manage teams" ON teams
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Team Members: Users see team memberships in their org
CREATE POLICY "Users see org team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM teams WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );

-- Team Members: Only admins can manage team memberships
CREATE POLICY "Admins manage team members" ON team_members
  FOR ALL USING (
    team_id IN (
      SELECT id FROM teams t
      WHERE t.organization_id IN (
        SELECT organization_id FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- External Contacts: Users see org external contacts
CREATE POLICY "Users see org external contacts" ON external_contacts
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- External Contacts: Org users can manage external contacts
CREATE POLICY "Org users manage external contacts" ON external_contacts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Tasks: Users can see tasks in their organization
CREATE POLICY "Users see org tasks" ON tasks
  FOR SELECT USING (
    created_by IN (
      SELECT u.id FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );

-- Tasks: Users in org can create tasks
CREATE POLICY "Org users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    created_by IN (
      SELECT u.id FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );

-- Tasks: Users can update tasks in their org
CREATE POLICY "Org users can update tasks" ON tasks
  FOR UPDATE USING (
    created_by IN (
      SELECT u.id FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );

-- Observations: Users see org observations
CREATE POLICY "Users see org observations" ON observations
  FOR SELECT USING (
    author_id IN (
      SELECT u.id FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );

-- Observations: Org users can create observations
CREATE POLICY "Org users can create observations" ON observations
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    author_id IN (
      SELECT u.id FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: Everyone can read all messages (team collaboration)
CREATE POLICY "Messages are viewable by everyone" ON messages
  FOR SELECT USING (true);

-- Messages: Any authenticated user can create messages
CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Messages: Users can update their own messages (for status changes)
CREATE POLICY "Users can update message status" ON messages
  FOR UPDATE USING (true);

-- Attachments: Everyone can read all attachments (team collaboration)
CREATE POLICY "Attachments are viewable by everyone" ON attachments
  FOR SELECT USING (true);

-- Attachments: Any authenticated user can add attachments
CREATE POLICY "Users can create attachments" ON attachments
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Attachments: Any authenticated user can delete attachments (team collaboration)
CREATE POLICY "Users can delete attachments" ON attachments
  FOR DELETE USING (true);
```

---

## Realtime Subscriptions

**Supabase Realtime channels to enable:**

```javascript
// Subscribe to new tasks
supabase
  .channel('tasks')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'tasks' }, 
    payload => handleNewTask(payload)
  )
  .subscribe()

// Subscribe to task updates (status changes, reassignments)
supabase
  .channel('task_updates')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'tasks' }, 
    payload => handleTaskUpdate(payload)
  )
  .subscribe()

// Subscribe to new observations
supabase
  .channel('observations')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'observations' }, 
    payload => handleNewObservation(payload)
  )
  .subscribe()

// Subscribe to user's notifications
supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications', 
      filter: `user_id=eq.${currentUserId}` }, 
    payload => handleNewNotification(payload)
  )
  .subscribe()

// Subscribe to new messages (all chats)
supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' }, 
    payload => handleNewMessage(payload)
  )
  .subscribe()

// Subscribe to message status updates (for delivery/read receipts)
supabase
  .channel('message_status')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'messages' }, 
    payload => handleMessageStatusUpdate(payload)
  )
  .subscribe()

// Subscribe to new attachments
supabase
  .channel('attachments')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'attachments' }, 
    payload => handleNewAttachment(payload)
  )
  .subscribe()

// Subscribe to attachment deletions
supabase
  .channel('attachment_deletes')
  .on('postgres_changes', 
    { event: 'DELETE', schema: 'public', table: 'attachments' }, 
    payload => handleAttachmentDelete(payload)
  )
  .subscribe()
```

---

## Key Design Decisions

### 1. **Custom Category System**
- Organizations define their own categories during initial setup (desktop only)
- Each category has a custom name and hex color chosen by the organization
- Categories are editable (both name and color) in the desktop Categories management page
- Category colors are displayed as banners on all task and observation cards (both desktop and mobile)
- Default categories typically include: Maintenance (#7c8ba8), Operations (#ff8c42), H&S (#fbbf24)
- Tasks and observations reference categories by UUID foreign key

### 2. **Team-Based Task Assignment**
- Teams are created during setup (desktop only) with customizable names
- Users can belong to multiple teams (many-to-many via `team_members` table)
- Tasks can be assigned to individuals or teams via `assigned_to_team_id`
- **Three task states:**
  - **Individual task**: `assigned_to_team_id = null`, `assigned_to` set → Jade border (#4dd0e1)
  - **Unclaimed team task**: `assigned_to_team_id` set, `assigned_to = null` → Purple border (#9c88ff)
  - **Claimed team task**: `assigned_to_team_id` set, `assigned_to` set → Purple border (#9c88ff)
- **Mobile UI:**
  - "Tasks" tab shows all tasks assigned to current user (jade for individual, purple for claimed team tasks)
  - "Team Tasks" tab shows unclaimed team tasks where current user is a team member
  - Claim button on unclaimed team tasks → sets `assigned_to`, moves to "Tasks" tab
  - Unclaim button on claimed team tasks → clears `assigned_to`, returns to "Team Tasks" tab
- **Desktop UI:**
  - Teams management page for creating teams and adding/removing members
  - ObservationCard allows assigning to individual or team when converting to task
- Team name displayed on all team task cards for visibility and context

### 3. **Photo Storage**
- Photos stored as TEXT[] (array of URLs)
- Actual images uploaded to Supabase Storage
- URLs reference storage bucket: `https://{project}.supabase.co/storage/v1/object/public/photos/{filename}`

### 4. **Observation → Task Conversion**
- **Multiple tasks can be created from a single observation**
- When observation is converted, `observation_id` links to source
- Frontend tracks count of tasks created (query: `SELECT COUNT(*) FROM tasks WHERE observation_id = ?`)
- UI shows "X tasks created" and button changes to "Create another task"
- Preserves full audit trail of all tasks derived from an observation

### 5. **Unique Sequential Numbering**
- Both tasks and observations have auto-incrementing `number` fields
- Provides human-readable references for history and reporting
- Format: "TSK-001", "OBS-001" with zero-padding for consistency
- Only displayed in detail views to avoid clutter in summary cards
- Useful for verbal communication ("Can you check task 45?")
- Indexed for fast lookup when searching by number

### 6. **Chat & Messaging System**
- **Three types of chat contexts:**
  1. **Global Team Chat**: Messages with NULL `task_id` and `observation_id`
  2. **Task Chat**: Messages linked to specific task via `task_id`
  3. **Observation Chat**: Messages linked to specific observation via `observation_id`
- **WhatsApp-style message status tracking:**
  - `sent` → `delivered` (auto after 500ms) → `read` (when viewed)
  - Visual indicators: ✓ (sent), ✓✓ grey (delivered), ✓✓ blue (read)
- **Desktop UI:**
  - Global chat accessible via "Chat" navigation item
  - Task/observation chats via chat button in detail modals
  - Unread count badges on chat buttons
- **Mobile UI:**
  - Global chat via team icon (purple circle) in top bar
  - Task/observation chats via MessageCircle button in detail views
  - Unread count shown as red badges
- **Auto-delivery simulation:** Frontend updates status to 'delivered' 500ms after sending
- **Auto-read marking:** Messages auto-marked as read 1 second after being visible in chat
- **Real-time updates:** Realtime subscriptions for instant message delivery and status updates

### 7. **Organization-First Signup Model**
- **Desktop-only signup**: New organizations can only register via desktop application
- **Admin creates organization**: First user sets up organization, becomes primary admin
- **Invitation-only user additions**: No public signup - admins invite users by email
- **Token-based invitations**:
  - Unique UUID v4 token generated per invitation (`crypto.randomUUID()`)
  - 7-day expiration from invitation creation
  - Single-use tokens (marked 'accepted' or 'cancelled' after use)
- **Invitation flow**:
  1. Admin enters email, name, and role (admin or member)
  2. System validates email, checks for duplicates
  3. Invitation record created with token
  4. Email sent via Supabase Edge Function with accept link
  5. New user clicks link, validates token, creates password
  6. Account created and invitation marked as accepted
- **Security features**:
  - Email validation regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Token expiration checking on validation
  - Status checking (pending only, not cancelled/accepted/expired)
  - Admin-only permission checks for invite operations

### 8. **Role-Based Permissions (Admin vs Member)**
- **Two permission levels**: admin and member
- **Admin permissions**:
  - Invite and remove users
  - Manage subscription and billing
  - Create, edit, and delete categories
  - Create, edit, and delete teams
  - All member permissions
- **Member permissions**:
  - Create observations and tasks
  - Claim/unclaim team tasks
  - Upload photos and documents
  - Send chat messages
  - View team members and invitations (read-only)
- **Permission enforcement**:
  - Frontend: UI elements hidden/disabled for non-admins
  - Backend: RLS policies check `user_roles.role` for write operations
  - Invitation operations check `currentUser.userRole === 'admin'`
- **Visual indicators**:
  - Crown icon (👑) next to admin names in user lists
  - Purple "Admin" badge on admin profiles
  - Shield icon on admin invitation badges
  - "(You)" label next to current user in lists

### 9. **External Party Task Assignment**
- **Email-based external assignment**: Tasks can be assigned to external contractors/parties via email
- **Three task assignment types**:
  1. **Internal individual**: `assigned_to` set, `assigned_to_team_id = null`, `assigned_to_external = null` → Jade border
  2. **Internal team**: `assigned_to_team_id` set, `assigned_to_external = null` → Purple border
  3. **External party**: `assigned_to_external` set (email), `assigned_to = null`, `assigned_to_team_id = null` → Orange border (#f59e0b)
- **External contact tracking**:
  - Recent contacts stored in `external_contacts` table
  - Auto-increment `used_count` when email reused
  - Update `last_used` timestamp on each use
  - UI shows recent contacts for quick selection
- **Email notification**:
  - Sent via Supabase Edge Function (Resend API)
  - HTML template with task details, category, photos
  - Professional branded design
  - Includes task metadata (assigned by, created date, status)
- **Visual indicators**:
  - Orange border on external task cards
  - Mail icon (📧) with email address badge
  - "External" label in task lists
  - Preview button for email template

### 10. **Soft Deletes**
- Currently using `ON DELETE CASCADE` for simplicity
- Consider adding `deleted_at` timestamp for soft deletes if audit trail needed

---

## Future Enhancements to Consider

1. **Comments/Activity Log**
   - Add `task_comments` table for discussion on tasks
   - Track status change history

2. **Due Dates & Reminders**
   - Add `due_date` field to tasks
   - Notification system for overdue tasks

3. **Projects**
   - Add `projects` table
   - Filter tasks by project
   - Link teams to projects

4. **Permissions & Roles**
   - Add `user_roles` table with granular permissions
   - Admin vs. Member vs. Viewer roles

5. **Task Templates**
   - Common recurring tasks as templates
   - Quick-create from template

---

## Color Reference (for frontend consistency)

```javascript
// View colors (tabs & headers)
export const VIEW_COLORS = {
  myDay: '#f5f5dc',      // Ivory
  observations: '#5b9bd5', // Blue
  tasks: '#4dd0e1',       // Jade
  teamTasks: '#9c88ff'    // Purple
}

// Category colors (banners) - DYNAMIC
// Category colors are now stored in the database and chosen by the organization
// Default examples:
// - Maintenance: '#7c8ba8' (Grey)
// - Operations: '#ff8c42' (Orange)
// - H&S: '#fbbf24' (Yellow)
// Fetch from categories table: SELECT id, name, color FROM categories

// Background
export const BG_COLOR = '#2c3e72' // Navy blue
```
