# HeyGen Interactive Avatar Demo

This document describes the HeyGen Interactive Avatar SDK demo that has been mounted under `/demo` in the main application.

## Overview

The HeyGen Interactive Avatar SDK demo is a standalone Next.js application that has been integrated into the main appian application under the `/demo` route. This allows users to test and interact with HeyGen's streaming avatar technology without leaving the main application.

## Access Points

### Demo Pages
- **Main Demo**: `/demo` - The primary demo interface with avatar configuration and interaction
- **Demo Home**: `/demo` - Renders the InteractiveAvatar component with full functionality

### Demo API Routes
- **Token Endpoint**: `/demo/api/get-access-token` - POST endpoint for obtaining HeyGen API tokens
  - Method: POST
  - Returns: Access token string
  - Requires: `HEYGEN_API_KEY` environment variable

## Environment Variables

The demo requires the following environment variables to be set:

```bash
HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
```

These should be configured in your `.env.local` file.

### Getting Your HeyGen API Key

1. **Sign up for HeyGen**: Visit [app.heygen.com](https://app.heygen.com) and create an account
2. **Navigate to API Settings**: Go to [app.heygen.com/settings?nav=API](https://app.heygen.com/settings?nav=API)
3. **Get your API Key**: Copy your API key from the settings page
4. **Update .env.local**: Replace `your_heygen_api_key_here` with your actual API key

**Note**: API Keys are reserved for Enterprise customers. For testing purposes, you can use trial tokens which have limited concurrent sessions (3 max).

## Static Assets

All demo static assets are namespaced under `/public/demo/` to avoid conflicts with the main application:

- `/demo/heygen-logo.png` - HeyGen logo
- `/demo/demo.png` - Demo screenshot/image

## Architecture

### Route Structure
```
src/app/demo/(heygen-demo)/
├── layout.tsx          # Demo-specific layout with isolated styles
├── page.tsx            # Main demo page
├── api/
│   └── get-access-token/
│       └── route.ts    # Token generation endpoint
└── lib/
    └── constants.ts    # Demo constants and configuration
```

### Components
```
src/components/demo/
├── InteractiveAvatar.tsx    # Main demo component
├── AvatarConfig/           # Avatar configuration UI
├── AvatarSession/          # Avatar interaction components
├── logic/                  # Demo business logic and hooks
└── [other components]      # Supporting UI components
```

### Styles
```
src/styles/demo/
└── globals.css             # Demo-specific Tailwind CSS
```

## Key Features

1. **Avatar Configuration**: Users can configure avatar settings including:
   - Avatar selection from available options
   - Voice settings (rate, emotion, model)
   - STT (Speech-to-Text) settings
   - Language selection

2. **Interactive Modes**:
   - **Voice Chat**: Real-time voice conversation with the avatar
   - **Text Chat**: Text-based interaction with the avatar

3. **Real-time Streaming**: Uses HeyGen's streaming avatar technology for low-latency interactions

## Dependencies

The demo uses the following key dependencies (already included in main package.json):

- `@heygen/streaming-avatar` - HeyGen's streaming avatar SDK
- `ahooks` - React hooks library
- `@radix-ui/react-*` - UI component primitives
- `openai` - OpenAI API integration

## Integration Notes

### Isolation
- The demo is completely isolated from the main application
- Uses its own layout, styles, and components
- API routes are namespaced under `/demo/api/*`
- Static assets are namespaced under `/public/demo/*`

### Path Mapping
- Demo components use `@/*` path mapping which resolves to `./src/*`
- All imports have been updated to use the correct paths within the demo namespace

### Styling
- Demo uses Tailwind CSS with its own `globals.css` file
- Styles are imported only in the demo layout to prevent conflicts
- Uses dark theme with black background

## Usage

1. Start the development server: `pnpm dev`
2. Navigate to `/demo` in your browser
3. Configure your avatar settings
4. Choose between Voice Chat or Text Chat
5. Interact with the avatar in real-time

## Troubleshooting

### Common Issues

1. **Token Generation Fails**: Ensure `HEYGEN_API_KEY` is set in your environment
2. **Avatar Not Loading**: Check browser console for WebSocket connection errors
3. **Styling Issues**: Verify that demo styles are properly isolated

### Debug Information

The demo includes extensive console logging for debugging:
- Avatar session events
- Token generation
- WebSocket connections
- User interactions

## Differences from Upstream

This mounted version differs from the original standalone demo in the following ways:

1. **Path Namespacing**: All routes and assets are prefixed with `/demo`
2. **Component Isolation**: Components are located in `src/components/demo/`
3. **Style Isolation**: Styles are imported only in the demo layout
4. **API Namespacing**: API routes are under `/demo/api/*`

## Future Considerations

- Consider adding authentication/authorization for demo access
- Monitor performance impact of running both apps simultaneously
- Consider extracting demo into a separate microservice if needed
