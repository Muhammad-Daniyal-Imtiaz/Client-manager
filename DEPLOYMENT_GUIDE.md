# 🎯 Installation & Deployment Steps

## Step 1: Install Dependencies (1 minute)

```bash
cd d:\5cmanager\Client-manager
npm install nodemailer
```

Or with yarn:
```bash
yarn add nodemailer
```

## Step 2: Verify Environment Variables

Check `.env.local` has these (already configured):
```env
EMAIL_USER=drhomefixerpro@gmail.com
EMAIL_PASS=agbqbuywenzccume
```

✅ Already set up!

## Step 3: Test Locally (2 minutes)

Start development server:
```bash
npm run dev
```

Create a test meeting via the UI and verify:
1. [ ] Email is received in inbox
2. [ ] In-app notification appears
3. [ ] Meeting appears in database

Check server logs for:
```
Email sent: <messageId>
Meeting created successfully
Participants notified
```

## Step 4: Database Verification

The SQL schema is already created. Verify in Supabase:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('meetings', 'meeting_participants', 'meeting_notifications', 'meeting_types');
```

Should return 4 rows.

## Step 5: Set Up Cron Job for Reminders

Choose ONE option below:

### Option A: Vercel (if deployed on Vercel)

1. Create/update `vercel.json` in project root:

```json
{
  "crons": [{
    "path": "/api/meetings/reminders/cron",
    "schedule": "*/5 * * * *"
  }]
}
```

2. Push to GitHub
3. Vercel automatically deploys with cron

### Option B: EasyCron (any deployment)

1. Visit https://www.easycron.com
2. Create new cron job
3. Set URL: `https://your-domain.com/api/meetings/reminders/cron`
4. Set schedule: `0 */5 * * * *` (every 5 minutes)
5. Save

### Option C: IFTTT Webhooks

1. Create IFTTT account
2. Create applet with:
   - Trigger: Time (every 5 minutes)
   - Action: Webhook POST
   - URL: `https://your-domain.com/api/meetings/reminders/cron`

### Option D: AWS Lambda (for production)

```javascript
// handler.js
export const handler = async () => {
  const response = await fetch('https://your-domain.com/api/meetings/reminders/cron', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });
  return { statusCode: response.status };
};
```

Then set CloudWatch rule for every 5 minutes.

## Step 6: Deploy to Production

### Vercel Deployment

```bash
# If using Git
git add .
git commit -m "Add meeting notifications system"
git push origin main

# Vercel auto-deploys
```

### Docker Deployment

```bash
# Build Docker image
docker build -t meeting-app .

# Run container
docker run -p 3000:3000 \
  -e EMAIL_USER=your-email \
  -e EMAIL_PASS=your-password \
  meeting-app
```

### Manual Deployment

```bash
# Build
npm run build

# Start
npm start
```

## Step 7: Post-Deployment Verification

Check these in production:

```bash
# 1. Test meeting creation
curl -X POST https://your-domain.com/api/meetings/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Production Test",
    "meeting_type_id": "type-id",
    "meeting_link": "https://meet.google.com/test",
    "scheduled_date": "2026-01-20",
    "start_time": "14:00",
    "participants": ["user-id"]
  }'

# 2. Check email delivery
# (check email inbox)

# 3. Check cron execution
# (wait 5 minutes and check logs)
```

## Step 8: Monitor & Maintain

### Check Email Delivery

```sql
SELECT 
  id,
  notification_type,
  is_sent,
  sent_at,
  created_at
FROM meeting_notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Reminder Status

```sql
SELECT 
  id,
  title,
  reminder_sent,
  scheduled_date,
  start_time
