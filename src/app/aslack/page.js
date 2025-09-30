// pages/index.js
'use client';

import { useState } from 'react';
import { Send, Upload, MessageSquare, Users, ChevronDown, Check } from 'lucide-react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('');
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('message');
  const [selectedTeams, setSelectedTeams] = useState(['default']);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const teams = [
    { id: 'default', name: 'Default Team', icon: Users },
    { id: 'software', name: 'Software Development Team', icon: Users }
  ];

  const toggleTeamSelection = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      // Don't allow deselecting all teams
      if (selectedTeams.length > 1) {
        setSelectedTeams(selectedTeams.filter(id => id !== teamId));
      }
    } else {
      setSelectedTeams([...selectedTeams, teamId]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/slack/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          channel,
          teams: selectedTeams 
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to send message' });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);

    if (!file) {
      setResult({ error: 'Please select a file to upload' });
      setIsSending(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (message) formData.append('message', message);
      if (channel) formData.append('channel', channel);
      formData.append('teams', JSON.stringify(selectedTeams));

      const response = await fetch('/api/slack/send-message', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to upload file' });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const selectedTeamsData = teams.filter(team => selectedTeams.includes(team.id));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-purple-100 p-3 rounded-full">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Task Tracker Slack Integration</h1>
            <p className="text-gray-600 mt-1">Send messages or files to your Slack workspace</p>
          </div>

          {/* Team Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Teams</label>
            <div className="relative">
              <button
                type="button"
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
              >
                <span className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="block truncate">
                    {selectedTeamsData.length === 0 
                      ? 'Select teams' 
                      : selectedTeamsData.map(team => team.name).join(', ')}
                  </span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </span>
              </button>

              {showTeamDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {teams.map((team) => {
                    const Icon = team.icon;
                    const isSelected = selectedTeams.includes(team.id);
                    return (
                      <div
                        key={team.id}
                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-purple-50 ${isSelected ? 'bg-purple-100' : ''}`}
                        onClick={() => toggleTeamSelection(team.id)}
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-normal block truncate">{team.name}</span>
                        </div>
                        {isSelected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-purple-600">
                            <Check className="h-5 w-5" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {selectedTeams.length === 0 
                ? 'Please select at least one team' 
                : `Sending to ${selectedTeams.length} team(s)`}
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'message' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('message')}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'file' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('file')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Send File Info
              </button>
            </nav>
          </div>

          {/* Message Form */}
          {activeTab === 'message' && (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="Enter your message here..."
                />
              </div>

              <div>
                <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-1">
                  Channel (optional)
                </label>
                <input
                  id="channel"
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="e.g., #general"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty to use the default channel from your webhook</p>
              </div>

              <button
                type="submit"
                disabled={isSending || selectedTeams.length === 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : `Send to ${selectedTeams.length} Team(s)`}
              </button>
            </form>
          )}

          {/* File Form */}
          {activeTab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                  File
                </label>
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border border-gray-300 rounded-md p-1"
                />
                <p className="mt-1 text-xs text-gray-500">Select any file type (max 5MB)</p>
              </div>

              <div>
                <label htmlFor="file-message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  id="file-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="Add a comment about your file"
                />
              </div>

              <div>
                <label htmlFor="file-channel" className="block text-sm font-medium text-gray-700 mb-1">
                  Channel (optional)
                </label>
                <input
                  id="file-channel"
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="e.g., #general"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty to use the default channel from your webhook</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Note:</strong> Incoming webhooks don't support direct file uploads. 
                      This will send file information (name and size) as a message. For actual file uploads, 
                      you need to implement OAuth with a bot token.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending || selectedTeams.length === 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : `Send File Info to ${selectedTeams.length} Team(s)`}
              </button>
            </form>
          )}

          {result && (
            <div className={`mt-4 p-4 rounded-md ${result.error ? 'bg-red-50 border-l-4 border-red-400' : 'bg-green-50 border-l-4 border-green-400'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {result.error ? (
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${result.error ? 'text-red-800' : 'text-green-800'}`}>
                    {result.error ? `Error: ${result.error}` : result.message}
                  </p>
                  {result.results && (
                    <div className="mt-2 text-sm">
                      {Object.entries(result.results).map(([team, status]) => (
                        <div key={team} className="mt-1">
                          <span className="font-medium">{team}:</span> {status.success ? '✅ Success' : `❌ ${status.error}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}