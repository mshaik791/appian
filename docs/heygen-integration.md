# HeyGen Streaming Avatar Integration

This implementation adopts the HeyGen demo's end-to-end approach for streaming avatars in the OxbridgEducation social work simulation platform.

## Files Created

### 1. Runtime Driver (`src/heygen/runtime.ts`)
- Clean wrapper that mirrors the demo's exact flow
- Handles token creation, connection, and avatar streaming
- Provides `speak()`, `interrupt()`, and `end()` methods
- Uses websocket transport by default (matching demo)

### 2. Configuration Page (`src/app/sim/config/page.tsx`)
- Matches the demo's form UI exactly
- Inputs: Knowledge Base ID, Avatar, Language, Quality, Transport, Voice ID, STT Provider
- Saves values to URL query and sessionStorage
- "Start Voice Chat" button navigates to `/sim/run`

### 3. Run Page (`src/app/sim/run/page.tsx`)
- Reads config from query/sessionStorage
- Mints token via `/api/avatar/session`
- Starts session with `createStartAvatar` and websocket transport
- Simple input to call `.speak(text)` for testing
- Shows status and configuration for debugging

### 4. Integration (`src/app/student/page.tsx`)
- Added "Open Streaming Config" button to student dashboard
- Provides easy access to the new streaming configuration

## Environment Setup

Add to `.env.local`:
```
HEYGEN_API_KEY=YOUR_REAL_KEY
NEXT_PUBLIC_AVATAR_LIVE=true
```

## Usage

1. **Access Config**: Click "Open Streaming Config" on student dashboard
2. **Configure**: Set Knowledge Base ID, Avatar, Voice, Quality, etc.
3. **Start**: Click "Start Voice Chat" to begin streaming session
4. **Test**: Use the Speak button to test avatar responses

## Key Features

- ✅ Exact demo flow replication (no custom abstractions)
- ✅ Stable, non-stuttering video (matches demo behavior)
- ✅ Websocket transport by default
- ✅ Support for both avatar names and IDs
- ✅ Knowledge base integration
- ✅ Voice customization
- ✅ Quality settings (low/medium/high)
- ✅ STT provider selection

## Next Steps

After confirming smooth video performance:
1. Re-attach TurnManager for conversation flow
2. Integrate STT for voice input
3. Connect to existing persona/course assignment system
4. Hide config page and pass values programmatically

The implementation maintains the exact demo plumbing while integrating with the existing database and faculty/admin connections.
