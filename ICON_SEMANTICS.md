# Icon Semantics Guide

This document defines the semantic meaning and usage of icons throughout the application to ensure consistency and clarity.

## Navigation & Actions

### Core Actions
- **Plus (+)**: Add new items (intents, responses, training phrases)
- **Trash2**: Delete items (permanent removal)
- **Edit/Pencil**: Edit existing content
- **X**: Close dialogs, dismiss notifications, cancel actions
- **Check**: Confirm, complete, or mark as done

### Navigation
- **ArrowLeft**: Go back, return to previous screen
- **ChevronDown/Up**: Expand/collapse collapsible sections
- **Menu**: Open navigation menu or hamburger menu
- **Home**: Return to dashboard/home page

## Learning & Education

### AI & Training
- **Brain**: AI-related features, intelligence, training
- **GraduationCap**: Training intents, educational content, learning
- **Bot**: Chatbot features, AI assistant
- **Sparkles**: AI magic, special features, enhancements

### Progress & Achievement
- **Trophy**: Achievements, completion rewards
- **Star**: Points, favorites, ratings
- **Target**: Goals, objectives, focus
- **TrendingUp**: Progress, improvement, growth

## Communication

### Messaging
- **MessageSquare**: Intents, messages, chat
- **Send**: Submit messages, send data
- **Mic/MicOff**: Voice input (active/inactive)
- **Volume2/VolumeX**: Audio output (enabled/disabled)

### Information
- **HelpCircle**: Help, tutorials, information
- **Info**: Additional information, tooltips
- **Lightbulb**: Tips, suggestions, ideas
- **AlertCircle**: Warnings, attention needed

## Media & Input

### Audio/Visual
- **Camera**: Image capture, visual features
- **Mic**: Voice input, speech recognition
- **Volume2**: Text-to-speech, audio output
- **Play**: Start, resume, preview
- **StopCircle**: Stop, pause

### Content Types
- **FileText**: Documents, text content
- **Image**: Pictures, visual media
- **Video**: Video content

## Settings & Configuration

### System
- **Settings**: Configuration, preferences
- **Globe**: Language, internationalization, web
- **Zap**: Quick actions, shortcuts, energy
- **Layout**: UI layout, arrangement

### User
- **User**: Profile, account, individual user
- **Users**: Team, group, multiple people

## Status & Feedback

### States
- **Check**: Success, completed
- **X**: Error, failed, closed
- **AlertTriangle**: Warning, caution
- **Loader**: Loading, processing

### Progress
- **Clock**: Time, history, duration
- **Calendar**: Dates, scheduling
- **RotateCcw**: Refresh, reset, undo

## Color Associations

- **Blue**: Information, training phrases, primary actions
- **Green**: Success, responses, positive actions
- **Red**: Errors, destructive actions, deletion
- **Orange**: Warnings, important notices
- **Purple**: Premium features, special content
- **Yellow**: Achievements, highlights, points

## Usage Guidelines

1. **Consistency**: Always use the same icon for the same action across the application
2. **Tooltips**: Include descriptive tooltips for all icon-only buttons
3. **ARIA Labels**: Provide aria-label attributes for screen reader accessibility
4. **Size**: Use consistent sizes within the same context (h-4 w-4 for inline, h-5 w-5 for buttons)
5. **Color**: Use semantic colors to reinforce meaning (destructive actions = red)
6. **Context**: Icons should make sense in their context - don't use Brain icon for unrelated actions

## Common Mistakes to Avoid

❌ **Don't** use Brain icon for navigation
❌ **Don't** use Plus icon for deletion
❌ **Don't** use different icons for the same action
❌ **Don't** rely solely on icons without tooltips or labels
❌ **Don't** use color as the only indicator of meaning

✅ **Do** use MessageSquare for chat/intents consistently
✅ **Do** use GraduationCap specifically for training features
✅ **Do** pair icons with text labels for clarity
✅ **Do** use semantic colors (red for delete, green for success)
✅ **Do** provide alternative text for accessibility
