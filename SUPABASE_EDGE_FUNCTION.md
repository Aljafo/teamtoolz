# Supabase Edge Function: send-task-assignment

This document describes the Supabase Edge Function for sending task assignment emails to external parties.

## Overview

When a task is assigned to an external party (via email), this edge function is invoked to send a professional HTML email notification using the Resend email service.

## Function Location

```
/supabase/functions/send-task-assignment/index.ts
```

## Prerequisites

1. **Resend API Key**: Sign up at https://resend.com and get an API key
2. **Supabase Project**: Edge Functions enabled
3. **Environment Variables**: Set in Supabase Dashboard → Project Settings → Edge Functions

## Environment Variables

Add these to your Supabase project:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@yourdomain.com  # Must be verified in Resend
ORGANIZATION_NAME=Your Organization Name
```

## Function Code

Create `/supabase/functions/send-task-assignment/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'noreply@yourdomain.com'
const ORGANIZATION_NAME = Deno.env.get('ORGANIZATION_NAME') || 'Your Organization'

interface TaskAssignmentRequest {
  to: string
  subject: string
  html: string
  task: {
    id: string
    title: string
    number: number
  }
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Parse request body
    const { to, subject, html, task }: TaskAssignmentRequest = await req.json()

    // Validate inputs
    if (!to || !subject || !html || !task) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log to database for audit trail
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase.from('email_logs').insert({
      task_id: task.id,
      recipient_email: to,
      subject: subject,
      resend_id: resendData.id,
      sent_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        email_id: resendData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-task-assignment function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

## Optional: Email Logs Table

Create a table to track sent emails for audit purposes:

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_id TEXT, -- ID from Resend API
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_task_id ON email_logs(task_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
```

## Deployment

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy send-task-assignment
   ```

5. **Set environment variables** in Supabase Dashboard:
   - Navigate to Project Settings → Edge Functions
   - Add RESEND_API_KEY, SENDER_EMAIL, ORGANIZATION_NAME

## Frontend Integration

In your React app (`App.tsx`), update the `sendTaskAssignmentEmail` function:

```typescript
const sendTaskAssignmentEmail = async (task: Task, recipientEmail: string) => {
  const emailHTML = generateTaskAssignmentEmailHTML(task);
  const emailSubject = `Task Assignment: ${task.title}`;

  try {
    const { data, error } = await supabase.functions.invoke('send-task-assignment', {
      body: {
        to: recipientEmail,
        subject: emailSubject,
        html: emailHTML,
        task: {
          id: task.id,
          title: task.title,
          number: task.number,
        },
      },
    });

    if (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email notification. Please try again.');
      return;
    }

    console.log('✅ Email sent successfully:', data);
  } catch (error) {
    console.error('Error calling edge function:', error);
    alert('Failed to send email notification. Please check your connection.');
  }
};
```

## Testing

### Local Testing

1. **Start Supabase locally**:
   ```bash
   supabase start
   ```

2. **Serve the function locally**:
   ```bash
   supabase functions serve send-task-assignment --env-file ./supabase/.env.local
   ```

3. **Test with curl**:
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/send-task-assignment' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{
       "to": "test@example.com",
       "subject": "Test Task Assignment",
       "html": "<p>Test email</p>",
       "task": {
         "id": "test-123",
         "title": "Test Task",
         "number": 1
       }
     }'
   ```

## Resend Setup

1. **Sign up at Resend**: https://resend.com/signup
2. **Verify your domain**:
   - Go to Domains → Add Domain
   - Add DNS records (SPF, DKIM) to your domain provider
   - Wait for verification (usually < 24 hours)
3. **Create API Key**:
   - Go to API Keys → Create API Key
   - Copy the key and add to Supabase environment variables
4. **Set sender email**:
   - Use format: `noreply@yourdomain.com`
   - Must be from your verified domain

## Rate Limiting

Resend free tier limits:
- 100 emails/day
- 3,000 emails/month

For production, upgrade to paid plan or implement rate limiting:

```typescript
// Add to edge function
const rateLimitKey = `email_rate_limit:${to}`
const emailCount = await redis.incr(rateLimitKey)
await redis.expire(rateLimitKey, 86400) // 24 hours

if (emailCount > 10) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded. Max 10 emails per day to same address.' }),
    { status: 429 }
  )
}
```

## Monitoring

Monitor email delivery in:
- **Resend Dashboard**: https://resend.com/emails
- **Supabase Logs**: Project → Edge Functions → Logs
- **Email Logs Table**: Query for delivery tracking

## Security Considerations

1. **API Key Security**: Never expose Resend API key in frontend code
2. **Email Validation**: Always validate email format before sending
3. **Rate Limiting**: Implement to prevent abuse
4. **Content Sanitization**: Sanitize HTML content if user-generated
5. **Audit Trail**: Log all emails sent for compliance

## Troubleshooting

**Email not sending:**
- Check Resend API key is set correctly
- Verify sender domain in Resend
- Check edge function logs for errors

**Invalid email errors:**
- Ensure email format validation is working
- Check for typos in recipient address

**Rate limit errors:**
- Check Resend dashboard for usage limits
- Implement frontend rate limiting warnings

## Future Enhancements

1. **Email Templates**: Store templates in database for easy customization
2. **Delivery Status Webhooks**: Listen for Resend delivery/bounce events
3. **Batch Sending**: Support multiple recipients for team assignments
4. **Email Preferences**: Allow external parties to unsubscribe
5. **Attachments**: Support sending task attachments in email
