import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, FileText, Video, X, Paperclip } from 'lucide-react';
import type { Attachment, TeamMember } from '../App';
import { processSingleDocument } from '../utils/documentScanner';
import { MobileLayeredIcon } from './MobileLayeredIcon';

interface MobileFileUploadProps {
  attachments: Attachment[];
  currentUser: TeamMember;
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

export function MobileFileUpload({
  attachments,
  currentUser,
  onAddAttachment,
  onRemoveAttachment,
}: MobileFileUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // Reset so same file can be selected again

    if (files.length === 0) return;

    setProcessing(true);

    try {
      // Process each file (compress images automatically)
      for (const file of files) {
        const processed = await processSingleDocument(file, {
          compressImages: true,
          convertToPDF: false, // Keep as images for now
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
        });
        onAddAttachment(processed);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      // If processing fails, upload originals
      files.forEach(file => onAddAttachment(file));
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="size-4 text-blue-600" />;
      case 'video':
        return <Video className="size-4 text-purple-600" />;
      case 'document':
        return <FileText className="size-4 text-neutral-600" />;
    }
  };

  const isPremium = currentUser.subscriptionTier === 'premium';

  return (
    <div className="space-y-3">
      {/* Upload Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium active:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MobileLayeredIcon Icon={Camera} size={20} />
          <span className="text-sm">{processing ? 'Processing...' : 'Camera'}</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-200 text-neutral-900 rounded-lg font-medium active:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Paperclip className="size-5" />
          <span className="text-sm">{processing ? 'Processing...' : 'Files'}</span>
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={isPremium ? "image/*,.pdf,.doc,.docx,.xls,.xlsx,video/*" : "image/*,.pdf,.doc,.docx,.xls,.xlsx"}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-neutral-700">
            Attachments ({attachments.length})
          </h4>
          <div className="space-y-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg border border-neutral-200"
              >
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="size-12 object-cover rounded"
                  />
                ) : (
                  <div className="size-12 flex items-center justify-center bg-white rounded border border-neutral-200">
                    {getFileIcon(attachment.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveAttachment(attachment.id)}
                  className="size-8 flex items-center justify-center rounded-lg active:bg-red-50 text-neutral-400 active:text-red-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-neutral-500 text-center">
        {processing
          ? 'Compressing files...'
          : `Scan documents or add files • Images auto-compressed${isPremium ? ' • Videos (15s max)' : ''}`
        }
      </p>
    </div>
  );
}
