'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, Eye, Heart, Search, Lock, Star } from "lucide-react";
import { getNotes, createNote, uploadNoteFile, trackNoteView, trackNoteDownload, toggleFavorite, getFavoriteNotes, type Note } from "@/lib/notes-api";
import { cn } from "@/lib/utils";

export default function StudentNotes() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [showMyNotes, setShowMyNotes] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    tags: "",
    isPrivate: false,
    file: null as File | null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/choose-role');
          return;
        }

        const userProfile = await getProfile(session.user.id);
        if (userProfile?.role !== 'student') {
          router.push('/auth/choose-role');
          return;
        }

        setProfile(userProfile);
        await loadNotes();
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/auth/choose-role');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadNotes = async () => {
    try {
      let notesData;
      if (showFavorites) {
        notesData = await getFavoriteNotes();
      } else if (showMyNotes) {
        notesData = await getNotes({ onlyMyNotes: true });
      } else {
        notesData = await getNotes();
      }
      setNotes(notesData);
      setFilteredNotes(notesData);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [showMyNotes, showFavorites]);

  useEffect(() => {
    let filtered = notes;

    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter(note => note.subject === selectedSubject);
    }

    setFilteredNotes(filtered);
  }, [searchQuery, selectedSubject, notes]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !profile) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { url } = await uploadNoteFile(uploadForm.file, user.id);

      await createNote({
        title: uploadForm.title,
        description: uploadForm.description,
        subject: uploadForm.subject,
        tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : [],
        file_url: url,
        file_name: uploadForm.file.name,
        file_type: uploadForm.file.type,
        file_size: uploadForm.file.size,
        is_private: uploadForm.isPrivate,
        is_published: false,
        uploader_role: 'student',
        uploader_name: profile.full_name
      });

      setShowUploadDialog(false);
      setUploadForm({
        title: "",
        description: "",
        subject: "",
        tags: "",
        isPrivate: false,
        file: null
      });
      await loadNotes();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload note');
    } finally {
      setUploading(false);
    }
  };

  const handleViewNote = async (note: Note) => {
    setViewingNote(note);
    await trackNoteView(note.id);
  };

  const handleDownload = async (note: Note) => {
    await trackNoteDownload(note.id);
    window.open(note.file_url, '_blank');
  };

  const handleToggleFavorite = async (noteId: string, currentlyFavorited: boolean) => {
    try {
      await toggleFavorite(noteId, !currentlyFavorited);
      await loadNotes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const subjects = Array.from(new Set(notes.map(n => n.subject).filter(Boolean)));

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-16 w-full" />
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader 
        isLoggedIn={true} 
        userName={profile?.full_name || 'Student'} 
        userRole="student"
        onSignOut={handleSignOut} 
      />
      <main className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Student Notes</h1>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Note
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant={showMyNotes ? "default" : "outline"}
            onClick={() => {
              setShowMyNotes(!showMyNotes);
              setShowFavorites(false);
            }}
          >
            My Notes
          </Button>
          <Button
            variant={showFavorites ? "default" : "outline"}
            onClick={() => {
              setShowFavorites(!showFavorites);
              setShowMyNotes(false);
            }}
          >
            <Star className="mr-2 h-4 w-4" />
            Favorites
          </Button>
        </div>

        {/* Subject Filter */}
        {subjects.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={selectedSubject === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject("")}
            >
              All Subjects
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject || "")}
              >
                {subject}
              </Button>
            ))}
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(note.id, note.is_favorite)}
                  >
                    <Heart className={cn("h-4 w-4", note.is_favorite && "fill-red-500 text-red-500")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {note.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{note.description}</p>
                )}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {note.is_private && (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  {note.is_published && (
                    <Badge variant="default">Published</Badge>
                  )}
                  {note.subject && <Badge variant="outline">{note.subject}</Badge>}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{note.uploader_name}</span>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {note.views_count}
                  </span>
                  <span className="flex items-center">
                    <Download className="h-3 w-3 mr-1" />
                    {note.downloads_count}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewNote(note)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => handleDownload(note)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No notes found</p>
            </CardContent>
          </Card>
        )}

        {/* Upload Dialog */}
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Upload Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="Enter note title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Enter note description"
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Physics"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="e.g., algebra, calculus"
                  />
                </div>
                <div>
                  <Label htmlFor="file">File * (PDF, DOCX, PPTX - Max 50MB)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={handleFileSelect}
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={uploadForm.isPrivate}
                    onChange={(e) => setUploadForm({ ...uploadForm, isPrivate: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="private" className="cursor-pointer">
                    Make this note private (only you can see it)
                  </Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowUploadDialog(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleUpload}
                    disabled={!uploadForm.file || !uploadForm.title || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Note Dialog */}
        {viewingNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{viewingNote.title}</CardTitle>
                    {viewingNote.description && (
                      <p className="text-sm text-muted-foreground mt-2">{viewingNote.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" onClick={() => setViewingNote(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <iframe
                  src={viewingNote.file_url}
                  className="w-full h-full border rounded"
                  title={viewingNote.title}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
