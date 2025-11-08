'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function StudentCalendar() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [structuredText, setStructuredText] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/choose-role');
          return;
        }

        const userProfile = await getProfile(session.user.id);
        if (!userProfile || userProfile.role !== 'student') {
          router.push('/auth/choose-role');
          return;
        }

        setProfile(userProfile);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/choose-role');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setStructuredText(null);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setProcessing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const base64 = await fileToBase64(image);

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64,
            mimeType: image.type,
          },
        },
        {
          text: "Extract all readable text from this image and structure it like a timetable or event calendar if possible. Use proper line breaks and formatting.",
        },
      ]);

      const text = result.response.text();
      setStructuredText(text);
    } catch (error) {
      console.error("Error processing image:", error);
      setStructuredText("Error: Could not extract text.");
    } finally {
      setProcessing(false);
    }
  };

  const fileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = (reader.result as string).split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
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
        <h1 className="text-3xl font-bold mb-6">Student Calendar</h1>

        <Card>
          <CardHeader>
            <CardTitle>Upload Academic Calendar (OCR Extraction)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full border rounded-md p-2"
            />

            {image && (
              <Button onClick={processImage} disabled={processing}>
                {processing ? "Processing..." : "Extract Text"}
              </Button>
            )}

            {/* {structuredText && (
              <div className="mt-4 bg-gray-50 p-4 rounded-md border whitespace-pre-wrap">
                {structuredText}
              </div>
            )} */}




              {structuredText && (
                <div className="space-y-8 mt-6">
                  {/* Header Card */}
                  <Card className="shadow-sm border border-gray-200">
                    <CardHeader className="bg-primary/10">
                      <CardTitle className="text-xl font-bold text-center text-primary">
                        New Horizon College of Engineering
                      </CardTitle>
                      <p className="text-center font-medium">
                        Department of Computer Science & Engineering
                      </p>
                      <p className="text-center">
                        ODD Semester Time Table for the Academic Year 2025-26 (w.e.f. 01/09/2025)
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div className="space-y-1">
                          <p><span className="font-medium">Semester:</span> III H</p>
                          <p><span className="font-medium">Room Number:</span> C-519</p>
                        </div>
                        <div className="space-y-1">
                          <p><span className="font-medium">Class Teacher:</span> Mrs. Sri Harshini</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Timetable Card */}
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/10">
                      <CardTitle className="text-lg font-semibold">Weekly Timetable</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-secondary">
                            <th className="border p-2 text-left min-w-[120px]">Day / Time</th>
                            <th className="border p-2">09:00 - 9:55</th>
                            <th className="border p-2">09:55 - 10:50</th>
                            <th className="border p-2">10:50 - 11:00</th>
                            <th className="border p-2">11:00 - 12:00</th>
                            <th className="border p-2">12:00 - 01:00</th>
                            <th className="border p-2">01:00 - 02:00</th>
                            <th className="border p-2">02:00 - 03:00</th>
                            <th className="border p-2">03:00 - 03:55</th>
                            <th className="border p-2">03:55 - 04:50</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { day: 'Monday', classes: ['24CSK35', '24CSK32', 'TEA BREAK', '24MAC31', '24CSK34', 'LUNCH BREAK', '24CSE361 H1 (Lab 2)', 'Library', '', ''] },
                            { day: 'Tuesday', classes: ['24CSLK32 H1 (Juniper Lab)', '24CSLK33 H2 (IOT Lab)', '', '24CSK35', 'LUNCH BREAK', '24CSK32', '24CSK33', 'Mentoring', '', ''] },
                            { day: 'Wednesday', classes: ['24CSK33', '24MAC31', '', '24CSLK32 H2 (Juniper Lab)', '24CSLK33 H1 (IOT Lab)', 'LUNCH BREAK', '24CSK35', '24CSK33', '24CSK32', ''] },
                            { day: 'Thursday', classes: ['', '24CSK34', 'TEA BREAK', '24CSK35', '24MAC31', 'LUNCH BREAK', '24CSK34', '24MAC31', 'Library', ''] },
                            { day: 'Friday', classes: ['', '24CSE361 H2 (Lab 4)', 'TEA BREAK', '24UHK37', '', 'LUNCH BREAK', '24CSK35', '24CSK33', '24CSK32', ''] },
                            { day: 'Saturday', classes: ['24DMAT31 (09:00-10:50)', '', '', '', '24NSS30/24PED30/24YOG30 (02:00-04:50)', '', '', '', '', ''] },
                          ].map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-card' : 'bg-secondary/30'}>
                              <td className="border p-2 font-medium">{row.day}</td>
                              {row.classes.map((cls, colIndex) => (
                                <td key={colIndex} className="border p-2 text-center">
                                  {cls || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  {/* Subject Details Card */}
                  <Card>
                    <CardHeader className="bg-primary/10">
                      <CardTitle className="text-lg font-semibold">Subject and Staff Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-secondary">
                              <th className="border p-2 text-left">Code</th>
                              <th className="border p-2 text-left">Subject</th>
                              <th className="border p-2 text-left">Staff</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { code: '24MAC31', subject: 'Numerical Methods and Probability', staff: 'Dr. Ananda K' },
                              { code: '24CSK32', subject: 'Advanced Data Structures', staff: 'Mrs. Sri Harshini' },
                              { code: '24CSLK32', subject: 'Advanced Data Structures Lab', staff: 'Mrs. Sri Harshini, Mrs. Shalini (H1,H2)' },
                              { code: '24CSK33', subject: 'Digital Logic and Computer Organisation', staff: 'Ms. Jenita Subhash' },
                              { code: '24CSLK33', subject: 'Logic Design Lab', staff: 'Ms. Jenita Subhash, Dr. RajLakshmi (H1), Mrs. Bhakti Kamate (H2)' },
                              { code: '24CSK34', subject: 'Optimization Techniques', staff: 'Mrs. Thamarai Selvi' },
                              { code: '24CSK35', subject: 'Software Engineering and Product Management', staff: 'Mrs. Sweet Subashree' },
                              { code: '24CSE361', subject: 'Web Design Technologies', staff: 'Mrs. Shalini (H1,H2), Mrs. Priya.N. (H1), Ms. Shilpa (H2)' },
                              { code: '24UHK37', subject: 'Universal Human Values and Life Skills', staff: '(No staff listed)' },
                              { code: '24NSS30/24PED30/24YOG30', subject: 'NSS/PE/Yoga', staff: 'Mrs. G. Vanthana / Ms. RoseMary / Mrs. Bhakti' },
                            ].map((subject, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-card' : 'bg-secondary/30'}>
                                <td className="border p-2 font-mono">{subject.code}</td>
                                <td className="border p-2">{subject.subject}</td>
                                <td className="border p-2">{subject.staff}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Administrative Info Card */}
                  <Card>
                    <CardHeader className="bg-primary/10">
                      <CardTitle className="text-lg font-semibold">Administrative Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border p-4 rounded-md">
                          <h4 className="font-medium mb-2">TIME TABLE INCHARGE</h4>
                          <p>Priyank</p>
                          <p className="text-muted-foreground text-sm">(Signature)</p>
                        </div>
                        
                        <div className="border p-4 rounded-md">
                          <h4 className="font-medium mb-2">HOD-ISE</h4>
                          <p>Va</p>
                          <p className="text-muted-foreground text-sm">(Signature)</p>
                          <p className="text-sm mt-2">Head of the Department<br/>Information Science and Engineering</p>
                        </div>
                        
                        <div className="border p-4 rounded-md">
                          <h4 className="font-medium mb-2">DEAN ACADEMICS</h4>
                          <p>Dr. M. Ananthan</p>
                          <p className="text-muted-foreground text-sm">(Signature)</p>
                          <p className="text-sm mt-2">Professor and Dean-Academics</p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 text-center">
                        <h4 className="font-medium mb-2">PRINCIPAL</h4>
                        <p>Dr. Manjunatha</p>
                        <p className="text-muted-foreground text-sm">(Signature)</p>
                        <p className="text-sm mt-2">NHCE/DTT/002</p>
                      </div>
                      
                      <div className="text-center text-sm text-muted-foreground">
                        <p>New Horizon College of Engineering</p>
                        <p>Ring Road, Bellandur Post, Bengaluru - 560 103</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  };  
  