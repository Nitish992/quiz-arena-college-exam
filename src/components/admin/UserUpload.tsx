
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type UserData = {
  roll_number: string;
  name: string;
  role: string;
  dob?: string;
  semester?: string;
  batch?: string;
  email?: string;
};

const UserUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<UserData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // For demo, simulate parsing CSV with dummy data
      setTimeout(() => {
        const dummyPreview: UserData[] = [
          { roll_number: 'CS23B001', name: 'John Smith', role: 'student', dob: '2000-05-10', semester: '6th', batch: '2023-26' },
          { roll_number: 'CS23B002', name: 'Emily Johnson', role: 'student', dob: '2000-07-22', semester: '6th', batch: '2023-26' },
          { roll_number: 'prof456', name: 'Dr. Robert Chen', role: 'teacher', email: 'robert.chen@college.edu' },
          { roll_number: 'prof789', name: 'Dr. Lisa Wong', role: 'teacher', email: 'lisa.wong@college.edu' },
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
        title: "Users uploaded successfully",
        description: `${preview.length} users have been added to the system`,
      });
      
      // Clear the form
      setFile(null);
      setPreview([]);
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload User Data</CardTitle>
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
            <p className="text-xs text-gray-500">Upload CSV file with user data (students or teachers)</p>
          </div>
          
          {preview.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preview (First {preview.length} rows)</h3>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Other Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>{user.roll_number}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          {user.role === 'student' ? 
                            `${user.batch}, ${user.semester} Semester` : 
                            user.email}
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
            {isUploading ? 'Uploading...' : 'Upload Users'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserUpload;
