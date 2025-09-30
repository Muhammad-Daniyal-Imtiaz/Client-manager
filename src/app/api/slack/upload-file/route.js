
import { NextResponse } from 'next/server';

import { IncomingWebhook } from '@slack/webhook';
import { WebClient } from '@slack/web-api';
import fs from 'fs';
import FormData from 'form-data';

// Initialize with your webhook URL
const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

// Initialize WebClient for file uploads (would need a bot token for full functionality)
const webClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Send a message to Slack
export const sendSlackMessage = async (message, channel = null) => {
  try {
    const result = await webhook.send({
      text: message,
      channel: channel || undefined,
    });
    return { success: true, result };
  } catch (error) {
    console.error('Error sending message to Slack:', error);
    return { success: false, error: error.message };
  }
};

// Upload a file to Slack using webhook (alternative approach)
export const uploadFileToSlack = async (fileBuffer, filename, message, channel = null) => {
  try {
    // For webhook-based file upload, we need to use a different approach
    // This method uses the incoming webhook to send a message with a file attachment
    const formData = new FormData();
    
    // Add file
    formData.append('file', fileBuffer, {
      filename: filename,
      contentType: 'application/octet-stream'
    });
    
    // Add message text if provided
    if (message) {
      formData.append('initial_comment', message);
    }
    
    // Add channel if provided
    if (channel) {
      formData.append('channels', channel);
    }
    
    // For actual file uploads, you would typically need a bot token
    // This is a simplified version using the webhook
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      return { success: true, message: 'File uploaded successfully' };
    } else {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading file to Slack:', error);
    return { success: false, error: error.message };
  }
};



export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const message = formData.get('message');
    const channel = formData.get('channel');
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const result = await uploadFileToSlack(buffer, file.name, message, channel);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'File uploaded to Slack successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in upload-file API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}