// pages/api/slack/send-message.js
import { NextResponse } from 'next/server';
import { IncomingWebhook } from '@slack/webhook';

// Helper function to get the appropriate webhook URL based on team selection
const getWebhookUrl = (team) => {
  switch (team) {
    case 'software':
      return process.env.SLACK_Software_team_WEBHOOK_URL;
    default:
      return process.env.SLACK_WEBHOOK_URL;
  }
};

// Send a message to Slack for a specific team
const sendSlackMessageToTeam = async (message, channel = null, team = 'default') => {
  try {
    const webhookUrl = getWebhookUrl(team);
    if (!webhookUrl) {
      return { 
        success: false, 
        error: `Webhook URL not configured for ${team} team` 
      };
    }
    
    const webhook = new IncomingWebhook(webhookUrl);
    const result = await webhook.send({
      text: message,
      channel: channel || undefined,
    });
    return { success: true, result };
  } catch (error) {
    console.error(`Error sending message to Slack for team ${team}:`, error);
    return { success: false, error: error.message };
  }
};

// Send messages to multiple teams
const sendSlackMessageToTeams = async (message, channel = null, teams = ['default']) => {
  const results = {};
  
  for (const team of teams) {
    results[team] = await sendSlackMessageToTeam(message, channel, team);
  }
  
  return results;
};

// Upload a file to Slack for multiple teams
const uploadFileToSlackTeams = async (fileBuffer, filename, message, channel = null, teams = ['default']) => {
  const results = {};
  
  for (const team of teams) {
    try {
      // This is a placeholder - actual file upload requires OAuth and bot token
      // For now, we'll send a message with a link to download the file
      const fileInfo = `File: ${filename} (${(fileBuffer.length / 1024).toFixed(2)} KB)`;
      const fullMessage = message ? `${message}\n${fileInfo}` : fileInfo;
      
      results[team] = await sendSlackMessageToTeam(fullMessage, channel, team);
    } catch (error) {
      console.error(`Error handling file upload for team ${team}:`, error);
      results[team] = { success: false, error: error.message };
    }
  }
  
  return results;
};

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle JSON message requests
      const { message, channel, teams = ['default'] } = await request.json();
      
      if (!message) {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        );
      }

      const results = await sendSlackMessageToTeams(message, channel, teams);
      
      // Check if all requests were successful
      const allSuccess = Object.values(results).every(result => result.success);
      
      if (allSuccess) {
        return NextResponse.json({
          success: true,
          message: `Message sent to ${teams.length} team(s) successfully`,
          results
        });
      } else {
        // Some requests failed
        const errorCount = Object.values(results).filter(result => !result.success).length;
        return NextResponse.json({
          success: false,
          error: `Failed to send message to ${errorCount} of ${teams.length} team(s)`,
          results
        }, { status: 207 }); // 207 Multi-Status
      }
    } else if (contentType?.includes('multipart/form-data')) {
      // Handle file upload requests
      const formData = await request.formData();
      const file = formData.get('file');
      const message = formData.get('message');
      const channel = formData.get('channel');
      const teams = JSON.parse(formData.get('teams') || '["default"]');
      
      if (!file) {
        return NextResponse.json(
          { error: 'File is required' },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const results = await uploadFileToSlackTeams(buffer, file.name, message, channel, teams);
      
      // Check if all requests were successful
      const allSuccess = Object.values(results).every(result => result.success);
      
      if (allSuccess) {
        return NextResponse.json({
          success: true,
          message: `File info sent to ${teams.length} team(s) (actual file upload requires bot token)`,
          results
        });
      } else {
        // Some requests failed
        const errorCount = Object.values(results).filter(result => !result.success).length;
        return NextResponse.json({
          success: false,
          error: `Failed to send file info to ${errorCount} of ${teams.length} team(s)`,
          results
        }, { status: 207 }); // 207 Multi-Status
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in send-message API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}