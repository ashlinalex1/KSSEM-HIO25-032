'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RoleBasedHeader } from '@/components/role-based-header';
import { signOut, getProfile } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/lib/auth';

interface Message {
  text: string;
  isUser: boolean;
}

const ChatbotInterface = () => {
  const router = useRouter();
  // State for file upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUploadedFromState, setHasUploadedFromState] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedFileRef = useRef<File | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setUserName(profile.full_name);
          setUserRole(profile.role);
        }
      }
    };
    loadUser();
  }, []);

  const processFileUpload = useCallback(async (file: File) => {
    // Prevent duplicate uploads
    if (uploadedFileRef.current === file) return;
    uploadedFileRef.current = file;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        addMessage(`📄 File "${file.name}" uploaded and analyzed.`, false);
        addMessage(formatBotMessage(result.analysis), false);
      } else {
        addMessage(result.error || '❌ File upload failed.', false);
      }
    } catch (error) {
      addMessage('❌ An error occurred during file upload.', false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Handle file upload from state if needed
    if (uploadedFile && !hasUploadedFromState) {
      processFileUpload(uploadedFile);
      setHasUploadedFromState(true);
    }
  }, [uploadedFile, hasUploadedFromState, processFileUpload]);

  const addMessage = (text: string, isUser: boolean) => {
    setMessages((prev) => [...prev, { text, isUser }]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatBotMessage = (message: string) => {
    return message
      .replace(/---/g, '<hr/>')                                // Add horizontal rule for section separation
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')                  // Bold **text**
      .replace(/__(.*?)__/g, '<b>$1</b>')                      // Bold __text__
      .replace(/\* (.*?)(?=\n|$)/g, '<ul><li>$1</li></ul>')     // Bullet points with * text
      .replace(/^[*-] (.*)/gm, '<li>$1</li>')                  // Bullet point list
      .replace(/\n/g, '<br/>')                                  // Newline to <br>
      .replace(/\n{2,}/g, '<br/><br/>')                         // Two or more newlines become paragraph spacing
      .replace(/([A-Z][a-z]+ [A-Z][a-z]+)(?=\s*[\n\r])/g, '<h4>$1</h4>')  // Add <h4> tags for heading-like text (e.g., job titles, names)
      .replace(/(Bachelor of Science|Sales Associate|Brand Ambassador)/g, '<b>$1</b>') // Bold specific titles for emphasis
      .replace(/(May \d{4})/g, '<i>$1</i>')                    // Italicize specific date formats
      .replace(/(increased sales|improved store appearance|Employee of the Month)/g, '<span style="color: green;">$1</span>') // Highlight key achievements
      // // Increase font size for key points like "Overall Impression"
      // .replace(/(<b>Overall Impression<\/b>)/g, '<h3 style="font-size: 1.5rem; font-weight: bold;">$1</h3>')
      // .replace(/(<b>Formatting Suggestions<\/b>)/g, '<h3 style="font-size: 1.5rem; font-weight: bold;">$1</h3>')
      // .replace(/(<b>Content and Formatting Suggestions<\/b>)/g, '<h3 style="font-size: 1.5rem; font-weight: bold;">$1</h3>')
      // .replace(/(<b>Action Verbs<\/b>)/g, '<h3 style="font-size: 1.5rem; font-weight: bold;">$1</h3>')
      // .replace(/(<b>Quantifiable Results<\/b>)/g, '<h3 style="font-size: 1.5rem; font-weight: bold;">$1</h3>')
      // .replace(/(<b>Revised Resume:<\/b>)/g, '<h3 style="font-size: 1.5rem; font-weight: bold;">$1</h3>');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    addMessage(input, true);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addMessage(formatBotMessage(data.reply) || 'No response from bot.', false);
    } catch (error) {
      addMessage('Error communicating with server.', false);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    processFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-screen">
      <RoleBasedHeader 
        isLoggedIn={true} 
        userName={userName} 
        userRole={userRole}
        onSignOut={async () => {
          await signOut();
          router.push('/');
        }} 
      />
      <div className="flex flex-1 pt-16 overflow-hidden">
        <main className="flex-1 overflow-hidden max-w-4xl w-full mx-auto">
          <div className="h-full overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12" y2="16"></line>
                </svg>
                <h3 className="mt-4 text-lg font-medium">How can I help you today?</h3>
                <p className="mt-1 text-sm">Ask me anything about resumes or upload your resume for analysis.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.isUser 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {msg.isUser ? (
                        msg.text
                      ) : (
                        <div
                          className="prose prose-sm dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: msg.text }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-200 dark:bg-gray-700">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>
      </div>
      <footer className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            placeholder="Message ResonateBot"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
          <input
            type="file"
            accept=".pdf,.docx"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={triggerFileInput}
            className="rounded-md bg-blue-500 px-4 py-3 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="button"
          >
            Upload File
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatbotInterface;
