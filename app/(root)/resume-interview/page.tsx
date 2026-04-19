'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ResumeInterviewPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();

        if (data.userId) {
          setUserId(data.userId);
        } else {
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/sign-in');
      }
    };

    checkAuth();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please upload a resume PDF');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      if (userId) {
        formData.append('userId', userId);
      }

      const response = await fetch('/api/resume-interview', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate interview');
      }

      if (data.interviewId) {
        router.push(`/interview/${data.interviewId}`);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-[#1a1a1a]/70 backdrop-blur-md rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Resume-Based Interview</h1>

        <p className="text-gray-300 mb-6 text-center">
          Upload your resume to generate an interview based on your skills and experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-colors">
            <input
              type="file"
              id="resume"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <label htmlFor="resume" className="cursor-pointer flex flex-col items-center">
              <Image 
                src="/upload-icon.png" 
                alt="Upload" 
                width={64} 
                height={64} 
                className="mb-4"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVwbG9hZC1jbG91ZCI+PHBhdGggZD0iTTQgMTQuODk5QTcgNyAwIDEgMSAxNS43MSA4IiAvPjxwYXRoIGQ9Ik0xMiAxMnYxMCIgLz48cGF0aCBkPSJtMTYgMTYtNCA0LTQtNCIgLz48L3N2Zz4=';
                }}
              />
              <span className="text-sm text-gray-300">
                {file ? file.name : 'Click to upload your resume (PDF)'}
              </span>
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="btn-primary w-full py-3"
            disabled={loading || !file}
          >
            {loading ? 'Generating Interview...' : 'Generate Interview'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResumeInterviewPage;
