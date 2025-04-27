
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

type QuestionData = {
  id?: string;
  question: string;
  options: string[];
  correct_answer: string;
  subject_id: string;
  semester: string;
};

type Subject = {
  id: string;
  name: string;
  semester: string;
};

const QuestionUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<QuestionData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [semester, setSemester] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch subjects from Supabase
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: "Error",
          description: "Failed to load subjects. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setSubjects(data || []);
      
      // Extract unique semesters
      const uniqueSemesters = Array.from(new Set(data?.map(s => s.semester) || []));
      setSemesters(uniqueSemesters.sort());
    }
    
    fetchSubjects();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const csvData = evt.target.result as string;
          const parsedQuestions = parseCSV(csvData);
          setPreview(parsedQuestions);
        }
      };
      reader.readAsText(selectedFile);
    }
  };
  
  const parseCSV = (csv: string): QuestionData[] => {
    const lines = csv.split('\n');
    const result: QuestionData[] = [];
    
    // Skip header row if it exists
    const startIdx = lines[0].includes('question') ? 1 : 0;
    
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      if (values.length >= 6) {
        const question = values[0];
        const optionA = values[1];
        const optionB = values[2];
        const optionC = values[3];
        const optionD = values[4];
        const correct = values[5].toUpperCase();
        
        if (question && optionA && optionB && optionC && optionD && correct) {
          result.push({
            question,
            options: [optionA, optionB, optionC, optionD],
            correct_answer: correct,
            subject_id: subject,
            semester: semester
          });
        }
      }
    }
    
    return result;
  };
  
  const handleUpload = async () => {
    if (!subject) {
      toast({
        title: "Missing Information",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }
    
    if (!semester) {
      toast({
        title: "Missing Information",
        description: "Please select a semester",
        variant: "destructive",
      });
      return;
    }
    
    if (preview.length === 0) {
      toast({
        title: "No Questions",
        description: "Please upload a CSV file with questions",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Format the options as a JSON object for each question
      const formattedQuestions = preview.map(q => ({
        ...q,
        options: q.options
      }));
      
      const { data, error } = await supabase
        .from('questions')
        .insert(formattedQuestions)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Questions Uploaded",
        description: `${data.length} questions have been added to the bank`,
      });
      
      // Clear the form
      setFile(null);
      setPreview([]);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred while uploading questions",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedPreview = [...preview];
    updatedPreview.splice(index, 1);
    setPreview(updatedPreview);
  };

  // Filter subjects based on selected semester
  const filteredSubjects = semester 
    ? subjects.filter(s => s.semester === semester)
    : subjects;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Question Bank</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Semester</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map(sem => (
                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Subject</label>
              <Select value={subject} onValueChange={setSubject} disabled={!semester}>
                <SelectTrigger>
                  <SelectValue placeholder={semester ? "Select subject" : "Select semester first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium">Select CSV File</label>
            <Input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange} 
            />
            <p className="text-xs text-gray-500">
              Upload CSV with columns: question, option_a, option_b, option_c, option_d, correct_answer (A, B, C, or D)
            </p>
          </div>
          
          {preview.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preview ({preview.length} questions)</h3>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Correct Answer</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((question, index) => (
                      <TableRow key={index}>
                        <TableCell className="max-w-md truncate">{question.question}</TableCell>
                        <TableCell>Option {question.correct_answer}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteQuestion(index)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || preview.length === 0 || !subject || !semester}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Questions'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionUpload;
