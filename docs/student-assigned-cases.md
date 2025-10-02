# Student Assigned Cases Feature

The Student Dashboard now includes a dedicated section for viewing and interacting with assigned cases, providing a seamless experience for students to access their assigned scenarios.

## Features

### 📋 Assigned Cases Section
- **Prominent Display**: Assigned cases appear at the top of the student dashboard
- **Visual Distinction**: Green-themed cards with "Assigned" badges
- **Assignment Details**: Shows who assigned the case and when
- **Conditional Visibility**: Only appears when assignments exist

### 🎯 Case Cards
Each assigned case card displays:
- **Case Title & Description**: Clear scenario information
- **Competency Badge**: Shows which competency area the case belongs to
- **Assignment Info**: Admin who assigned it and assignment date
- **Persona List**: Available personas with avatars and start buttons
- **Direct Action**: "Start" button for each persona

### 🎮 Simulation Flow
- **Mode Selection**: Clicking "Start" opens the mode selection modal
- **Learning vs Assessment**: Students choose their preferred mode
- **Direct Launch**: Seamless transition to simulation chat
- **Same Experience**: Identical to browsing competencies freely

## API Integration

### `/api/assignments` (GET)
- **Authentication**: Requires valid student session
- **Filtering**: Automatically filters to current student's assignments
- **Data**: Returns full case details with personas and assignment metadata
- **Security**: Students can only see their own assignments

### Response Structure
```json
[
  {
    "id": "assignment_id",
    "case": {
      "id": "case_id",
      "title": "Case Title",
      "description": "Case description",
      "competency": { "name": "Competency Name" },
      "personas": [
        {
          "id": "persona_id",
          "name": "Persona Name",
          "avatarId": "avatar_id",
          "voiceId": "voice_id"
        }
      ]
    },
    "admin": { "email": "admin@example.com" },
    "createdAt": "2025-01-10T00:00:00.000Z"
  }
]
```

## User Experience

### 🎨 Visual Design
- **Gradient Themes**: Each competency has its own color scheme
- **Hover Effects**: Smooth animations and visual feedback
- **Loading States**: Skeleton screens while data loads
- **Responsive**: Works on all screen sizes

### 📱 Layout Structure
1. **Header**: "Student Dashboard" with sparkle icons
2. **Assigned Cases**: Green-themed section (if assignments exist)
3. **Browse Competencies**: Blue-themed section for free exploration
4. **Mode Modal**: Appears when starting simulations

### 🔄 State Management
- **Loading States**: Separate loading for assigned cases and competencies
- **Error Handling**: Graceful fallbacks for API failures
- **Real-time Updates**: Refreshes after completing simulations

## Security & Permissions

### 🔐 Access Control
- **Student Only**: Only students can see their assigned cases
- **Session Required**: All API calls require valid authentication
- **Data Isolation**: Students cannot see other students' assignments

### 🛡️ Data Validation
- **Input Validation**: All API inputs validated with Zod
- **Error Handling**: Proper HTTP status codes and error messages
- **Type Safety**: Full TypeScript support throughout

## Usage Flow

1. **Student Login**: Student logs in with valid credentials
2. **Dashboard Load**: System fetches competencies and assignments
3. **Assigned Cases**: If assignments exist, they appear prominently
4. **Case Selection**: Student clicks "Start" on any persona
5. **Mode Selection**: Student chooses Learning or Assessment mode
6. **Simulation Start**: Redirects to chat interface
7. **Progress Tracking**: Faculty can monitor student progress

## Benefits

### 👨‍🎓 For Students
- **Clear Priorities**: Assigned cases are prominently displayed
- **Easy Access**: One-click to start assigned scenarios
- **Context Awareness**: Know who assigned what and when
- **Flexible Learning**: Can still browse all competencies freely

### 👨‍🏫 For Faculty
- **Assignment Tracking**: See which students have assignments
- **Progress Monitoring**: Track completion of assigned cases
- **Flexible Teaching**: Assign specific cases while allowing exploration

### 👨‍💼 For Admins
- **Assignment Management**: Full control over case assignments
- **Student Oversight**: Monitor all student assignments
- **System Administration**: Manage the assignment workflow

## Technical Implementation

### 🏗️ Architecture
- **Client-Side**: React hooks for state management
- **API Layer**: RESTful endpoints with proper authentication
- **Database**: Prisma ORM with PostgreSQL
- **UI Components**: shadcn/ui with Tailwind CSS

### 🔧 Key Components
- **StudentDashboard**: Main page component
- **ModeSelectionModal**: Reused from competency browsing
- **Assignment Cards**: Custom cards with persona integration
- **API Routes**: Secure endpoints with RBAC

The Student Assigned Cases feature provides a comprehensive solution for managing assigned scenarios while maintaining the flexibility of free exploration.
