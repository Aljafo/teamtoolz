import { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video } from 'lucide-react';
import type { Attachment, TeamMember } from '../App';
import { processSingleDocument } from '../utils/documentScanner';

interface FileUploadProps {
  attachments: Attachment[];
  currentUser: TeamMember;
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

export function FileUpload({
  attachments,
  currentUser,
  onAddAttachment,
  onRemoveAttachment,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setProcessing(true);

    try {
      // Process each file (compress images automatically)
      for (const file of files) {
        const processed = await processSingleDocument(file, {
          compressImages: true,
          convertToPDF: false,
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // Reset input so same file can be selected again

    await processFiles(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="size-5 text-blue-600" />;
      case 'video':
        return <Video className="size-5 text-purple-600" />;
      case 'document':
        return <FileText className="size-5 text-neutral-600" />;
    }
  };

  const isPremium = currentUser.subscriptionTier === 'premium';

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !processing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          processing
            ? 'border-blue-500 bg-blue-50 cursor-wait'
            : isDragging
            ? 'border-blue-500 bg-blue-50 cursor-pointer'
            : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 cursor-pointer'
        }`}
      >
        <Upload className={`size-8 mx-auto mb-3 ${processing ? 'text-blue-500 animate-pulse' : 'text-neutral-400'}`} />
        <p className="text-sm font-medium text-neutral-700 mb-1">
          {processing ? 'Processing files...' : 'Drag files here or click to browse'}
        </p>
        <p className="text-xs text-neutral-500">
          {processing
            ? 'Compressing images for optimal upload'
            : `Scan documents or add files • Images auto-compressed${isPremium ? ' • Videos (15s max)' : ''}`
          }
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={isPremium ? "image/*,.pdf,.doc,.docx,.xls,.xlsx,video/*" : "image/*,.pdf,.doc,.docx,.xls,.xlsx"}
          onChange={handleFileSelect}
          className="hidden"
          disabled={processing}
        />
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-neutral-700">Attachments ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 group hover:bg-neutral-100 transition-colors"
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
                    {formatFileSize(attachment.size)} • {attachment.uploadedBy.name}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveAttachment(attachment.id)}
                  className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
