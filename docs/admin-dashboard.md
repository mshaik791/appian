# Admin Dashboard

The Admin Dashboard provides a comprehensive interface for administrators to manage student assignments and track progress.

## Features

### 📊 Dashboard Overview
- **Student Statistics**: Total students, assignments, and competencies
- **Real-time Data**: Live updates of student progress and assignments
- **Visual Cards**: Clean, modern interface with statistics cards

### 👥 Student Management
- **Student Table**: Complete list of all registered students
- **Assignment Status**: Shows current assignments for each student
- **Assignment History**: Timestamp and admin who made each assignment
- **Quick Actions**: One-click assignment creation

### 🎯 Assignment Workflow
1. **Select Student**: Click "Assign Case" button for any student
2. **Choose Competency**: Select from available competency areas
3. **Pick Case**: Choose specific case within the competency
4. **Confirm Assignment**: Complete the assignment process

### 🔒 Security Features
- **Admin-Only Access**: Protected by RBAC middleware
- **API Authentication**: All endpoints require valid admin session
- **Data Validation**: Input validation and error handling
- **Duplicate Prevention**: Unique constraints prevent duplicate assignments

## API Endpoints

### `/api/users?role=STUDENT`
- **Method**: GET
- **Access**: Admin only
- **Returns**: List of students with their assignments

### `/api/assignments`
- **Method**: POST
- **Access**: Admin only
- **Body**: `{ caseId: string, studentId: string }`
- **Returns**: Created assignment with full details

### `/api/competencies`
- **Method**: GET
- **Access**: Admin, Faculty, Student
- **Returns**: List of competencies with case counts

### `/api/competencies/[id]/cases`
- **Method**: GET
- **Access**: Admin, Faculty, Student
- **Returns**: Cases for specific competency

## Usage

1. **Login as Admin**: Use `admin@appian.dev` / `Password123!`
2. **Navigate to Dashboard**: Go to `/admin`
3. **View Students**: See all registered students and their assignments
4. **Assign Cases**: Click "Assign Case" to start assignment process
5. **Track Progress**: Monitor assignment history and student progress

## Components

### `AdminDashboard` (`/app/admin/page.tsx`)
- Main dashboard interface
- Student table with assignment status
- Statistics cards and overview

### `AssignmentModal` (`/components/AssignmentModal.tsx`)
- Two-step assignment process
- Competency and case selection
- Real-time validation and error handling

## Database Schema

The admin dashboard works with the following models:
- **User**: Students, faculty, and admins
- **Assignment**: Links students to cases with admin tracking
- **Case**: Practice scenarios with competencies
- **Competency**: Learning areas (Engagement, Ethics, Diversity)

## Error Handling

- **Authentication Errors**: Redirects to login page
- **Permission Errors**: Shows forbidden messages
- **Validation Errors**: Displays specific error messages
- **Network Errors**: Graceful fallbacks and retry options
