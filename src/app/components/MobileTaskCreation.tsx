import { useState, useRef } from 'react';
import { ArrowLeft, Camera, Check, Users, Mail, Calendar, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TeamMember, Category, Team, Location, Subcategory, RecurrencePattern } from '../App';
import { MobileLocationPicker } from './MobileLocationPicker';

interface MobileTaskCreationProps {
  team: TeamMember[];
  teams: Team[];
  categories: Category[];
  subcategories: Subcategory[];
  currentUser: TeamMember;
  onBack: () => void;
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
    recurrencePattern?: RecurrencePattern
  ) => void;
}

type Step = 'details' | 'category' | 'subcategory' | 'location' | 'dates' | 'assignment';
type AssignmentType = 'person' | 'team' | 'external' | 'unassigned';

export function MobileTaskCreation({
  team,
  teams,
  categories,
  subcategories,
  currentUser,
  onBack,
  onCreateTask,
}: MobileTaskCreationProps) {
  const [step, setStep] = useState<Step>('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('person');
  const [selectedPerson, setSelectedPerson] = useState<TeamMember | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [externalEmail, setExternalEmail] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndType, setRecurrenceEndType] = useState<'never' | 'after' | 'on'>('never');
  const [recurrenceEndAfter, setRecurrenceEndAfter] = useState(10);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTeamMembers = team.filter(member =>
    member.name.toLowerCase().includes(personSearch.toLowerCase())
  );

  const getCategorySubcategories = (categoryId: string): Subcategory[] => {
    return subcategories.filter(sc => sc.categoryId === categoryId);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos([...photos, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const canProceedFromDetails = title.trim().length > 0;
  const canProceedFromCategory = selectedCategory !== null;
  const canCreateTask = () => {
    if (assignmentType === 'person') return selectedPerson !== null;
    if (assignmentType === 'team') return selectedTeam !== null;
    if (assignmentType === 'external') return externalEmail.trim().length > 0 && externalEmail.includes('@');
    return true; // unassigned
  };

  const handleCreate = () => {
    if (!selectedCategory) return;

    let recurrencePattern: RecurrencePattern | undefined = undefined;
    if (isRecurring) {
      recurrencePattern = {
        type: recurrenceType,
        interval: recurrenceInterval,
        endType: recurrenceEndType,
        endAfterOccurrences: recurrenceEndType === 'after' ? recurrenceEndAfter : undefined,
        endDate: recurrenceEndType === 'on' ? recurrenceEndDate || undefined : undefined,
      };
    }

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
      recurrencePattern
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute inset-0 bg-white z-[100] flex flex-col"
      style={{ borderRadius: '32px' }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-700">
          <ArrowLeft className="size-5" />
          <span>Cancel</span>
        </button>
        <span className="font-medium" style={{ color: '#1f2a4e' }}>New Task</span>
        <div className="w-16" />
      </div>

      {/* Progress Indicator */}
      <div className="flex px-4 py-3 gap-2">
        <div className={`flex-1 h-1 rounded-full ${step === 'details' ? 'bg-[#4dd0e1]' : 'bg-neutral-200'}`} />
        <div className={`flex-1 h-1 rounded-full ${step === 'category' ? 'bg-[#4dd0e1]' : 'bg-neutral-200'}`} />
        {selectedCategory && getCategorySubcategories(selectedCategory.id).length > 0 && (
          <div className={`flex-1 h-1 rounded-full ${step === 'subcategory' ? 'bg-[#4dd0e1]' : 'bg-neutral-200'}`} />
        )}
        <div className={`flex-1 h-1 rounded-full ${step === 'location' ? 'bg-[#4dd0e1]' : 'bg-neutral-200'}`} />
        <div className={`flex-1 h-1 rounded-full ${step === 'dates' ? 'bg-[#4dd0e1]' : 'bg-neutral-200'}`} />
        <div className={`flex-1 h-1 rounded-full ${step === 'assignment' ? 'bg-[#4dd0e1]' : 'bg-neutral-200'}`} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Task Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#1f2a4e' }}>Task Details</h2>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title *"
                className="w-full p-3 border border-neutral-200 rounded-xl mb-3"
                autoFocus
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full p-3 border border-neutral-200 rounded-xl resize-none mb-3"
                rows={4}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center gap-2 text-neutral-600 mb-3"
              >
                <Camera className="size-5" />
                <span>Add Photo</span>
              </button>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                      <img src={photo} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 size-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200">
              <button
                onClick={() => setStep('category')}
                disabled={!canProceedFromDetails}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4dd0e1', color: 'white' }}
              >
                Next: Choose Category
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Category Selection */}
        {step === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#1f2a4e' }}>Select Category</h2>

              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedCategory?.id === category.id
                        ? 'border-[#4dd0e1] bg-[#4dd0e1]/10'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <div className="size-6 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="font-medium" style={{ color: '#1f2a4e' }}>{category.name}</span>
                    {selectedCategory?.id === category.id && (
                      <Check className="size-5 ml-auto" style={{ color: '#4dd0e1' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => setStep('details')}
                className="flex-1 py-3 border border-neutral-300 rounded-xl font-medium"
                style={{ color: '#6b7280' }}
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!selectedCategory) return;
                  const categorySubcategories = getCategorySubcategories(selectedCategory.id);
                  if (categorySubcategories.length > 0) {
                    setStep('subcategory');
                  } else {
                    setSelectedSubcategory(null);
                    setStep('location');
                  }
                }}
                disabled={!canProceedFromCategory}
                className="flex-1 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4dd0e1', color: 'white' }}
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Subcategory (conditional) */}
        {step === 'subcategory' && selectedCategory && (
          <motion.div
            key="subcategory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#1f2a4e' }}>Select Subcategory</h2>
              <p className="text-sm text-neutral-600 mb-4">for {selectedCategory.name}</p>

              <div className="space-y-2">
                {getCategorySubcategories(selectedCategory.id).map(subcategory => (
                  <button
                    key={subcategory.id}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedSubcategory?.id === subcategory.id
                        ? 'border-[#4dd0e1] bg-[#4dd0e1]/10'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <span className="font-medium" style={{ color: '#1f2a4e' }}>{subcategory.name}</span>
                    {selectedSubcategory?.id === subcategory.id && (
                      <Check className="size-5 ml-auto" style={{ color: '#4dd0e1' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => setStep('category')}
                className="flex-1 py-3 border border-neutral-300 rounded-xl font-medium"
                style={{ color: '#6b7280' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep('location')}
                disabled={!selectedSubcategory}
                className="flex-1 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4dd0e1', color: 'white' }}
              >
                Next: Location
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Location */}
        {step === 'location' && (
          <MobileLocationPicker
            key="location"
            onBack={() => {
              if (selectedCategory) {
                const categorySubcategories = getCategorySubcategories(selectedCategory.id);
                if (categorySubcategories.length > 0) {
                  setStep('subcategory');
                } else {
                  setStep('category');
                }
              } else {
                setStep('category');
              }
            }}
            onConfirm={(location) => {
              setSelectedLocation(location);
              setStep('dates');
            }}
            initialLocation={selectedLocation || undefined}
          />
        )}

        {/* Step 5: Dates & Recurrence */}
        {step === 'dates' && (
          <motion.div
            key="dates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#1f2a4e' }}>Dates & Recurrence</h2>

              {/* Date pickers - Using native mobile date picker */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1f2a4e' }}>
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate ? startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                    className="w-full p-3 border border-neutral-200 rounded-xl text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1f2a4e' }}>
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate ? endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                    min={startDate ? startDate.toISOString().split('T')[0] : undefined}
                    className="w-full p-3 border border-neutral-200 rounded-xl text-base"
                  />
                </div>
              </div>

              {/* Recurring checkbox */}
              <div className="mb-4">
                <label className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="size-5"
                  />
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: '#1f2a4e' }}>Make this a recurring task</div>
                    <div className="text-xs text-neutral-500">Automatically create new tasks on a schedule</div>
                  </div>
                  <Repeat className="size-5 text-neutral-400" />
                </label>
              </div>

              {/* Recurrence options */}
              {isRecurring && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="text-sm font-semibold text-purple-900 mb-2">Recurrence Settings</div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1f2a4e' }}>
                      Repeat Every
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 p-3 border border-neutral-300 rounded-xl text-center bg-white text-base"
                        style={{ color: '#1f2a4e' }}
                      />
                      <select
                        value={recurrenceType}
                        onChange={(e) => setRecurrenceType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                        className="flex-1 p-3 border border-neutral-300 rounded-xl bg-white text-base"
                        style={{ color: '#1f2a4e' }}
                      >
                        <option value="daily">Day{recurrenceInterval > 1 ? 's' : ''}</option>
                        <option value="weekly">Week{recurrenceInterval > 1 ? 's' : ''}</option>
                        <option value="monthly">Month{recurrenceInterval > 1 ? 's' : ''}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1f2a4e' }}>
                      End Condition
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-3 border-2 border-neutral-200 rounded-xl cursor-pointer bg-white">
                        <input
                          type="radio"
                          name="endType"
                          value="never"
                          checked={recurrenceEndType === 'never'}
                          onChange={(e) => setRecurrenceEndType('never')}
                          className="size-4"
                        />
                        <span className="text-sm font-medium" style={{ color: '#1f2a4e' }}>Never ends</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 border-2 border-neutral-200 rounded-xl cursor-pointer bg-white">
                        <input
                          type="radio"
                          name="endType"
                          value="after"
                          checked={recurrenceEndType === 'after'}
                          onChange={(e) => setRecurrenceEndType('after')}
                          className="size-4"
                        />
                        <span className="text-sm font-medium" style={{ color: '#1f2a4e' }}>After</span>
                        <input
                          type="number"
                          min="1"
                          value={recurrenceEndAfter}
                          onChange={(e) => setRecurrenceEndAfter(Math.max(1, parseInt(e.target.value) || 1))}
                          onClick={() => setRecurrenceEndType('after')}
                          className="w-16 p-2 border-2 border-neutral-300 rounded-lg text-center text-sm bg-white"
                          style={{ color: '#1f2a4e' }}
                        />
                        <span className="text-sm font-medium" style={{ color: '#1f2a4e' }}>times</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 border-2 border-neutral-200 rounded-xl cursor-pointer bg-white">
                        <input
                          type="radio"
                          name="endType"
                          value="on"
                          checked={recurrenceEndType === 'on'}
                          onChange={(e) => setRecurrenceEndType('on')}
                          className="size-4"
                        />
                        <span className="text-sm font-medium" style={{ color: '#1f2a4e' }}>On</span>
                        <input
                          type="date"
                          value={recurrenceEndDate ? recurrenceEndDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            setRecurrenceEndDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null);
                            setRecurrenceEndType('on');
                          }}
                          className="flex-1 p-2 border-2 border-neutral-300 rounded-lg text-sm bg-white"
                          style={{ color: '#1f2a4e' }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => setStep('location')}
                className="flex-1 py-3 border border-neutral-300 rounded-xl font-medium"
                style={{ color: '#6b7280' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep('assignment')}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{ backgroundColor: '#4dd0e1', color: 'white' }}
              >
                Next: Assign
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 6: Assignment */}
        {step === 'assignment' && (
          <motion.div
            key="assignment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1f2a4e' }}>Assign Task</h2>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAssignmentType('person')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    assignmentType === 'person'
                      ? 'bg-[#4dd0e1] text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  Person
                </button>
                <button
                  onClick={() => setAssignmentType('team')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    assignmentType === 'team'
                      ? 'bg-[#9c88ff] text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  Team
                </button>
                <button
                  onClick={() => setAssignmentType('external')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    assignmentType === 'external'
                      ? 'bg-orange-500 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  External
                </button>
                <button
                  onClick={() => setAssignmentType('unassigned')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    assignmentType === 'unassigned'
                      ? 'bg-neutral-500 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  Unassigned
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {assignmentType === 'person' && (
                <>
                  <input
                    type="text"
                    value={personSearch}
                    onChange={(e) => setPersonSearch(e.target.value)}
                    placeholder="Search team members..."
                    className="w-full p-3 border border-neutral-200 rounded-xl mb-3"
                  />
                  <div className="space-y-2">
                    {filteredTeamMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedPerson(member)}
                        className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          selectedPerson?.id === member.id
                            ? 'border-[#4dd0e1] bg-[#4dd0e1]/10'
                            : 'border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="size-10 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center font-bold text-sm">
                          {getInitials(member.name)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium" style={{ color: '#1f2a4e' }}>{member.name}</div>
                          <div className="text-xs text-neutral-500">{member.role}</div>
                        </div>
                        {selectedPerson?.id === member.id && (
                          <Check className="size-5" style={{ color: '#4dd0e1' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {assignmentType === 'team' && (
                <div className="space-y-2">
                  {teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        selectedTeam?.id === team.id
                          ? 'border-[#9c88ff] bg-[#9c88ff]/10'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <Users className="size-8" style={{ color: '#9c88ff' }} />
                      <div className="flex-1 text-left">
                        <div className="font-medium" style={{ color: '#1f2a4e' }}>{team.name}</div>
                        <div className="text-xs text-neutral-500">{team.memberIds.length} members</div>
                      </div>
                      {selectedTeam?.id === team.id && (
                        <Check className="size-5" style={{ color: '#9c88ff' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {assignmentType === 'external' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1f2a4e' }}>
                    External Email Address
                  </label>
                  <input
                    type="email"
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    placeholder="contractor@example.com"
                    className="w-full p-3 border border-neutral-200 rounded-xl"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    External contacts will receive task notifications via email
                  </p>
                </div>
              )}

              {assignmentType === 'unassigned' && (
                <div className="text-center py-8">
                  <div className="size-16 rounded-full bg-neutral-100 mx-auto mb-3 flex items-center justify-center">
                    <Check className="size-8 text-neutral-400" />
                  </div>
                  <h3 className="font-medium mb-1" style={{ color: '#1f2a4e' }}>Unassigned Task</h3>
                  <p className="text-sm text-neutral-500">
                    Task will be available for team members to claim
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => setStep('dates')}
                className="flex-1 py-3 border border-neutral-300 rounded-xl font-medium"
                style={{ color: '#6b7280' }}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreateTask()}
                className="flex-1 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4dd0e1', color: 'white' }}
              >
                Create Task
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
