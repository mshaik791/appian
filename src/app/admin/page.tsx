'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  UserPlus, 
  Loader2,
  Mail,
  GraduationCap,
  Clock
} from 'lucide-react';
import { AssignmentModal } from '@/components/AssignmentModal';

interface Student {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  assignedCases: Array<{
    id: string;
    case: {
      id: string;
      title: string;
      competency: {
        name: string;
      };
    };
    admin: {
      email: string;
    };
    createdAt: string;
  }>;
}

interface Competency {
  id: string;
  name: string;
  desc: string;
  _count: {
    cases: number;
  };
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students with their assignments
        const studentsResponse = await fetch('/api/users?role=STUDENT', {
          credentials: 'include',
        });
        
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students');
        }
        
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);

        // Fetch competencies for assignment modal
        const competenciesResponse = await fetch('/api/competencies', {
          credentials: 'include',
        });
        
        if (!competenciesResponse.ok) {
          throw new Error('Failed to fetch competencies');
        }
        
        const competenciesData = await competenciesResponse.json();
        setCompetencies(competenciesData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignCase = (student: Student) => {
    setSelectedStudent(student);
    setIsAssignmentModalOpen(true);
  };

  const handleAssignmentComplete = () => {
    // Refresh students data to show new assignment
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/users?role=STUDENT', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (err) {
        console.error('Error refreshing students:', err);
      }
    };
    
    fetchStudents();
    setIsAssignmentModalOpen(false);
    setSelectedStudent(null);
  };

  const handleCloseModal = () => {
    setIsAssignmentModalOpen(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          <p className="text-xl mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage student assignments and track progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((total, student) => total + student.assignedCases.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cases assigned to students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competencies</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competencies.length}</div>
            <p className="text-xs text-muted-foreground">
              Available competency areas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No students found</p>
              <p className="text-sm">Students will appear here once they register</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Student</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Assigned Cases</th>
                    <th className="text-left p-4 font-medium">Assignment History</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {student.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {student.email.split('@')[0]}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Student
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{student.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {student.assignedCases.length === 0 ? (
                            <Badge variant="outline" className="text-gray-500">
                              No assignments
                            </Badge>
                          ) : (
                            student.assignedCases.map((assignment) => (
                              <Badge 
                                key={assignment.id} 
                                variant="secondary"
                                className="text-xs"
                              >
                                {assignment.case.title}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {student.assignedCases.length === 0 ? (
                            <p className="text-sm text-gray-500">No assignments yet</p>
                          ) : (
                            student.assignedCases.map((assignment) => (
                              <div key={assignment.id} className="text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(assignment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  by {assignment.admin.email}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          onClick={() => handleAssignCase(student)}
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Assign Case
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      {selectedStudent && (
        <AssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={handleCloseModal}
          onComplete={handleAssignmentComplete}
          student={selectedStudent}
          competencies={competencies}
        />
      )}
    </div>
  );
}