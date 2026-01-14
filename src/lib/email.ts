import nodemailer from 'nodemailer'

// Create reusable transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  cc?: string[]
  bcc?: string[]
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const transporter = getTransporter()

    const info = await transporter.sendMail({
      from: `"Meeting System" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
      cc: payload.cc?.join(', '),
      bcc: payload.bcc?.join(', '),
      subject: payload.subject,
      html: payload.html
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// Email templates
export const emailTemplates = {
  meetingInvitation: (data: {
    participantName: string
    meetingTitle: string
    meetingDate: string
    startTime: string
    endTime?: string
    meetingLink: string
    description?: string
    organizerName: string
  }) => ({
    subject: `New Meeting Invitation: ${data.meetingTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .meeting-details { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { background: #f0f0f0; padding: 15px; font-size: 12px; text-align: center; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">Meeting Invitation</h2>
          </div>
          
          <div class="content">
            <p>Hi ${data.participantName},</p>
            
            <p>${data.organizerName} has invited you to a meeting:</p>
            
            <div class="meeting-details">
              <div class="detail-row">
                <span class="label">Meeting:</span> ${data.meetingTitle}
              </div>
              <div class="detail-row">
                <span class="label">Date:</span> ${data.meetingDate}
              </div>
              <div class="detail-row">
                <span class="label">Time:</span> ${data.startTime} ${data.endTime ? `- ${data.endTime}` : ''}
              </div>
              ${data.description ? `<div class="detail-row"><span class="label">Description:</span> ${data.description}</div>` : ''}
              <div class="detail-row">
                <span class="label">Meeting Link:</span> <a href="${data.meetingLink}">${data.meetingLink}</a>
              </div>
            </div>
            
            <a href="${data.meetingLink}" class="button">Join Meeting</a>
            
            <p>Please confirm your attendance when possible.</p>
            <p>Best regards,<br>Meeting System</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  meetingUpdate: (data: {
    participantName: string
    meetingTitle: string
    status: string
    meetingDate?: string
    startTime?: string
    meetingLink?: string
    changeDetails: string
  }) => ({
    subject: `Meeting Update: ${data.meetingTitle} - ${data.status}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .status-badge { display: inline-block; background: ${
            data.status === 'cancelled'
              ? '#ff6b6b'
              : data.status === 'rescheduled'
                ? '#ffa500'
                : '#4CAF50'
          }; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .meeting-details { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 15px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #f5576c; }
          .footer { background: #f0f0f0; padding: 15px; font-size: 12px; text-align: center; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">Meeting Update</h2>
          </div>
          
          <div class="content">
            <p>Hi ${data.participantName},</p>
            
            <p>There is an update to your meeting:</p>
            
            <div style="text-align: center; margin: 15px 0;">
              <span class="status-badge">${data.status.toUpperCase()}</span>
            </div>
            
            <div class="meeting-details">
              <div class="detail-row">
                <span class="label">Meeting:</span> ${data.meetingTitle}
              </div>
              ${data.meetingDate ? `<div class="detail-row"><span class="label">Date:</span> ${data.meetingDate}</div>` : ''}
              ${data.startTime ? `<div class="detail-row"><span class="label">Time:</span> ${data.startTime}</div>` : ''}
              ${data.meetingLink ? `<div class="detail-row"><span class="label">Meeting Link:</span> <a href="${data.meetingLink}">${data.meetingLink}</a></div>` : ''}
              <div class="detail-row">
                <span class="label">Details:</span> ${data.changeDetails}
              </div>
            </div>
            
            <p>Best regards,<br>Meeting System</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  meetingReminder: (data: {
    participantName: string
    meetingTitle: string
    meetingDate: string
    startTime: string
    meetingLink: string
    timeUntilMeeting: string
  }) => ({
    subject: `Reminder: ${data.meetingTitle} starting ${data.timeUntilMeeting}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #333; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .meeting-details { background: white; padding: 15px; border-left: 4px solid #fa709a; margin: 15px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #fa709a; }
          .button { display: inline-block; background: #fa709a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { background: #f0f0f0; padding: 15px; font-size: 12px; text-align: center; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">Meeting Reminder</h2>
          </div>
          
          <div class="content">
            <p>Hi ${data.participantName},</p>
            
            <p>This is a reminder that your meeting is starting in ${data.timeUntilMeeting}:</p>
            
            <div class="meeting-details">
              <div class="detail-row">
                <span class="label">Meeting:</span> ${data.meetingTitle}
              </div>
              <div class="detail-row">
                <span class="label">Date:</span> ${data.meetingDate}
              </div>
              <div class="detail-row">
                <span class="label">Time:</span> ${data.startTime}
              </div>
              <div class="detail-row">
                <span class="label">Meeting Link:</span> <a href="${data.meetingLink}">${data.meetingLink}</a>
              </div>
            </div>
            
            <a href="${data.meetingLink}" class="button">Join Meeting Now</a>
            
            <p>Best regards,<br>Meeting System</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}
