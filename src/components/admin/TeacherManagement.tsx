
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type TeacherData = {
  id: string;
  name: string;
  username: string;
};

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    teacherId: '',
    newPassword: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          staff_credentials:id (
            username
          )
        `)
        .eq('role', 'teacher');

      if (error) throw error;

      if (data) {
        const formattedTeachers: TeacherData[] = data.map(item => ({
          id: item.id,
          name: item.name,
          username: item.staff_credentials ? (item.staff_credentials as any).username : ''
        }));
        
        setTeachers(formattedTeachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teacher accounts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeacher.name || !newTeacher.username || !newTeacher.password) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Create new authentication account
      const email = `${newTeacher.username}@example.com`;
      
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email,
        password: newTeacher.password,
        options: {
          data: {
            name: newTeacher.name,
            role: 'teacher',
            username: newTeacher.username
          }
        }
      });
      
      if (userError) throw userError;
      
      toast({
        title: 'Success',
        description: 'Teacher account created successfully'
      });
      
      setNewTeacher({ name: '', username: '', password: '' });
      fetchTeachers();
      
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create teacher account',
        variant: 'destructive'
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetPasswordData.teacherId || !resetPasswordData.newPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please select a teacher and enter a new password',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('staff_credentials')
        .update({ 
          password_hash: resetPasswordData.newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', resetPasswordData.teacherId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Password reset successful'
      });
      
      setResetPasswordData({ teacherId: '', newPassword: '' });
      
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Teacher Account Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Teacher Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacherName">Teacher Name</Label>
                <Input
                  id="teacherName"
                  placeholder="Full name"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Username for login"
                  value={newTeacher.username}
                  onChange={(e) => setNewTeacher({...newTeacher, username: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                />
              </div>
              
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Reset Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Teacher Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacherSelect">Select Teacher</Label>
                <select
                  id="teacherSelect"
                  className="w-full p-2 border rounded"
                  value={resetPasswordData.teacherId}
                  onChange={(e) => setResetPasswordData({...resetPasswordData, teacherId: e.target.value})}
                >
                  <option value="">Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.username})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="New password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                />
              </div>
              
              <Button type="submit" className="w-full" variant="outline">Reset Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Teacher List */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : teachers.length === 0 ? (
            <p>No teacher accounts found.</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map(teacher => (
                    <tr key={teacher.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{teacher.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{teacher.username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;
