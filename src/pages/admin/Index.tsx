
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import UserUpload from '@/components/admin/UserUpload';
import BatchUpdate from '@/components/admin/BatchUpdate';

const AdminDashboard = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-quiz-primary">College Quiz Arena</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Admin: {profile.name} ({profile.roll_number})
            </span>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="users" className="px-4">User Management</TabsTrigger>
                <TabsTrigger value="batches" className="px-4">Batch Management</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="users" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
              </div>
              
              <UserUpload />
            </TabsContent>
            
            <TabsContent value="batches" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Batch Management</h2>
              </div>
              
              <BatchUpdate />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
