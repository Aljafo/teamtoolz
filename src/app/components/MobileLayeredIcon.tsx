import { LucideIcon } from 'lucide-react';

interface MobileLayeredIconProps {
  Icon: LucideIcon;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

export function MobileLayeredIcon({
  Icon,
  size = 32,
  primaryColor = '#4dd0e1',
  secondaryColor = '#9c88ff',
  className = '',
}: MobileLayeredIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Purple icon as background layer */}
      <Icon
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size, height: size, color: secondaryColor, opacity: 0.7 }}
      />
      {/* Cyan icon as foreground layer */}
      <Icon
        className="relative"
        style={{ width: size, height: size, color: primaryColor }}
      />
    </div>
  );
}