FROM meetings
WHERE scheduled_date = CURRENT_DATE
ORDER BY start_time;
```

### Monitor Errors

Check application logs for:
- `Error sending email:`
- `Error creating meeting:`
- `Error sending notifications:`

### Monitor Cron Job

If using Vercel:
- Check Function Logs in Vercel Dashboard
- Look for `/api/meetings/reminders/cron` executions

If using EasyCron:
- Check execution history in EasyCron dashboard

## Production Checklist

Before going live, verify:

- [ ] `npm install nodemailer` completed
- [ ] Email credentials in `.env.local`
- [ ] Database schema created
- [ ] Test meeting created
- [ ] Email received in inbox
- [ ] In-app notification appears
- [ ] Cron job configured
- [ ] Logs accessible
- [ ] Error monitoring set up
- [ ] Database backups configured

## Troubleshooting During Setup

### Issue: `nodemailer module not found`
```bash
# Solution
npm install nodemailer
# Restart development server
npm run dev
```

### Issue: Email not sending
Check `.env.local`:
```bash
# Verify these are set
echo $EMAIL_USER
echo $EMAIL_PASS
```

### Issue: Database schema missing
```sql
-- Run the SQL schema provided
-- In: SUPABASE_SETUP.md or DATABASE_SETUP.sql
```

### Issue: Cron job not executing
- Verify URL is correct and public
- Check authorization headers if required
- Review cron service logs

## Performance Optimization

### For High Traffic

1. Add database indexes (already done ✅)
2. Implement email queue:
   ```typescript
   // Use Bull or similar
   const emailQueue = new Queue('emails', redisUrl);
   ```
3. Add caching layer:
   ```typescript
   import Redis from 'ioredis';
   ```

### For Large Scale

1. Use transactional emails (SendGrid, AWS SES):
   ```bash
   npm install @sendgrid/mail
   ```
2. Implement notification aggregation
3. Add rate limiting

## Monitoring & Alerts

### Set Up Error Alerts

```typescript
// In your error handler
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error);
```

### Monitor Email Delivery

```bash
# Check daily summary
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN is_sent THEN 1 ELSE 0 END) as sent
FROM meeting_notifications
GROUP BY DATE(created_at);
```

## Rollback Plan

If issues in production:

```bash
# 1. Disable cron job
# (Comment out from vercel.json or EasyCron)

# 2. Revert code
git revert <commit-hash>
git push

# 3. Keep database (no schema changes needed)

# 4. Verify working
npm run dev

# 5. Debug issue
# Check logs and error messages

# 6. Fix and redeploy
```

## Scaling Tips

### Database

```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Optimize queries
CREATE INDEX idx_notifications_user_date 
ON meeting_notifications(user_id, created_at DESC);
```

### Email Service

For high volume:
```bash
npm install nodemailer-smtp-pool
```

Use connection pooling.

### Real-time Subscriptions

Limit concurrent subscriptions:
```typescript
// In hook
useEffect(() => {
  const subscription = supabase
    .channel(`notifications:user_${userId}`)
    .on('postgres_changes', ..., listener)
    .subscribe();

  return () => subscription.unsubscribe();
}, [userId]); // Only subscribe once per user
```

## Support & Debugging

### Enable Debug Logging

```typescript
// In lib/email.ts
if (process.env.DEBUG_EMAIL === 'true') {
  console.log('Email payload:', payload);
}
```

Then set env var:
```env
DEBUG_EMAIL=true
```

### Access Logs

**Vercel:**
- Dashboard → Functions → Logs

**Docker:**
```bash
docker logs <container-id>
```

**Local:**
```bash
npm run dev
# Check console output
```

### Test Each Component

```bash
# Test email service
curl -X POST http://localhost:3000/api/test/email

# Test notifications
curl -X POST http://localhost:3000/api/test/notification

# Test cron
curl http://localhost:3000/api/meetings/reminders/cron
```

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check email delivery
   - Monitor error logs
   - Verify cron execution

2. **Get user feedback**
   - Are notifications helpful?
   - Email templates clear?
   - Real-time features working?

3. **Optimize based on metrics**
   - Email open rates
   - Notification engagement
   - System performance

4. **Plan enhancements**
   - SMS notifications
   - Calendar integration
   - Custom notification settings

---

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install nodemailer` |
| Start dev | `npm run dev` |
| Build | `npm run build` |
| Deploy | `git push origin main` |
| Check logs | Vercel Dashboard |
| Test email | Create meeting in UI |
| Test cron | Wait 5 minutes or curl endpoint |

## Support Contact

For issues, check:
1. `QUICK_START_GUIDE.md` - Common issues
2. `MEETING_NOTIFICATIONS_SETUP.md` - Detailed troubleshooting
3. Server logs - Error messages
4. Database - Verify data created

---

**Installation complete! System is ready to deploy. 🚀**
