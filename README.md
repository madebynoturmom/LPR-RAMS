## Quick Start

### Database Seeding (NEW! 🌱)

Quickly populate your database with sample data for development or deployment:

```sh
npm run seed
```

This creates:
- 1 Residence (Sunset Villa)
- 1 Admin (username: `admin`, password: `admin123`)
- 5 Residents (password: `resident123`)
- 5 Vehicles
- 3 Guards (password: `guard123`)
- 2 Guest Passes

**Perfect for EC2 deployment - hit the ground running!** 🚀

See [scripts/README.md](scripts/README.md) and [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md) for details.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.


## API
```sh 
Post : http://dms.unarvu.io/api

Push Log: http://dms.unarvu.io/pushlog
```

## Recent Updates (October 3, 2025)

### Admin Dashboard Redesign
- **Modern UI/UX**: Complete redesign of admin dashboard subpages with card-based and accordion layouts
- **External CSS Architecture**: Removed all inline styles for better browser compatibility
- **Fully Responsive**: All pages now scale properly on mobile, tablet, and desktop using `clamp()` CSS values

### Admins Page Enhancements
- **Profile Management**: Added comprehensive admin profile display with:
  - Profile picture upload functionality (drag & drop or file picker)
  - Full name, email, and phone number fields
  - Expandable cards showing all admin information
  - Avatar placeholders with initials when no photo uploaded
- **Enhanced Edit Form**: 
  - Multi-field editing (username, name, email, phone, profile picture)
  - Simple file upload with success/error messages
  - Redesigned Save/Cancel buttons with icons and gradients
  - Proper null handling for optional fields
- **Visual Improvements**:
  - Large profile avatars in expanded view
  - Icon labels for each field (username, email, phone)
  - Gradient backgrounds and smooth animations
  - Professional card design with hover effects

### Events Page
- **Card Layout**: Modern card-based design for event logs
- **Color Coding**: Different colors for event types (entry, exit, guest, alert)
- **Search & Filter**: Real-time search and filter by event type
- **Icons**: Visual icons for each event type

### Guards Page
- **Accordion Layout**: Expandable cards showing guard details
- **Residence Scoping**: Guards now filtered by residence ID
- **Profile Display**: Shows guard avatars, names, status badges
- **Scalable Design**: Proper padding and responsive layout

### Residents Page
- **Grid Card Layout**: Modern card grid for resident profiles
- **Avatar Display**: Profile pictures or gradient placeholders with initials
- **Fully Responsive**: Scales from 3 columns to 1 column on mobile

### Vehicles Page
- **Accordion Design**: Collapsed view shows only plate number and house address
- **Expandable Details**: Click to view full vehicle information
- **Green Theme**: Color-coded for vehicle management
- **Scalable**: Handles large numbers of vehicles efficiently

### Guests Page
- **Pass Cards**: Card-based layout for guest passes
- **Status Indicators**: Active/expired badges with pulse animations
- **Time Tracking**: Real-time countdown for pass expiration
- **Pass Management**: Extend, edit, and delete guest passes
- **Type Filtering**: Filter by guest pass or food delivery

### Technical Improvements
- **CSS Organization**: All styles moved to external CSS files in `/static/admin/dashboard/[page]/`
- **Database Updates**: Proper null handling for optional fields
- **File Upload**: Integrated image upload via `/api/upload` endpoint
- **Form Validation**: Client-side validation for file types and sizes
- **Error Handling**: Proper error messages for failed operations
- **Accessibility**: Added ARIA labels for all interactive elements

### File Structure
```
static/admin/dashboard/
├── events/events.css
├── guards/guards.css
├── residents/residents.css
├── vehicles/vehicles.css
├── guests/guests.css
└── admins/admins.css
```

All changes follow modern web standards and best practices for scalability, maintainability, and user experience.