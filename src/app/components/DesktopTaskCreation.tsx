import { useState, useRef } from 'react';
import { X, Camera, Users, Mail } from 'lucide-react';
import type { TeamMember, Category, Team, Location, Subcategory, RecurrencePattern, Observation } from '../App';
import { DesktopLocationPicker } from './DesktopLocationPicker';

interface DesktopTaskCreationProps {
  team: TeamMember[];
  teams: Team[];
  categories: Category[];
  subcategories: Subcategory[];
  currentUser: TeamMember;
  sourceObservation?: Observation;
  onClose: () => void;
  onCreateTask: (
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
  ) => void;
}

type AssignmentType = 'person' | 'team' | 'external' | 'unassigned';

export function DesktopTaskCreation({
  team,
  teams,
  categories,
  subcategories,
  currentUser,
  sourceObservation,
  onClose,
  onCreateTask,
}: DesktopTaskCreationProps) {
  // Pre-populate from observation if provided
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(sourceObservation?.message || '');
  const [photos, setPhotos] = useState<string[]>(sourceObservation?.photos || []);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    sourceObservation
      ? categories.find(c => c.id === sourceObservation.categoryId) || (categories.length > 0 ? categories[0] : null)
      : (categories.length > 0 ? categories[0] : null)
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(
    sourceObservation && sourceObservation.subcategoryId
      ? subcategories.find(sc => sc.id === sourceObservation.subcategoryId) || null
      : null
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(sourceObservation?.location || null);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('person');
  const [selectedPerson, setSelectedPerson] = useState<TeamMember | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [externalEmail, setExternalEmail] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndType, setRecurrenceEndType] = useState<'never' | 'after' | 'on'>('never');
  const [recurrenceEndAfter, setRecurrenceEndAfter] = useState(10);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPhotos(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const getCategorySubcategories = (categoryId: string): Subcategory[] => {
    return subcategories.filter(sc => sc.categoryId === categoryId);
  };

  const canCreate = () => {
    if (!title.trim() || !selectedCategory) return false;

    // If category has subcategories, one must be selected
    const categorySubcategories = getCategorySubcategories(selectedCategory.id);
    if (categorySubcategories.length > 0 && !selectedSubcategory) return false;

    if (assignmentType === 'person' && !selectedPerson) return false;
    if (assignmentType === 'team' && !selectedTeam) return false;
    if (assignmentType === 'external' && (!externalEmail.trim() || !externalEmail.includes('@'))) return false;
    return true;
  };

  const handleCreate = () => {
    if (!canCreate() || !selectedCategory) return;

    const recurrencePattern: RecurrencePattern | undefined = isRecurring ? {
      type: recurrenceType,
      interval: recurrenceInterval,
      endType: recurrenceEndType,
      endAfterOccurrences: recurrenceEndType === 'after' ? recurrenceEndAfter : undefined,
      endDate: recurrenceEndType === 'on' ? recurrenceEndDate || undefined : undefined,
    } : undefined;

    onCreateTask(
      title,
      description,
      photos,
      selectedCategory.id,
      assignmentType === 'person' ? selectedPerson || undefined : undefined,
      assignmentType === 'team' ? selectedTeam?.id : undefined,
      assignmentType === 'external' ? externalEmail : undefined,
      selectedLocation || undefined,
      selectedSubcategory?.id,
      startDate || undefined,
      endDate || undefined,
      isRecurring,
      recurrencePattern
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{ border: '1px solid #d4d0b8' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #d4d0b8' }}>
          <h2 className="text-2xl font-semibold" style={{ color: '#1f2a4e' }}>Create New Task</h2>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <X className="size-5" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Task Details Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2a4e' }}>Task Details</h3>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title *"
              className="w-full p-3 rounded-lg mb-3"
              style={{ border: '1px solid #d4d0b8' }}
              autoFocus
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full p-3 rounded-lg resize-none"
              style={{ border: '1px solid #d4d0b8' }}
              rows={4}
            />
          </div>

          {/* Photos Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2a4e' }}>Photos</h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-neutral-50"
              style={{ border: '2px dashed #d4d0b8', color: '#6b7280' }}
            >
              <Camera className="size-5" />
              <span>Add Photos</span>
            </button>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={photo} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 size-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2a4e' }}>Category *</h3>

            <select
              value={selectedCategory ? selectedCategory.id : ''}
              onChange={(e) => {
                const cat = categories.find(c => c.id === e.target.value);
                setSelectedCategory(cat || null);
                setSelectedSubcategory(null); // Clear subcategory when category changes
              }}
              className="w-full p-3 rounded-lg"
              style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Section (conditional) */}
          {selectedCategory && getCategorySubcategories(selectedCategory.id).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2a4e' }}>Subcategory *</h3>

              <select
                value={selectedSubcategory ? selectedSubcategory.id : ''}
                onChange={(e) => {
                  const subcat = subcategories.find(sc => sc.id === e.target.value);
                  setSelectedSubcategory(subcat || null);
                }}
                className="w-full p-3 rounded-lg"
                style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
              >
                <option value="">Select a subcategory...</option>
                {getCategorySubcategories(selectedCategory.id).map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Location Section */}
          <div className="mb-6">
            <DesktopLocationPicker
              location={selectedLocation}
              onChange={setSelectedLocation}
            />
          </div>

          {/* Dates & Recurrence Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2a4e' }}>Dates & Recurrence</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full p-2 rounded-lg text-sm"
                  style={{ border: '1px solid #d4d0b8' }}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  min={startDate ? startDate.toISOString().split('T')[0] : undefined}
                  className="w-full p-2 rounded-lg text-sm"
                  style={{ border: '1px solid #d4d0b8' }}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="size-4"
                />
                <span className="text-sm text-neutral-700">Make this a recurring task</span>
              </label>
            </div>

            {isRecurring && (
              <div className="bg-purple-50 p-4 rounded-lg space-y-3 border-2 border-purple-200">
                <div className="text-sm font-medium text-purple-900 mb-2">Recurrence Settings</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Every</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                      className="w-full p-2 rounded text-sm bg-white"
                      style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Period</label>
                    <select
                      value={recurrenceType}
                      onChange={(e) => setRecurrenceType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                      className="w-full p-2 rounded text-sm bg-white"
                      style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
                    >
                      <option value="daily">Day(s)</option>
                      <option value="weekly">Week(s)</option>
                      <option value="monthly">Month(s)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Ends</label>
                  <select
                    value={recurrenceEndType}
                    onChange={(e) => setRecurrenceEndType(e.target.value as 'never' | 'after' | 'on')}
                    className="w-full p-2 rounded text-sm mb-2 bg-white"
                    style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
                  >
                    <option value="never">Never</option>
                    <option value="after">After number of occurrences</option>
                    <option value="on">On specific date</option>
                  </select>

                  {recurrenceEndType === 'after' && (
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={recurrenceEndAfter}
                      onChange={(e) => setRecurrenceEndAfter(Number(e.target.value))}
                      placeholder="Number of occurrences"
                      className="w-full p-2 rounded text-sm bg-white"
                      style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
                    />
                  )}

                  {recurrenceEndType === 'on' && (
                    <input
                      type="date"
                      value={recurrenceEndDate ? recurrenceEndDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setRecurrenceEndDate(e.target.value ? new Date(e.target.value) : null)}
                      className="w-full p-2 rounded text-sm bg-white"
                      style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assignment Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2a4e' }}>Assignment</h3>

            {/* Assignment Type Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAssignmentType('person')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: assignmentType === 'person' ? '#4dd0e1' : '#FFFFF0',
                  color: assignmentType === 'person' ? 'white' : '#6b7280'
                }}
              >
                Individual
              </button>
              <button
                onClick={() => setAssignmentType('team')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: assignmentType === 'team' ? '#9c88ff' : '#FFFFF0',
                  color: assignmentType === 'team' ? 'white' : '#6b7280'
                }}
              >
                Team
              </button>
              <button
                onClick={() => setAssignmentType('external')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: assignmentType === 'external' ? '#f59e0b' : '#FFFFF0',
                  color: assignmentType === 'external' ? 'white' : '#6b7280'
                }}
              >
                External
              </button>
              <button
                onClick={() => setAssignmentType('unassigned')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: assignmentType === 'unassigned' ? '#6b7280' : '#FFFFF0',
                  color: assignmentType === 'unassigned' ? 'white' : '#6b7280'
                }}
              >
                Unassigned
              </button>
            </div>

            {/* Assignment Content */}
            {assignmentType === 'person' && (
              <select
                value={selectedPerson ? selectedPerson.id : ''}
                onChange={(e) => {
                  const person = team.find(m => m.id === e.target.value);
                  setSelectedPerson(person || null);
                }}
                className="w-full p-3 rounded-lg"
                style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
              >
                <option value="">Select a team member...</option>
                {team.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            )}

            {assignmentType === 'team' && (
              <select
                value={selectedTeam ? selectedTeam.id : ''}
                onChange={(e) => {
                  const t = teams.find(tm => tm.id === e.target.value);
                  setSelectedTeam(t || null);
                }}
                className="w-full p-3 rounded-lg"
                style={{ border: '1px solid #d4d0b8', color: '#1f2a4e' }}
              >
                <option value="">Select a team...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.memberIds.length} members)
                  </option>
                ))}
              </select>
            )}

            {assignmentType === 'external' && (
              <div>
                <input
                  type="email"
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                  placeholder="contractor@example.com"
                  className="w-full p-3 rounded-lg"
                  style={{ border: '1px solid #d4d0b8' }}
                />
                <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                  External contacts will receive task notifications via email
                </p>
              </div>
            )}

            {assignmentType === 'unassigned' && (
              <div className="text-center py-6 rounded-lg" style={{ backgroundColor: '#FFFFF0' }}>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  Task will be available for team members to claim
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6" style={{ borderTop: '1px solid #d4d0b8' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-colors hover:bg-neutral-100"
            style={{ color: '#6b7280' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate()}
            className="px-6 py-2 rounded-lg font-medium text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#4dd0e1' }}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
