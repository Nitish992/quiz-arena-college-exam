
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type QuestionData = {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  semester: string;
};

const QuestionUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<QuestionData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // For demo, simulate parsing CSV with dummy data
      setTimeout(() => {
        const dummyPreview: QuestionData[] = [
          { 
            id: 'q10', 
            question: 'What is the time complexity of binary search?', 
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 
            correct_answer: 'B',
            semester: '6th'
          },
          { 
            id: 'q11', 
            question: 'Which of the following is not a valid SQL command?', 
            options: ['SELECT', 'MODIFY', 'UPDATE', 'DELETE'], 
            correct_answer: 'B',
            semester: '6th'
          },
          { 
            id: 'q12', 
            question: 'What does API stand for?', 
            options: ['Application Programming Interface', 'Application Protocol Interface', 'Automated Programming Interface', 'Application Process Integration'], 
            correct_answer: 'A',
            semester: '6th'
          }
        ];
        setPreview(dummyPreview);
      }, 500);
    }
  };
  
  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Questions uploaded successfully",
        description: `${preview.length} questions have been added to the bank`,
      });
      
      // Clear the form
      setFile(null);
      setPreview([]);
    }, 1500);
  };

  const handleDeleteQuestion = (id: string) => {
    setPreview(preview.filter(q => q.id !== id));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Question Bank</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select CSV File</label>
            <Input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange} 
            />
            <p className="text-xs text-gray-500">
              Upload CSV with columns: question, option_a, option_b, option_c, option_d, correct_answer, semester
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
                      <TableHead>Semester</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="max-w-md truncate">{question.question}</TableCell>
                        <TableCell>Option {question.correct_answer}</TableCell>
                        <TableCell>{question.semester}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
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
            disabled={isUploading || preview.length === 0}
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
