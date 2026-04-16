import { useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { TaskPanel } from './components/TaskPanel';
import { TeamSidebar } from './components/TeamSidebar';
import { MobileApp } from './components/MobileApp';
import { AppSelector } from './components/AppSelector';
import { Teams } from './components/Teams';
import { GlobalChatPanel } from './components/GlobalChatPanel';
import { EmailPreview } from './components/EmailPreview';
import { Users } from './components/Users';
import { DesktopLanding } from './components/DesktopLanding';
import { DesktopLogin } from './components/DesktopLogin';
import { DesktopSignup, type SignupData } from './components/DesktopSignup';
import { MobileLanding } from './components/MobileLanding';
import { MobileLogin } from './components/MobileLogin';
import { AcceptInvitation } from './components/AcceptInvitation';

export interface Organization {
  id: string;
  name: string;
  subscriptionTier: 'standard' | 'premium';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  maxUsers: number;
  createdAt: Date;
}

export interface UserRole {
  userId: string;
  organizationId: string;
  role: 'admin' | 'member';
  invitedBy?: string;
  invitedAt: Date;
  joinedAt?: Date;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  invitedBy: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: Date;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string; // Job title
  organizationId: string;
  userRole?: 'admin' | 'member'; // Permission level from user_roles table
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'video';
  url: string;
  name: string;
  size: number; // in bytes
  uploadedAt: Date;
  uploadedBy: TeamMember;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color chosen by organization
}

export interface Subcategory {
  id: string;
  name: string;
  color: string; // Hex color chosen by organization
  categoryId: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[]; // Array of TeamMember IDs
}

export interface Message {
  id: string;
  senderId: string; // TeamMember ID
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  // Optional: links to task or observation (null = global chat)
  taskId?: string;
  observationId?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Observation {
  id: string;
  number: number; // Unique sequential number for reporting (e.g., OBS-001)
  author: TeamMember;
  message: string;
  photos: string[]; // Legacy: kept for initial observation photos
  attachments: Attachment[]; // Additional files added after creation
  timestamp: Date;
  taskIds: string[]; // Array of task IDs created from this observation
  categoryId: string;
  subcategoryId?: string; // Optional subcategory for reporting
  location?: Location; // Optional location where observation was made
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // e.g., every 2 days, every 3 weeks
  endType: 'never' | 'after' | 'on';
  endAfterOccurrences?: number; // if endType is 'after'
  endDate?: Date; // if endType is 'on'
}

export interface Task {
  id: string;
  number: number; // Unique sequential number for reporting (e.g., TSK-001)
  observationId: string;
  title: string;
  description: string;
  assignedTo: TeamMember | null;
  assignedToTeamId: string | null; // Team assignment (null = individual task)
  assignedToExternal: string | null; // External email assignment (null = internal task)
  status: 'pending' | 'in-progress' | 'completed';
  photos: string[]; // Legacy: inherited from observation
  attachments: Attachment[]; // Additional files added to task
  createdBy: TeamMember;
  createdAt: Date;
  categoryId: string;
  subcategoryId?: string; // Optional subcategory for reporting
  location?: Location; // Optional location where task should be performed
  startDate?: Date; // Optional start date for the task
  endDate?: Date; // Optional end date/deadline for the task
  isRecurring: boolean; // Whether this is a recurring task
  recurrencePattern?: RecurrencePattern; // Recurrence details if isRecurring is true
  parentRecurringTaskId?: string; // Links to the original recurring task template
  instanceDate?: Date; // For recurring instances, which date this represents
}

export interface ExternalContact {
  id: string;
  email: string;
  name?: string;
  lastUsed: Date;
  usedCount: number;
}

const mockOrganization: Organization = {
  id: 'org1',
  name: 'ACME Construction',
  subscriptionTier: 'premium',
  subscriptionStatus: 'active',
  stripeCustomerId: 'cus_mock123',
  stripeSubscriptionId: 'sub_mock123',
  maxUsers: 100,
  createdAt: new Date('2026-01-01')
};

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', role: 'Project Lead', organizationId: 'org1', userRole: 'admin' },
  { id: '2', name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', role: 'Developer', organizationId: 'org1', userRole: 'member' },
  { id: '3', name: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', role: 'Designer', organizationId: 'org1', userRole: 'admin' },
  { id: '4', name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', role: 'QA Engineer', organizationId: 'org1', userRole: 'member' },
];

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Maintenance', color: '#7c8ba8' },
  { id: 'cat2', name: 'Operations', color: '#ff8c42' },
  { id: 'cat3', name: 'H&S', color: '#fbbf24' },
];

const mockSubcategories: Subcategory[] = [
  { id: 'sub1', name: 'Electrical', color: '#4a90e2', categoryId: 'cat1' },
  { id: 'sub2', name: 'Plumbing', color: '#5da5da', categoryId: 'cat1' },
  { id: 'sub3', name: 'HVAC', color: '#60bd68', categoryId: 'cat1' },
  { id: 'sub4', name: 'Process A', color: '#f17cb0', categoryId: 'cat2' },
  { id: 'sub5', name: 'Process B', color: '#b276b2', categoryId: 'cat2' },
  // Note: H&S (cat3) has no subcategories to demonstrate optional behavior
];

const mockTeams: Team[] = [
  { id: 'team1', name: 'Maintenance Team', memberIds: ['1', '2'] },
  { id: 'team2', name: 'Safety Team', memberIds: ['3', '4'] },
  { id: 'team3', name: 'Operations Team', memberIds: ['1', '3', '4'] },
];

const mockExternalContacts: ExternalContact[] = [
  { id: 'ext1', email: 'contractor@acmeplumbing.com', name: 'ACME Plumbing', lastUsed: new Date(Date.now() - 86400000), usedCount: 5 },
  { id: 'ext2', email: 'safety@inspections.gov', name: 'Safety Inspections Dept', lastUsed: new Date(Date.now() - 172800000), usedCount: 3 },
  { id: 'ext3', email: 'john@electricalsolutions.com', lastUsed: new Date(Date.now() - 604800000), usedCount: 2 },
];

const mockInvitations: Invitation[] = [
  {
    id: 'inv1',
    organizationId: 'org1',
    email: 'newuser@example.com',
    name: 'John Smith',
    role: 'member',
    invitedBy: '1', // Sarah Chen
    token: 'mock-token-123',
    status: 'pending',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: 'inv2',
    organizationId: 'org1',
    email: 'admin@example.com',
    name: 'Jane Doe',
    role: 'admin',
    invitedBy: '1',
    token: 'mock-token-456',
    status: 'pending',
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  }
];

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export default function App() {
  const [platform, setPlatform] = useState<'desktop' | 'mobile'>('desktop');

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRoute, setAuthRoute] = useState<'landing' | 'login' | 'signup' | 'accept-invite' | null>('landing');
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'observations' | 'team' | 'categories' | 'teams' | 'chat' | 'users'>('dashboard');
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(mockSubcategories);
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [externalContacts, setExternalContacts] = useState<ExternalContact[]>(mockExternalContacts);
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([
    {
      id: '1',
      number: 1,
      author: mockTeam[1],
      message: 'Found a usability issue in the checkout flow. Users are getting confused at the payment step.',
      photos: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
      attachments: [],
      timestamp: new Date(Date.now() - 3600000),
      taskIds: [],
      categoryId: 'cat2', // Operations
    },
    {
      id: '2',
      number: 2,
      author: mockTeam[2],
      message: 'The dashboard layout looks cramped on mobile devices. We should revisit the responsive breakpoints.',
      photos: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800'],
      attachments: [],
      timestamp: new Date(Date.now() - 7200000),
      taskIds: [],
      categoryId: 'cat1', // Maintenance
    },
    {
      id: '3',
      number: 3,
      author: mockTeam[3],
      message: 'Loading time on the reports page is over 5 seconds. Need to investigate database queries.',
      photos: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'],
      attachments: [],
      timestamp: new Date(Date.now() - 10800000),
      taskIds: ['t1'], // This observation has 1 task created from it
      categoryId: 'cat2', // Operations
    },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't1',
      number: 1,
      observationId: '3',
      title: 'Service Water Pump on Tank 012',
      description: 'Check water levels at the top end of the warehouse as it will be serviced today',
      assignedTo: mockTeam[1],
      assignedToTeamId: null, // Individual task
      assignedToExternal: null,
      status: 'in-progress',
      photos: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'],
      attachments: [],
      createdBy: mockTeam[3],
      createdAt: new Date(Date.now() - 10800000),
      categoryId: 'cat1', // Maintenance
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // Tomorrow
      isRecurring: false,
    },
    {
      id: 't2',
      number: 2,
      observationId: '1',
      title: 'Loose Wiring on South Wall of Compressor Shed',
      description: 'Electrical wiring inspection needed urgently',
      assignedTo: null, // Unclaimed team task
      assignedToTeamId: 'team2', // Safety Team
      assignedToExternal: null,
      status: 'pending',
      photos: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'],
      attachments: [],
      createdBy: mockTeam[0],
      createdAt: new Date(),
      categoryId: 'cat3', // H&S
      endDate: new Date(Date.now() + 172800000), // 2 days from now
      isRecurring: false,
    },
    {
      id: 't3',
      number: 3,
      observationId: '2',
      title: 'Inspect Compressor Unit B',
      description: 'Monthly inspection of compressor unit B required',
      assignedTo: mockTeam[0], // Claimed by Sarah
      assignedToTeamId: 'team1', // Still associated with Maintenance Team
      assignedToExternal: null,
      status: 'in-progress',
      photos: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
      attachments: [],
      createdBy: mockTeam[1],
      createdAt: new Date(Date.now() - 5400000),
      categoryId: 'cat1', // Maintenance
      startDate: new Date(Date.now() - 5400000),
      isRecurring: true,
      recurrencePattern: {
        type: 'monthly',
        interval: 1,
        endType: 'never',
      },
    },
  ]);

  // Auth functions
  const handleLogin = async (email: string, password: string) => {
    // Mock authentication - in production, this would call Supabase Auth
    // For demo purposes, accept any valid email/password
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    // Mock: Create a user session
    const mockUser: TeamMember = mockTeam[0]; // Use first team member as logged-in user
    setCurrentUser(mockUser);
    setCurrentOrganization(mockOrganization);
    setIsAuthenticated(true);
    setAuthRoute(null);
  };

  const handleSignup = async (data: SignupData) => {
    // Mock signup - in production, this would:
    // 1. Create organization in Supabase
    // 2. Create admin user with Supabase Auth
    // 3. Set up Stripe subscription
    // 4. Create initial data (categories, etc.)
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    // Mock: Create organization and admin user
    const newOrganization: Organization = {
      id: 'new-org-' + Date.now(),
      name: data.organizationName,
      subscriptionTier: data.subscriptionTier,
      subscriptionStatus: 'active',
      maxUsers: data.subscriptionTier === 'standard' ? 50 : 100,
      createdAt: new Date()
    };

    const newUser: TeamMember = {
      id: 'new-user-' + Date.now(),
      name: data.adminName,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      role: 'Administrator',
      organizationId: newOrganization.id,
      userRole: 'admin'
    };

    setCurrentOrganization(newOrganization);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setAuthRoute(null);
  };

  const handleAcceptInvite = async (token: string, password: string) => {
    // Mock invitation acceptance - in production, this would:
    // 1. Validate token
    // 2. Create user account with Supabase Auth
    // 3. Update invitation status
    // 4. Add user to organization
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, create a new user and log them in
    const newUser: TeamMember = {
      id: 'invited-user-' + Date.now(),
      name: 'New User',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      role: 'Team Member',
      organizationId: mockOrganization.id,
      userRole: 'member'
    };

    setCurrentUser(newUser);
    setCurrentOrganization(mockOrganization);
    setIsAuthenticated(true);
    setAuthRoute(null);
    setInviteToken(null);
  };

  const addObservation = (message: string, photos: string[], categoryId: string, location?: Location, subcategoryId?: string) => {
    if (!currentUser) return;
    const nextNumber = observations.length > 0 ? Math.max(...observations.map(o => o.number)) + 1 : 1;
    const newObservation: Observation = {
      id: Date.now().toString(),
      number: nextNumber,
      author: currentUser,
      message,
      photos,
      attachments: [],
      timestamp: new Date(),
      taskIds: [],
      categoryId,
      subcategoryId,
      location,
    };
    setObservations([...observations, newObservation]);
  };

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, name: string, color: string) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...c, name, color } : c
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    // Also delete all subcategories for this category
    setSubcategories(subcategories.filter(sc => sc.categoryId !== id));
  };

  const addSubcategory = (name: string, color: string, categoryId: string) => {
    const newSubcategory: Subcategory = {
      id: Date.now().toString(),
      name,
      color,
      categoryId,
    };
    setSubcategories([...subcategories, newSubcategory]);
  };

  const updateSubcategory = (id: string, name: string, color: string) => {
    setSubcategories(subcategories.map(sc =>
      sc.id === id ? { ...sc, name, color } : sc
    ));
  };

  const deleteSubcategory = (id: string) => {
    setSubcategories(subcategories.filter(sc => sc.id !== id));
  };

  const getSubcategoriesForCategory = (categoryId: string): Subcategory[] => {
    return subcategories.filter(sc => sc.categoryId === categoryId);
  };

  const addTeam = (name: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      memberIds: [],
    };
    setTeams([...teams, newTeam]);
  };

  const updateTeam = (id: string, name: string) => {
    setTeams(teams.map(t =>
      t.id === id ? { ...t, name } : t
    ));
  };

  const deleteTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const addMemberToTeam = (teamId: string, memberId: string) => {
    setTeams(teams.map(t =>
      t.id === teamId && !t.memberIds.includes(memberId)
        ? { ...t, memberIds: [...t.memberIds, memberId] }
        : t
    ));
  };

  const removeMemberFromTeam = (teamId: string, memberId: string) => {
    setTeams(teams.map(t =>
      t.id === teamId
        ? { ...t, memberIds: t.memberIds.filter(id => id !== memberId) }
        : t
    ));
  };

  const addTask = (
    title: string,
    description: string,
    photos: string[],
    categoryId: string,
    assignTo?: TeamMember,
    assignToTeamId?: string,
    assignToExternal?: string,
    location?: Location,
    subcategoryId?: string,
    startDate?: Date,
    endDate?: Date,
    isRecurring?: boolean,
    recurrencePattern?: RecurrencePattern
  ) => {
    // Validate external email if provided
    if (assignToExternal && !isValidEmail(assignToExternal)) {
      alert('Please enter a valid email address');
      return;
    }

    const nextNumber = tasks.length > 0 ? Math.max(...tasks.map(t => t.number)) + 1 : 1;
    const newTaskId = Date.now().toString();

    // Create a placeholder observation for tasks created directly
    const observationId = `obs-${newTaskId}`;
    const placeholderObservation: Observation = {
      id: observationId,
      number: observations.length + 1,
      author: currentUser,
      message: title,
      photos: photos,
      attachments: [],
      timestamp: new Date(),
      taskIds: [newTaskId],
      categoryId: categoryId,
      subcategoryId,
      location,
    };

    const newTask: Task = {
      id: newTaskId,
      number: nextNumber,
      observationId: observationId,
      title: title,
      description: description,
      assignedTo: assignTo || null,
      assignedToTeamId: assignToTeamId || null,
      assignedToExternal: assignToExternal || null,
      status: 'pending',
      photos: photos,
      attachments: [],
      createdBy: currentUser,
      createdAt: new Date(),
      categoryId: categoryId,
      subcategoryId,
      location,
      startDate,
      endDate,
      isRecurring: isRecurring || false,
      recurrencePattern,
    };

    setTasks([...tasks, newTask]);
    setObservations([...observations, placeholderObservation]);

    // Update external contacts if new external assignment
    if (assignToExternal) {
      const existingContact = externalContacts.find(c => c.email.toLowerCase() === assignToExternal.toLowerCase());
      if (existingContact) {
        // Update existing contact
        setExternalContacts(externalContacts.map(c =>
          c.id === existingContact.id
            ? { ...c, lastUsed: new Date(), usedCount: c.usedCount + 1 }
            : c
        ));
      } else {
        // Add new contact
        const newContact: ExternalContact = {
          id: Date.now().toString(),
          email: assignToExternal,
          lastUsed: new Date(),
          usedCount: 1,
        };
        setExternalContacts([...externalContacts, newContact]);
      }

      // TODO: Call Supabase Edge Function to send email
      sendTaskAssignmentEmail(newTask, assignToExternal);
    }
  };

  const convertToTask = (observationId: string, assignTo?: TeamMember, assignToTeamId?: string, assignToExternal?: string) => {
    const observation = observations.find(o => o.id === observationId);
    if (!observation) return;

    // Validate external email if provided
    if (assignToExternal && !isValidEmail(assignToExternal)) {
      alert('Please enter a valid email address');
      return;
    }

    const nextNumber = tasks.length > 0 ? Math.max(...tasks.map(t => t.number)) + 1 : 1;
    const newTaskId = Date.now().toString();

    // Ensure we have a valid categoryId - fallback to first category if missing
    const validCategoryId = observation.categoryId || (categories.length > 0 ? categories[0].id : '');

    const newTask: Task = {
      id: newTaskId,
      number: nextNumber,
      observationId: observation.id,
      title: observation.message.slice(0, 60) + (observation.message.length > 60 ? '...' : ''),
      description: observation.message,
      assignedTo: assignTo || null,
      assignedToTeamId: assignToTeamId || null,
      assignedToExternal: assignToExternal || null,
      status: 'pending',
      photos: observation.photos,
      attachments: [],
      createdBy: observation.author,
      createdAt: observation.timestamp,
      categoryId: validCategoryId,
    };

    setTasks([...tasks, newTask]);
    setObservations(observations.map(o =>
      o.id === observationId ? { ...o, taskIds: [...o.taskIds, newTaskId] } : o
    ));

    // Update external contacts if new external assignment
    if (assignToExternal) {
      const existingContact = externalContacts.find(c => c.email.toLowerCase() === assignToExternal.toLowerCase());
      if (existingContact) {
        // Update existing contact
        setExternalContacts(externalContacts.map(c =>
          c.id === existingContact.id
            ? { ...c, lastUsed: new Date(), usedCount: c.usedCount + 1 }
            : c
        ));
      } else {
        // Add new contact
        const newContact: ExternalContact = {
          id: Date.now().toString(),
          email: assignToExternal,
          lastUsed: new Date(),
          usedCount: 1,
        };
        setExternalContacts([...externalContacts, newContact]);
      }

      // TODO: Call Supabase Edge Function to send email
      sendTaskAssignmentEmail(newTask, assignToExternal);
    }
  };

  // Email template generator
  const generateTaskAssignmentEmailHTML = (task: Task, organizationName: string = 'Your Organization'): string => {
    const category = categories.find(c => c.id === task.categoryId);
    const categoryBadge = category
      ? `<span style="display: inline-block; padding: 4px 12px; background-color: ${category.color}20; color: ${category.color}; border-radius: 4px; font-size: 12px; font-weight: 600;">${category.name}</span>`
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2c3e72; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Task Assignment</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                You've been assigned a new task from <strong>${organizationName}</strong>
              </p>

              <!-- Task Details Card -->
              <div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 24px; background-color: #fffbeb;">
                <div style="margin-bottom: 12px;">
                  ${categoryBadge}
                </div>
                <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px; font-weight: 600;">${task.title}</h2>
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">${task.description}</p>
              </div>

              <!-- Metadata -->
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Assigned by:</td>
                  <td style="color: #111827; font-size: 14px;">${task.createdBy.name}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Created:</td>
                  <td style="color: #111827; font-size: 14px;">${task.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Status:</td>
                  <td style="color: #111827; font-size: 14px;">${task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                </tr>
              </table>

              ${task.photos.length > 0 ? `
              <!-- Photo -->
              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Attached Photo:</p>
                <img src="${task.photos[0]}" alt="Task photo" style="width: 100%; border-radius: 8px; display: block;" />
              </div>
              ` : ''}

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                This is an automated notification from ${organizationName}. Please contact the assigner if you have any questions about this task.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Generated with Claude Code Task Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  };

  // Placeholder for email sending - will be replaced with Supabase Edge Function call
  const sendTaskAssignmentEmail = (task: Task, recipientEmail: string) => {
    const emailHTML = generateTaskAssignmentEmailHTML(task);
    const emailSubject = `Task Assignment: ${task.title}`;

    console.log('📧 Sending task assignment email to:', recipientEmail);
    console.log('Subject:', emailSubject);
    console.log('HTML Preview:', emailHTML.substring(0, 200) + '...');

    // In production, this would call a Supabase Edge Function
    // Example:
    // await supabase.functions.invoke('send-task-assignment', {
    //   body: {
    //     to: recipientEmail,
    //     subject: emailSubject,
    //     html: emailHTML,
    //     task: { id: task.id, title: task.title, number: task.number }
    //   }
    // })
  };

  const claimTask = (taskId: string, userId: string) => {
    const user = mockTeam.find(m => m.id === userId);
    if (!user) return;

    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, assignedTo: user } : t
    ));
  };

  const unclaimTask = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, assignedTo: null } : t
    ));
  };

  const addMessage = (content: string, taskId?: string, observationId?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      status: 'sent',
      taskId,
      observationId,
    };
    setMessages([...messages, newMessage]);

    // Simulate delivery after a short delay
    setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === newMessage.id ? { ...m, status: 'delivered' } : m
      ));
    }, 500);
  };

  const markMessagesAsRead = (messageIds: string[]) => {
    setMessages(messages.map(m =>
      messageIds.includes(m.id) && m.status !== 'read' ? { ...m, status: 'read' } : m
    ));
  };

  const updateTaskAssignment = (taskId: string, member: TeamMember | null) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, assignedTo: member } : t
    ));
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status } : t
    ));
  };

  const addAttachmentToTask = (taskId: string, file: File) => {
    // Validate file type based on organization subscription
    const fileType = file.type.startsWith('image/') ? 'image' :
                     file.type.startsWith('video/') ? 'video' : 'document';

    if (fileType === 'video' && currentOrganization.subscriptionTier !== 'premium') {
      alert('Video uploads require a premium subscription');
      return;
    }

    // Simulate file upload - in production, this would upload to Supabase Storage
    const newAttachment: Attachment = {
      id: Date.now().toString(),
      type: fileType,
      url: URL.createObjectURL(file), // Temporary URL for demo
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: currentUser,
    };

    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, attachments: [...t.attachments, newAttachment] } : t
    ));
  };

  const addAttachmentToObservation = (observationId: string, file: File) => {
    // Validate file type based on organization subscription
    const fileType = file.type.startsWith('image/') ? 'image' :
                     file.type.startsWith('video/') ? 'video' : 'document';

    if (fileType === 'video' && currentOrganization.subscriptionTier !== 'premium') {
      alert('Video uploads require a premium subscription');
      return;
    }

    // Simulate file upload
    const newAttachment: Attachment = {
      id: Date.now().toString(),
      type: fileType,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: currentUser,
    };

    setObservations(observations.map(o =>
      o.id === observationId ? { ...o, attachments: [...o.attachments, newAttachment] } : o
    ));
  };

  const removeAttachmentFromTask = (taskId: string, attachmentId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, attachments: t.attachments.filter(a => a.id !== attachmentId) } : t
    ));
  };

  const removeAttachmentFromObservation = (observationId: string, attachmentId: string) => {
    setObservations(observations.map(o =>
      o.id === observationId ? { ...o, attachments: o.attachments.filter(a => a.id !== attachmentId) } : o
    ));
  };

  // Invitation management functions
  const createInvitation = (email: string, name: string, role: 'admin' | 'member') => {
    if (!currentUser || !currentOrganization) return;

    // Validate admin permission
    if (currentUser.userRole !== 'admin') {
      alert('Only admins can invite users');
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if already invited or is existing user
    const alreadyInvited = invitations.some(inv =>
      inv.email.toLowerCase() === email.toLowerCase() && inv.status === 'pending'
    );
    if (alreadyInvited) {
      alert('This email address already has a pending invitation');
      return;
    }

    const isExistingUser = mockTeam.some(member =>
      member.id !== currentUser.id && // Exclude checking against current user
      member.organizationId === currentOrganization.id
    );
    // Note: In production, this would check if email exists in users table for this org

    const newInvitation: Invitation = {
      id: Date.now().toString(),
      organizationId: currentOrganization.id,
      email: email,
      name: name,
      role: role,
      invitedBy: currentUser.id,
      token: crypto.randomUUID(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date()
    };

    setInvitations([...invitations, newInvitation]);

    // TODO: Call Supabase Edge Function to send invitation email
    sendInvitationEmail(newInvitation);
  };

  const resendInvitation = (invitationId: string) => {
    if (!currentUser) return;

    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation) return;

    if (currentUser.userRole !== 'admin') {
      alert('Only admins can resend invitations');
      return;
    }

    // Update expiration date
    setInvitations(invitations.map(inv =>
      inv.id === invitationId
        ? { ...inv, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        : inv
    ));

    // Resend email
    sendInvitationEmail(invitation);
  };

  const cancelInvitation = (invitationId: string) => {
    if (!currentUser) return;

    if (currentUser.userRole !== 'admin') {
      alert('Only admins can cancel invitations');
      return;
    }

    setInvitations(invitations.map(inv =>
      inv.id === invitationId ? { ...inv, status: 'cancelled' } : inv
    ));
  };

  const removeUser = (userId: string) => {
    if (!currentUser) return;

    if (currentUser.userRole !== 'admin') {
      alert('Only admins can remove users');
      return;
    }

    if (userId === currentUser.id) {
      alert('You cannot remove yourself');
      return;
    }

    if (confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      // In production, this would delete the user and cascade to all related data
      console.log('Removing user:', userId);
      // TODO: Call Supabase to delete user
    }
  };

  // Invitation email template generator
  const generateInvitationEmailHTML = (invitation: Invitation, inviterName: string, organizationName: string): string => {
    const acceptUrl = `https://yourapp.com/accept-invite?token=${invitation.token}`;
    const roleLabel = invitation.role === 'admin' ? 'Administrator' : 'Member';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to join ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2c3e72; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">You're Invited!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                Hi <strong>${invitation.name}</strong>,
              </p>

              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on TaskFlow as a <strong>${roleLabel}</strong>.
              </p>

              <!-- Invitation Details Card -->
              <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 24px; background-color: #eff6ff;">
                <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">Invitation Details</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Organization:</td>
                    <td style="color: #111827; font-size: 14px;">${organizationName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Role:</td>
                    <td style="color: #111827; font-size: 14px;">${roleLabel}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Invited by:</td>
                    <td style="color: #111827; font-size: 14px;">${inviterName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Expires:</td>
                    <td style="color: #111827; font-size: 14px;">${invitation.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                </table>
              </div>

              <!-- Accept Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${acceptUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>

              <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                If the button above doesn't work, copy and paste this link into your browser:<br/>
                <a href="${acceptUrl}" style="color: #3b82f6; word-break: break-all;">${acceptUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Generated with Claude Code Task Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  };

  // Placeholder for invitation email sending
  const sendInvitationEmail = (invitation: Invitation) => {
    if (!currentOrganization) return;

    const inviter = mockTeam.find(m => m.id === invitation.invitedBy);
    const inviterName = inviter ? inviter.name : 'An administrator';
    const emailHTML = generateInvitationEmailHTML(invitation, inviterName, currentOrganization.name);
    const emailSubject = `You're invited to join ${currentOrganization.name} on TaskFlow`;

    console.log('📧 Sending invitation email to:', invitation.email);
    console.log('Subject:', emailSubject);
    console.log('Invitation link:', `https://yourapp.com/accept-invite?token=${invitation.token}`);
    console.log('HTML Preview:', emailHTML.substring(0, 200) + '...');

    // In production, this would call a Supabase Edge Function
    // Example:
    // await supabase.functions.invoke('send-invitation', {
    //   body: {
    //     to: invitation.email,
    //     subject: emailSubject,
    //     html: emailHTML,
    //     invitation: { id: invitation.id, token: invitation.token }
    //   }
    // })
  };

  // Early return for auth screens if not authenticated
  if (!isAuthenticated) {
    // Desktop auth screens
    if (platform === 'desktop') {
      if (authRoute === 'landing') {
        return (
          <div className="size-full">
            <AppSelector currentPlatform={platform} onSelect={setPlatform} />
            <DesktopLanding
              onNavigateToSignup={() => setAuthRoute('signup')}
              onNavigateToLogin={() => setAuthRoute('login')}
            />
          </div>
        );
      }

      if (authRoute === 'login') {
        return (
          <div className="size-full">
            <AppSelector currentPlatform={platform} onSelect={setPlatform} />
            <DesktopLogin
              onLogin={handleLogin}
              onNavigateToSignup={() => setAuthRoute('signup')}
              onNavigateToLanding={() => setAuthRoute('landing')}
            />
          </div>
        );
      }

      if (authRoute === 'signup') {
        return (
          <div className="size-full">
            <AppSelector currentPlatform={platform} onSelect={setPlatform} />
            <DesktopSignup
              onSignup={handleSignup}
              onNavigateToLogin={() => setAuthRoute('login')}
              onNavigateToLanding={() => setAuthRoute('landing')}
            />
          </div>
        );
      }

      if (authRoute === 'accept-invite' && inviteToken) {
        return (
          <div className="size-full">
            <AppSelector currentPlatform={platform} onSelect={setPlatform} />
            <AcceptInvitation
              token={inviteToken}
              onAccept={handleAcceptInvite}
              platform="desktop"
            />
          </div>
        );
      }
    }

    // Mobile auth screens
    if (platform === 'mobile') {
      if (authRoute === 'landing') {
        return (
          <div className="size-full flex items-center justify-center">
            <AppSelector currentPlatform={platform} onSelect={setPlatform} />
            <MobileLanding
              onNavigateToLogin={() => setAuthRoute('login')}
            />
          </div>
        );
      }

      if (authRoute === 'login') {
        return (
          <div className="size-full flex items-center justify-center">
            <AppSelector currentPlatform={platform} onSelect={setPlatform} />
            <MobileLogin
              onLogin={handleLogin}
              onNavigateToLanding={() => setAuthRoute('landing')}
            />
          </div>
        );
      }

      if (authRoute === 'accept-invite' && inviteToken) {
        return (
          <div className="size-full flex items-center justify-center">
            <AppSelector currentPlatform={platform} onSelect={setPlatform} />
            <AcceptInvitation
              token={inviteToken}
              onAccept={handleAcceptInvite}
              platform="mobile"
            />
          </div>
        );
      }
    }

    // Fallback to landing if no auth route matches
    return (
      <div className={`size-full ${platform === 'mobile' ? 'flex items-center justify-center' : ''}`}>
        <AppSelector currentPlatform={platform} onSelect={setPlatform} />
        {platform === 'desktop' ? (
          <DesktopLanding
            onNavigateToSignup={() => setAuthRoute('signup')}
            onNavigateToLogin={() => setAuthRoute('login')}
          />
        ) : (
          <MobileLanding
            onNavigateToLogin={() => setAuthRoute('login')}
          />
        )}
      </div>
    );
  }

  // Main app (authenticated)
  if (!currentUser || !currentOrganization) {
    return <div className="size-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#e8e6d5' }}>
      <AppSelector currentPlatform={platform} onSelect={setPlatform} />

      {platform === 'desktop' ? (
        <div className="size-full flex" style={{ backgroundColor: '#f5f5dc' }}>
          <TeamSidebar
            team={mockTeam}
            currentUser={currentUser}
            currentView={currentView}
            onViewChange={setCurrentView}
          />

          <div className="flex-1 flex">
            {currentView === 'dashboard' && (
              <ChatPanel
                observations={observations}
                currentUser={currentUser}
                team={mockTeam}
                teams={teams}
                tasks={tasks}
                categories={categories}
                subcategories={subcategories}
                messages={messages}
                externalContacts={externalContacts}
                onAddObservation={addObservation}
                onConvertToTask={convertToTask}
                onUpdateTaskStatus={updateTaskStatus}
                onSendMessage={addMessage}
                onMarkMessagesAsRead={markMessagesAsRead}
                onAddTaskAttachment={addAttachmentToTask}
                onRemoveTaskAttachment={removeAttachmentFromTask}
                onAddObservationAttachment={addAttachmentToObservation}
                onRemoveObservationAttachment={removeAttachmentFromObservation}
              />
            )}

            {currentView === 'tasks' && (
              <TaskPanel
                tasks={tasks}
                team={mockTeam}
                teams={teams}
                categories={categories}
                subcategories={subcategories}
                messages={messages}
                currentUser={currentUser}
                onAddTask={addTask}
                onUpdateAssignment={updateTaskAssignment}
                onUpdateStatus={updateTaskStatus}
                onSendMessage={addMessage}
                onMarkMessagesAsRead={markMessagesAsRead}
                onAddAttachment={addAttachmentToTask}
                onRemoveAttachment={removeAttachmentFromTask}
              />
            )}

            {currentView === 'observations' && (
              <ChatPanel
                observations={observations}
                currentUser={currentUser}
                team={mockTeam}
                teams={teams}
                tasks={tasks}
                categories={categories}
                subcategories={subcategories}
                messages={messages}
                externalContacts={externalContacts}
                onAddObservation={addObservation}
                onConvertToTask={convertToTask}
                onUpdateTaskStatus={updateTaskStatus}
                onSendMessage={addMessage}
                onMarkMessagesAsRead={markMessagesAsRead}
                onAddTaskAttachment={addAttachmentToTask}
                onRemoveTaskAttachment={removeAttachmentFromTask}
                onAddObservationAttachment={addAttachmentToObservation}
                onRemoveObservationAttachment={removeAttachmentFromObservation}
                observationsOnly
              />
            )}

            {currentView === 'categories' && (
              <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-neutral-900">Categories</h2>
                  </div>
                  <button
                    onClick={() => setShowEmailPreview(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <span>📧</span>
                    <span>Preview Email Template</span>
                  </button>
                </div>
                <div className="max-w-2xl">
                  <p className="text-neutral-600 mb-6">Define categories for organizing tasks and observations. Each category has a name and color.</p>

                  <div className="space-y-3 mb-6">
                    {categories.map(category => {
                      const isEditing = editingCategoryId === category.id;
                      const isExpanded = expandedCategoryId === category.id;
                      const categorySubcategories = getSubcategoriesForCategory(category.id);

                      return (
                        <div key={category.id} className="bg-white border border-neutral-200 rounded-lg">
                          <div className="flex items-center gap-3 p-4">
                            {isEditing ? (
                              <>
                                <input
                                  type="color"
                                  value={category.color}
                                  onChange={(e) => updateCategory(category.id, category.name, e.target.value)}
                                  className="size-8 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategory(category.id, e.target.value, category.color)}
                                  className="flex-1 px-3 py-1.5 border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => setEditingCategoryId(null)}
                                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  Done
                                </button>
                              </>
                            ) : (
                              <>
                                <div
                                  className="size-8 rounded border border-neutral-300"
                                  style={{ backgroundColor: category.color }}
                                />
                                <div className="flex-1 px-3 py-1.5 text-neutral-900">
                                  {category.name}
                                </div>
                                <button
                                  onClick={() => setExpandedCategoryId(isExpanded ? null : category.id)}
                                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  {isExpanded ? '▼' : '▶'} Subcategories ({categorySubcategories.length})
                                </button>
                                <button
                                  onClick={() => setEditingCategoryId(category.id)}
                                  className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete category "${category.name}"?`)) {
                                      deleteCategory(category.id);
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="border-t border-neutral-200 p-4 bg-neutral-50">
                              <div className="space-y-2 mb-3">
                                {categorySubcategories.length === 0 ? (
                                  <p className="text-sm text-neutral-500 italic">No subcategories defined</p>
                                ) : (
                                  categorySubcategories.map(subcategory => {
                                    const isEditingSubcategory = editingSubcategoryId === subcategory.id;
                                    return (
                                      <div key={subcategory.id} className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded">
                                        {isEditingSubcategory ? (
                                          <>
                                            <div className="w-8" /> {/* Spacer for alignment */}
                                            <input
                                              type="color"
                                              value={subcategory.color}
                                              onChange={(e) => updateSubcategory(subcategory.id, subcategory.name, e.target.value)}
                                              className="size-8 rounded cursor-pointer"
                                            />
                                            <input
                                              type="text"
                                              value={subcategory.name}
                                              onChange={(e) => updateSubcategory(subcategory.id, e.target.value, subcategory.color)}
                                              className="flex-1 px-3 py-1.5 border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                              onClick={() => setEditingSubcategoryId(null)}
                                              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                              Done
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <div className="w-8 text-center text-neutral-400">└─</div>
                                            <div
                                              className="size-6 rounded border border-neutral-300"
                                              style={{ backgroundColor: subcategory.color }}
                                            />
                                            <div className="flex-1 px-3 py-1.5 text-neutral-900">
                                              {subcategory.name}
                                            </div>
                                            <button
                                              onClick={() => setEditingSubcategoryId(subcategory.id)}
                                              className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (confirm(`Delete subcategory "${subcategory.name}"?`)) {
                                                  deleteSubcategory(subcategory.id);
                                                }
                                              }}
                                              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                              Delete
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  const name = prompt('Subcategory name:');
                                  if (name) {
                                    const color = prompt('Subcategory color (hex):', category.color);
                                    if (color) addSubcategory(name, color, category.id);
                                  }
                                }}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                + Add Subcategory
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      const name = prompt('Category name:');
                      const color = prompt('Category color (hex):', '#7c8ba8');
                      if (name && color) addCategory(name, color);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            )}

            {currentView === 'team' && (
              <div className="flex-1 p-8">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Team Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                  {mockTeam.map(member => {
                    const memberTasks = tasks.filter(t => t.assignedTo?.id === member.id);
                    const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
                    const inProgressTasks = memberTasks.filter(t => t.status === 'in-progress').length;

                    return (
                      <div key={member.id} className="bg-white rounded-xl p-6 border border-neutral-200">
                        <div className="flex items-start gap-4">
                          <img src={member.avatar} alt={member.name} className="size-16 rounded-full object-cover" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900">{member.name}</h3>
                            <p className="text-sm text-neutral-500 mb-3">{member.role}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Active tasks</span>
                                <span className="font-medium">{inProgressTasks}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Completed</span>
                                <span className="font-medium">{completedTasks}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentView === 'teams' && (
              <Teams
                teams={teams}
                allMembers={mockTeam}
                onAddTeam={addTeam}
                onUpdateTeam={updateTeam}
                onDeleteTeam={deleteTeam}
                onAddMember={addMemberToTeam}
                onRemoveMember={removeMemberFromTeam}
              />
            )}

            {currentView === 'chat' && (
              <GlobalChatPanel
                messages={messages}
                team={mockTeam}
                currentUser={currentUser}
                onSendMessage={(content) => addMessage(content)}
                onMarkMessagesAsRead={markMessagesAsRead}
              />
            )}

            {currentView === 'users' && (
              <Users
                team={mockTeam}
                invitations={invitations}
                currentUser={currentUser}
                onInviteUser={createInvitation}
                onResendInvitation={resendInvitation}
                onCancelInvitation={cancelInvitation}
                onRemoveUser={removeUser}
              />
            )}
          </div>
        </div>
      ) : (
        <MobileApp
          observations={observations}
          tasks={tasks}
          team={mockTeam}
          teams={teams}
          categories={categories}
          subcategories={subcategories}
          messages={messages}
          currentUser={currentUser}
          onAddObservation={addObservation}
          onAddTask={addTask}
          onConvertToTask={convertToTask}
          onClaimTask={claimTask}
          onUnclaimTask={unclaimTask}
          onSendMessage={addMessage}
          onMarkMessagesAsRead={markMessagesAsRead}
          onAddTaskAttachment={addAttachmentToTask}
          onRemoveTaskAttachment={removeAttachmentFromTask}
          onAddObservationAttachment={addAttachmentToObservation}
          onRemoveObservationAttachment={removeAttachmentFromObservation}
        />
      )}

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <EmailPreview onClose={() => setShowEmailPreview(false)} />
      )}
    </div>
  );
}
