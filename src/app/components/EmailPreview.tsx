import type { Task, TeamMember, Category } from '../App';

interface EmailPreviewProps {
  onClose: () => void;
}

export function EmailPreview({ onClose }: EmailPreviewProps) {
  // Sample task data for preview
  const sampleTask: Task = {
    id: 'preview-1',
    number: 42,
    observationId: 'obs-1',
    title: 'Inspect Electrical Wiring in South Warehouse',
    description: 'Urgent inspection needed for loose wiring on the south wall of the compressor shed. Please assess the safety risk and provide a quote for repairs. Photos attached show the current condition.',
    assignedTo: null,
    assignedToTeamId: null,
    assignedToExternal: 'contractor@example.com',
    status: 'pending',
    photos: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'],
    attachments: [],
    createdBy: {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      role: 'Project Lead',
      subscriptionTier: 'premium'
    },
    createdAt: new Date(),
    categoryId: 'cat1'
  };

  const sampleCategory = {
    id: 'cat1',
    name: 'Maintenance',
    color: '#7c8ba8'
  };

  const generateEmailHTML = (task: Task, category: typeof sampleCategory) => {
    const categoryBadge = `<span style="display: inline-block; padding: 4px 12px; background-color: ${category.color}20; color: ${category.color}; border-radius: 4px; font-size: 12px; font-weight: 600;">${category.name}</span>`;

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
                You've been assigned a new task from <strong>ACME Construction</strong>
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
                This is an automated notification from ACME Construction. Please contact the assigner if you have any questions about this task.
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
    `;
  };

  const emailHTML = generateEmailHTML(sampleTask, sampleCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Email Template Preview</h2>
            <p className="text-sm text-neutral-500 mt-1">This is how external parties will receive task assignments</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-700 font-medium"
          >
            Close
          </button>
        </div>

        {/* Email Preview */}
        <div className="flex-1 overflow-auto p-6 bg-neutral-50">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div
              dangerouslySetInnerHTML={{ __html: emailHTML }}
              className="email-preview"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-2">Email Details:</h3>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li><strong>Subject:</strong> Task Assignment: {sampleTask.title}</li>
                <li><strong>From:</strong> noreply@yourdomain.com</li>
                <li><strong>To:</strong> {sampleTask.assignedToExternal}</li>
              </ul>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-2">Features:</h3>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>✓ Mobile responsive design</li>
                <li>✓ Brand colors matching your app</li>
                <li>✓ Category badge with custom color</li>
                <li>✓ Photos included automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
