
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { batches, semesters } from '@/lib/dummyData';

const BatchUpdate = () => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const handleUpdate = () => {
    if (!selectedBatch || !selectedSemester) {
      toast({
        title: "Missing Information",
        description: "Please select a batch and semester",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmation(true);
  };
  
  const confirmUpdate = () => {
    setShowConfirmation(false);
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Batch Updated",
        description: `Batch ${selectedBatch} has been updated to ${selectedSemester} semester`,
      });
      
      // Reset form
      setSelectedBatch(null);
      setSelectedSemester(null);
    }, 1000);
  };
  
  const currentBatch = selectedBatch ? 
    batches.find(b => b.id === selectedBatch) : null;
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Update Batch Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Batch</label>
                  <Select value={selectedBatch || ''} onValueChange={setSelectedBatch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} - Current: {batch.current_semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Semester</label>
                  <Select value={selectedSemester || ''} onValueChange={setSelectedSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map(semester => (
                        <SelectItem key={semester} value={semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleUpdate} 
                disabled={isUpdating || !selectedBatch || !selectedSemester}
                className="w-full"
              >
                {isUpdating ? 'Updating...' : 'Update Batch'}
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Current Batches</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Current Semester</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map(batch => (
                      <TableRow key={batch.id}>
                        <TableCell>{batch.name}</TableCell>
                        <TableCell>{batch.current_semester}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Batch Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the batch <strong>{currentBatch?.name}</strong> from {currentBatch?.current_semester} to <strong>{selectedSemester}</strong> semester?
              <p className="mt-2 text-red-500 font-medium">
                This will affect all students in this batch.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={confirmUpdate}>
              Yes, Update
            </AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchUpdate;
