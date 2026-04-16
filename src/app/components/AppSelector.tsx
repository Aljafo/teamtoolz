import { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, GripVertical } from 'lucide-react';

interface AppSelectorProps {
  onSelect: (platform: 'desktop' | 'mobile') => void;
  currentPlatform: 'desktop' | 'mobile';
}

export function AppSelector({ onSelect, currentPlatform }: AppSelectorProps) {
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage
    const saved = localStorage.getItem('appSelectorPosition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: window.innerWidth - 250, y: 24 };
      }
    }
    return { x: window.innerWidth - 250, y: 24 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appSelectorPosition', JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    // Only start drag if clicking on the grip or non-button area
    const target = e.target as HTMLElement;
    if (target.closest('button') && !target.closest('[data-drag-handle]')) {
      return;
    }

    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within bounds
      const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 0);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-50 bg-white rounded-xl shadow-lg border-2 ${
        isDragging ? 'border-blue-500 shadow-2xl' : 'border-neutral-200'
      } p-2 flex gap-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle */}
      <div
        data-drag-handle
        className="flex items-center justify-center px-1 text-neutral-400 hover:text-neutral-600 transition-colors"
        title="Drag to move"
      >
        <GripVertical className="size-4" />
      </div>

      <button
        onClick={() => onSelect('desktop')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentPlatform === 'desktop'
            ? 'bg-blue-600 text-white'
            : 'text-neutral-700 hover:bg-neutral-100'
        }`}
      >
        <Monitor className="size-4" />
        <span className="text-sm font-medium">Desktop</span>
      </button>
      <button
        onClick={() => onSelect('mobile')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentPlatform === 'mobile'
            ? 'bg-blue-600 text-white'
            : 'text-neutral-700 hover:bg-neutral-100'
        }`}
      >
        <Smartphone className="size-4" />
        <span className="text-sm font-medium">Mobile</span>
      </button>
    </div>
  );
}
