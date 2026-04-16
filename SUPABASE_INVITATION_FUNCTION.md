# Supabase Edge Function: send-invitation

This document describes the Supabase Edge Function for sending invitation emails to new users.

## Overview

When an admin invites a new user to join their organization, this edge function is invoked to send a professional HTML email invitation using the Resend email service.

## Function Location

```
/supabase/functions/send-invitation/index.ts
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
APP_URL=https://yourapp.com  # Base URL for invitation acceptance links
```

## Function Code

Create `/supabase/functions/send-invitation/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'noreply@yourdomain.com'
const APP_URL = Deno.env.get('APP_URL') || 'https://yourapp.com'

interface InvitationRequest {
  to: string
  subject: string
  html: string
  invitation: {
    id: string
    token: string
    name: string
    role: 'admin' | 'member'
  }
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Parse request body
    const { to, subject, html, invitation }: InvitationRequest = await req.json()

    // Validate inputs
    if (!to || !subject || !html || !invitation) {
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

    // Verify invitation exists and is pending
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: invitationData, error: invitationError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitation.id)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitationData) {
      return new Response(
        JSON.stringify({ error: 'Invitation not found or not pending' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitationData.expires_at)
    if (expiresAt < now) {
      return new Response(
        JSON.stringify({ error: 'Invitation has expired' }),
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
    await supabase.from('invitation_emails').insert({
      invitation_id: invitation.id,
      recipient_email: to,
      subject: subject,
      resend_id: resendData.id,
      sent_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation email sent successfully',
        email_id: resendData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-invitation function:', error)
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

## Optional: Invitation Email Logs Table

Create a table to track sent invitation emails for audit purposes:

```sql
CREATE TABLE invitation_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_id TEXT, -- ID from Resend API
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitation_emails_invitation_id ON invitation_emails(invitation_id);
CREATE INDEX idx_invitation_emails_sent_at ON invitation_emails(sent_at DESC);
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
   supabase functions deploy send-invitation
   ```

5. **Set environment variables** in Supabase Dashboard:
   - Navigate to Project Settings → Edge Functions
   - Add RESEND_API_KEY, SENDER_EMAIL, APP_URL

## Frontend Integration

In your React app (`App.tsx`), update the `sendInvitationEmail` function:

```typescript
const sendInvitationEmail = async (invitation: Invitation) => {
  const inviter = mockTeam.find(m => m.id === invitation.invitedBy);
  const inviterName = inviter ? inviter.name : 'An administrator';
  const emailHTML = generateInvitationEmailHTML(invitation, inviterName, currentOrganization.name);
  const emailSubject = `You're invited to join ${currentOrganization.name} on TaskFlow`;

  try {
    const { data, error } = await supabase.functions.invoke('send-invitation', {
      body: {
        to: invitation.email,
        subject: emailSubject,
        html: emailHTML,
        invitation: {
          id: invitation.id,
          token: invitation.token,
          name: invitation.name,
          role: invitation.role,
        },
      },
    });

    if (error) {
      console.error('Failed to send invitation email:', error);
      alert('Failed to send invitation email. Please try again.');
      return;
    }

    console.log('✅ Invitation email sent successfully:', data);
  } catch (error) {
    console.error('Error calling edge function:', error);
    alert('Failed to send invitation email. Please check your connection.');
  }
};
```

## Testing

### Local Testing

1. **Start Supabase locally**:
   ```bash
   supabase start
   ```

2. **Create .env file** at `./supabase/.env.local`:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   SENDER_EMAIL=noreply@yourdomain.com
   APP_URL=http://localhost:5173
   ```

3. **Serve the function locally**:
   ```bash
   supabase functions serve send-invitation --env-file ./supabase/.env.local
   ```

4. **Test with curl**:
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/send-invitation' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{
       "to": "test@example.com",
       "subject": "You'\''re invited to join ACME on TaskFlow",
       "html": "<p>Test email</p>",
       "invitation": {
         "id": "test-123",
         "token": "test-token-456",
         "name": "John Doe",
         "role": "member"
       }
     }'
   ```

## Email Template Structure

The invitation email template includes:

1. **Header**: Blue gradient banner with "You're Invited to Join {Organization}"
2. **Greeting**: Personalized with recipient's name
3. **Invitation Details Card**:
   - Organization name
   - Role (Administrator or Member)
   - Invited by (admin name)
   - Expiration date
4. **Accept Button**: Prominent CTA linking to acceptance page
5. **Role Description**: What the user can do with their role
6. **Fallback Link**: Plain text link for email clients that don't support buttons
7. **Footer**: Branding and legal text

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
const rateLimitKey = `invitation_rate_limit:${to}`
const invitationCount = await redis.incr(rateLimitKey)
await redis.expire(rateLimitKey, 86400) // 24 hours

if (invitationCount > 3) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded. Max 3 invitations per day to same address.' }),
    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

## Monitoring

Monitor email delivery in:
- **Resend Dashboard**: https://resend.com/emails
- **Supabase Logs**: Project → Edge Functions → Logs
- **Invitation Emails Table**: Query for delivery tracking

## Security Considerations

1. **API Key Security**: Never expose Resend API key in frontend code
2. **Email Validation**: Always validate email format before sending
3. **Token Validation**: Verify invitation exists, is pending, and not expired
4. **Rate Limiting**: Implement to prevent abuse
5. **HTTPS Only**: Accept links must use HTTPS in production
6. **Audit Trail**: Log all invitations sent for compliance

## Troubleshooting

**Email not sending:**
- Check Resend API key is set correctly
- Verify sender domain in Resend
- Check edge function logs for errors

**Invalid invitation errors:**
- Ensure invitation exists in database
- Check invitation status is 'pending'
- Verify expiration date hasn't passed

**Rate limit errors:**
- Check Resend dashboard for usage limits
- Implement frontend rate limiting warnings

## Future Enhancements

1. **Email Templates**: Store templates in database for easy customization
2. **Delivery Status Webhooks**: Listen for Resend delivery/bounce events
3. **Batch Invitations**: Support inviting multiple users at once
4. **Email Preferences**: Allow users to opt-out of certain notification types
5. **Custom Branding**: Organization-specific email templates with logos
6. **Localization**: Multi-language email templates
