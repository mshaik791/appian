# Faculty Progress Tracking Feature

The Faculty Progress Tracking page provides comprehensive visibility into student progress on assigned cases, enabling faculty to monitor completion status, track engagement, and identify students who may need additional support.

## Features

### 📊 Progress Dashboard
- **Overview Statistics**: Total students, assignments, completion rates
- **Visual Metrics**: Cards showing key performance indicators
- **Real-time Data**: Live updates on student progress

### 👥 Student Progress Overview
- **Student List**: All students with assigned cases
- **Assignment Status**: Clear indicators for each assigned case
- **Completion Tracking**: Visual status for each assignment

### 🎯 Assignment Status Indicators
- **Not Started**: Gray indicator with clock icon
- **In Progress**: Blue indicator with trending icon
- **Completed**: Green indicator with checkmark icon

### 📈 Detailed Progress Information
- **Case Information**: Title, competency, assignment date
- **Simulation Details**: Mode (Learning/Assessment), status, message count
- **Timeline**: Start and completion dates
- **Engagement Metrics**: Number of messages exchanged

## API Integration

### `/api/faculty/progress` (GET)
- **Authentication**: Requires valid faculty/admin session
- **Authorization**: Only FACULTY and ADMIN roles can access
- **Data Structure**: Returns comprehensive student progress data

### Response Structure
```json
[
  {
    "student": {
      "id": "student_id",
      "email": "student@example.com"
    },
    "assignments": [
      {
        "id": "assignment_id",
        "case": {
          "id": "case_id",
          "title": "Case Title",
          "competency": { "name": "Competency Name" }
        },
        "createdAt": "2025-01-10T00:00:00.000Z",
        "simulations": [
          {
            "id": "simulation_id",
            "mode": "learning",
            "status": "active",
            "startedAt": "2025-01-10T00:00:00.000Z",
            "endedAt": null,
            "turns": [
              {
                "id": "turn_id",
                "speaker": "student",
                "createdAt": "2025-01-10T00:00:00.000Z"
              }
            ]
          }
        ]
      }
    ]
  }
]
```

## User Interface

### 🎨 Visual Design
- **Competency Themes**: Color-coded cards based on competency areas
- **Status Badges**: Clear visual indicators for assignment status
- **Responsive Layout**: Works on all screen sizes
- **Loading States**: Skeleton screens while data loads

### 📱 Layout Structure
1. **Header**: Page title and description
2. **Statistics Cards**: Key metrics overview
3. **Student Progress**: Detailed progress for each student
4. **Assignment Cards**: Individual case progress with status

### 🔄 Interactive Elements
- **Hover Effects**: Smooth animations on cards
- **Status Indicators**: Color-coded completion status
- **Progress Bars**: Visual representation of completion rates

## Data Processing

### 📊 Statistics Calculation
- **Total Students**: Count of all students with assignments
- **Total Assignments**: Sum of all assigned cases
- **Completed Assignments**: Cases with ended simulations
- **In Progress Assignments**: Cases with active simulations
- **Completion Rate**: Percentage of completed assignments

### 🎯 Status Logic
```typescript
const getCompletionStatus = (assignment) => {
  if (assignment.simulations.length === 0) {
    return { status: 'not-started', label: 'Not Started', color: 'gray' };
  }
  
  const hasEndedSimulation = assignment.simulations.some(sim => sim.status === 'ended');
  const hasActiveSimulation = assignment.simulations.some(sim => sim.status === 'active');
  
  if (hasEndedSimulation) {
    return { status: 'completed', label: 'Completed', color: 'green' };
  } else if (hasActiveSimulation) {
    return { status: 'in-progress', label: 'In Progress', color: 'blue' };
  } else {
    return { status: 'not-started', label: 'Not Started', color: 'gray' };
  }
};
```

## Security & Permissions

### 🔐 Access Control
- **Role-Based Access**: Only FACULTY and ADMIN roles
- **Session Validation**: JWT token verification required
- **Data Isolation**: Faculty can see all student progress

### 🛡️ Data Security
- **Input Validation**: All API inputs validated
- **Error Handling**: Proper HTTP status codes
- **Type Safety**: Full TypeScript support

## Database Queries

### 📋 Data Retrieval Strategy
1. **Students Query**: Get all students with their assignments
2. **Simulations Query**: Get all simulations for these students
3. **Data Grouping**: Group simulations by student and case
4. **Response Transformation**: Format data for frontend consumption

### 🔍 Query Optimization
- **Efficient Joins**: Minimal database queries
- **Data Grouping**: Client-side grouping for performance
- **Selective Fields**: Only fetch required data
- **Proper Indexing**: Database indexes on key fields

## Usage Flow

1. **Faculty Login**: Faculty logs in with valid credentials
2. **Navigation**: Navigate to `/faculty/progress`
3. **Data Loading**: System fetches student progress data
4. **Progress Review**: Faculty reviews student progress
5. **Status Monitoring**: Track completion and engagement
6. **Support Identification**: Identify students needing help

## Benefits

### 👨‍🏫 For Faculty
- **Progress Visibility**: Clear view of student progress
- **Early Intervention**: Identify struggling students
- **Engagement Tracking**: Monitor student participation
- **Assignment Management**: Track case completion

### 👨‍🎓 For Students
- **Transparent Progress**: Faculty can provide targeted support
- **Accountability**: Clear expectations for completion
- **Feedback Loop**: Faculty can provide timely feedback

### 👨‍💼 For Administrators
- **System Overview**: Monitor overall system usage
- **Performance Metrics**: Track completion rates
- **Resource Planning**: Identify popular cases and competencies

## Technical Implementation

### 🏗️ Architecture
- **Client-Side**: React hooks for state management
- **API Layer**: RESTful endpoints with authentication
- **Database**: Prisma ORM with PostgreSQL
- **UI Components**: shadcn/ui with Tailwind CSS

### 🔧 Key Components
- **FacultyProgressPage**: Main page component
- **Progress Cards**: Individual student progress display
- **Statistics Cards**: Overview metrics
- **Status Indicators**: Visual completion status

### 📊 Data Flow
1. **Page Load**: Fetch student progress data
2. **Data Processing**: Calculate statistics and status
3. **UI Rendering**: Display progress cards and metrics
4. **Real-time Updates**: Refresh data as needed

## Error Handling

### 🚨 Error States
- **Loading State**: Skeleton screens while loading
- **Error State**: Clear error messages with retry options
- **Empty State**: Helpful message when no data exists
- **Network Errors**: Graceful handling of API failures

### 🔄 Recovery Options
- **Retry Button**: Manual refresh capability
- **Auto-refresh**: Periodic data updates
- **Fallback UI**: Graceful degradation
- **User Feedback**: Clear error messages

The Faculty Progress Tracking feature provides comprehensive visibility into student progress, enabling faculty to monitor assignments, track completion, and provide targeted support to students as needed.
