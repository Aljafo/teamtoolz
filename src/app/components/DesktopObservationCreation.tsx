import { useState, useRef } from 'react';
import { X, Camera, Check } from 'lucide-react';
import type { Category, TeamMember, Location, Subcategory } from '../App';
import { DesktopLocationPicker } from './DesktopLocationPicker';

interface DesktopObservationCreationProps {
  team: TeamMember[];
  categories: Category[];
  subcategories: Subcategory[];
  currentUser: TeamMember;
  onClose: () => void;
  onCreateObservation: (message: string, photos: string[], categoryId: string, location?: Location, subcategoryId?: string) => void;
}

export function DesktopObservationCreation({
  team,
  categories,
  subcategories,
  currentUser,
  onClose,
  onCreateObservation,
}: DesktopObservationCreationProps) {
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories.length > 0 ? categories[0] : null
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<TeamMember | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCategorySubcategories = (categoryId: string): Subcategory[] => {
    return subcategories.filter(sc => sc.categoryId === categoryId);
  };

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

  const canCreate = () => {
    const basicCheck = (message.trim().length > 0 || photos.length > 0) && selectedCategory !== null && selectedRecipient !== null;
    if (!basicCheck) return false;

    // If category has subcategories, one must be selected
    if (selectedCategory) {
      const categorySubcategories = getCategorySubcategories(selectedCategory.id);
      if (categorySubcategories.length > 0 && !selectedSubcategory) {
        return false;
      }
    }

    return true;
  };

  const handleCreate = () => {
    if (!canCreate() || !selectedCategory) return;

    onCreateObservation(message, photos, selectedCategory.id, selectedLocation || undefined, selectedSubcategory?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{ border: '1px solid #d4d0b8' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #d4d0b8' }}>
          <h2 className="text-2xl font-semibold" style={{ color: '#2c3e72' }}>New Observation</h2>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <X className="size-5" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2c3e72' }}>Description *</h3>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what you observed..."
              className="w-full p-3 rounded-lg resize-none"
              style={{ border: '1px solid #d4d0b8' }}
              rows={6}
              autoFocus
            />
          </div>

          {/* Photos Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2c3e72' }}>Photos</h3>

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
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2c3e72' }}>Category *</h3>

            <select
              value={selectedCategory ? selectedCategory.id : ''}
              onChange={(e) => {
                const cat = categories.find(c => c.id === e.target.value);
                setSelectedCategory(cat || null);
                setSelectedSubcategory(null); // Clear subcategory when category changes
              }}
              className="w-full p-3 rounded-lg"
              style={{ border: '1px solid #d4d0b8', color: '#2c3e72' }}
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
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#2c3e72' }}>Subcategory *</h3>

              <select
                value={selectedSubcategory ? selectedSubcategory.id : ''}
                onChange={(e) => {
                  const subcat = subcategories.find(sc => sc.id === e.target.value);
                  setSelectedSubcategory(subcat || null);
                }}
                className="w-full p-3 rounded-lg"
                style={{ border: '1px solid #d4d0b8', color: '#2c3e72' }}
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

          {/* Send To Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2c3e72' }}>Send To *</h3>

            <select
              value={selectedRecipient ? selectedRecipient.id : ''}
              onChange={(e) => {
                const person = team.find(m => m.id === e.target.value);
                setSelectedRecipient(person || null);
              }}
              className="w-full p-3 rounded-lg"
              style={{ border: '1px solid #d4d0b8', color: '#2c3e72' }}
            >
              <option value="">Select a team member...</option>
              {team.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
            <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
              Choose who should receive this observation
            </p>
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
            style={{ backgroundColor: '#5b9bd5' }}
          >
            Create Observation
          </button>
        </div>
      </div>
    </div>
  );
}
