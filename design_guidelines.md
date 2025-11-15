# Morrow Design Guidelines

## Design Approach
**Reference-Based Design**: Inspired by Cleo's warm, friendly financial coaching aesthetic, adapted for comprehensive mobile-first personal finance app.

## Visual Identity

### Color Palette
- **Background**: Soft beige (#F5F0EB) - primary background throughout app
- **Text**: Deep brown (#3C2220) - primary text color
- **Accent**: Warm orange (#FFB65C) - CTAs, highlights, progress indicators
- **Supporting**: Use tints/shades of beige and brown for depth, subtle borders, and card shadows

### Typography
- **Headings**: Large, bold, friendly sans-serif (24-32px for screen titles)
- **Body**: Medium weight, highly readable (16-18px)
- **Microcopy**: Playful, conversational tone in smaller sizes (14px)
- **Hierarchy**: Use size and weight to create clear visual distinction between title, subtitle, and body content

### Layout System
**Mobile-First (390×844 iPhone optimized)**
- **Spacing**: Use Tailwind units of 2, 4, 6, 8 for consistent rhythm (p-4, p-6, p-8, gap-4, etc.)
- **Card padding**: p-6 for most cards, p-8 for prominent features
- **Screen padding**: px-4 or px-6 for content areas
- **Vertical spacing**: py-6 between sections, py-8 for screen top/bottom margins

## Component Library

### Cards
- **Style**: Rounded corners (rounded-2xl or rounded-3xl)
- **Elevation**: Soft shadows, avoid harsh borders
- **Padding**: Generous internal spacing (p-6 minimum)
- **Variants**: 
  - Goal vault cards with progress bars
  - Savings method cards with toggles/sliders
  - Activity feed items
  - Challenge cards with images

### Buttons
- **Primary**: Solid warm orange background, deep brown text, rounded-full, py-4 px-8
- **Secondary**: Outline style with deep brown border, rounded-full
- **On Images**: Semi-transparent blurred background when overlaying hero images
- **Size**: Substantial touch targets (minimum 44px height)
- **Text**: Bold, clear action words

### Progress Indicators
- **Thin bars**: Cleo-style minimalist progress at top of screens during onboarding
- **Circular**: For vault goal completion percentages
- **Color**: Warm orange for active progress, light beige for track

### Form Elements
- **Input fields**: Large touch targets, rounded corners, subtle beige backgrounds
- **6-digit code**: Individual boxes for each digit (email verification)
- **Sliders**: Custom styled with warm orange track/thumb
- **Toggles**: Rounded switch style in warm orange when active
- **Checkable cards**: Full card selection with visual feedback

### Navigation
- **Bottom tab bar**: 5 tabs (Home, Vaults, Savings Lab, Rewards, Coach)
- **Icons**: Simple, friendly line-style icons
- **Active state**: Warm orange with label, inactive in muted brown

## Screen-Specific Patterns

### Onboarding Flow
- **Full-bleed hero images**: Cover full viewport on carousel slides
- **Image style**: Warm, soft illustrations with sunrise/progress/vault themes
- **Overlay text**: Semi-transparent blurred background for readability
- **Buttons**: Stacked (Sign Up primary, Log In secondary) at bottom
- **Progress bar**: Thin indicator at very top during multi-step flows

### Home Tab
- **Greeting**: Large, personalized at top
- **Snapshot cards**: Horizontal scrollable if needed, showing balances
- **Dynamic card**: Featured "best move today" with illustration, slider/controls, and action buttons (Do it, Adjust, Skip)
- **Quick access pills**: Small rounded buttons for Savings Lab and Rewards

### Vaults
- **List view**: Stacked cards with name, progress bar, balance, soft-lock pill
- **Detail view**: Large balance display, target amount, progress visualization
- **Soft-lock warning**: Bottom sheet with impact messaging ("adds 3 weeks to finish")

### Savings Lab
- **Card grid**: Each method gets consistent card treatment
- **Card structure**: 
  - Icon/illustration at top
  - Title (bold)
  - Description (2-3 lines)
  - Example state ("Tax refund hit: $1,800 → save $360?")
  - Controls (toggles, sliders, frequency selectors)
  - Action button
- **9 methods**: Windfall, Smart Sweep, Subscription Sweep, Round-ups, Challenges, Rules, Emotion Nudges, Save-to-Spend, Lottery

### AI Coach Chat
- **Bubbles**: User messages right-aligned in warm orange, Morrow responses left-aligned in beige
- **Suggestions**: Pill-shaped quick prompts above input
- **Input**: Rounded textbox at bottom with placeholder "Ask anything about your money…"

### Rewards Tab
- **Sections**: Fun Money balance, Lottery entries with draw countdown, Activity feed
- **Feed items**: Card-style with icon, description, amount/entries earned

## Images

### Onboarding Heroes (Full-bleed)
1. **Slide 1**: Warm illustration of person looking toward sunrise/horizon - conveys hope, future-building
2. **Slide 2**: Cozy scene with notebook, coffee cup, and progress elements - conveys daily habits, comfort
3. **Slide 3**: Lock, savings jars, vault visual - conveys security, goal-oriented saving

### Bank Connection
- Simple bank + shield icon illustration

### Savings Method Cards
- Consider subtle icons/illustrations for each method (windfall, sweep, round-up, etc.)

### Challenge Cards
- Each challenge should have relevant imagery (coffee cup for Coffee Swap, plate for No-Takeout, etc.)

## Interaction Principles
- **No distracting animations**: Keep micro-interactions subtle
- **Immediate feedback**: Toggle/slider changes reflect instantly
- **Clear CTAs**: Every screen has obvious next action
- **Conversational tone**: All copy feels friendly, supportive, never judgmental
- **Whitespace**: Don't crowd - let elements breathe

## Accessibility
- Minimum 44px touch targets
- High contrast between beige background and brown text
- Clear focus states on all interactive elements
- Readable font sizes (16px+ for body text)