# Travel Explore - Khám Phá Sài Gòn 🏙️

A modern, responsive travel exploration website for Ho Chi Minh City, Vietnam. Built with Next.js 15, TypeScript, and Tailwind CSS, inspired by Atlas Obscura's design principles.

## ✨ Features

### 🧭 Enhanced Navigation
- **Responsive Navigation Bar** - Clean, sticky navigation with mobile-first design
- **Global Search** - Popup search functionality with suggestions
- **Smart Routing** - Seamless navigation between pages

### 🎨 Modern UI Components
- **Hero Section** - Dynamic featured place showcase with auto-rotation
- **Enhanced Location Cards** - Beautiful cards with hover effects and ratings
- **Search Bar** - Advanced search with popup suggestions and smooth animations
- **Loading States** - Engaging loading animations and error handling

### 🔍 Core Functionality
1. **Tourist Search** - Users can search for locations, attractions, and experiences
2. **Content Management** - Admin and users can post information about locations
3. **Detailed Views** - Comprehensive location information and details

### 🎯 Atlas Obscura Inspired Features
- **Place of the Day** - Featured location showcase in hero section
- **Responsive Grid Layout** - Clean, organized location displays
- **Search Suggestions** - Quick access to popular destinations
- **Premium Visual Design** - Modern gradients, shadows, and animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-explore-fe
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page with hero and featured locations
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles and animations
│   ├── locations/         # Location-related pages
│   │   ├── page.tsx      # All locations listing
│   │   ├── [id]/         # Dynamic location details
│   │   └── add/          # Add new location
│   └── admin/             # Admin panel
├── components/            # Reusable UI components
│   ├── nav-bar.tsx       # Enhanced navigation component
│   ├── hero-section.tsx  # Featured place showcase
│   ├── search-bar.tsx    # Advanced search with popup
│   └── location-card.tsx # Enhanced location cards
├── lib/                  # Utilities and API
│   └── api.ts           # API service layer
└── public/              # Static assets
    └── images/          # Location images
```

## 🎨 Design Improvements

### Navigation Enhancements
- **Sticky Header** - Always accessible navigation
- **Mobile Responsive** - Hamburger menu for mobile devices
- **Search Integration** - Quick search access from navigation
- **Active States** - Clear indication of current page

### Visual Enhancements
- **Hero Section** - Dynamic background with featured locations
- **Enhanced Cards** - Improved layout with better imagery and ratings
- **Smooth Animations** - Hover effects and transitions
- **Loading States** - Professional loading animations
- **Error Handling** - User-friendly error messages

### UX Improvements
- **Search Suggestions** - Popular destinations for quick access
- **Filter Options** - Category and sorting filters
- **Pagination** - Easy navigation through location lists
- **Responsive Design** - Optimized for all device sizes

## 🛠️ Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern React patterns
- **CSS Animations** - Custom animations and transitions

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🎯 Key Features Implementation

### 1. Tourist Search
- Advanced search bar with popup functionality
- Search suggestions for popular destinations
- Real-time search results
- Category filtering

### 2. Content Management
- Add new locations functionality
- Admin panel access
- Location details management
- Image upload and management

### 3. Location Details
- Comprehensive location information
- Rating and review system
- Image galleries
- Location mapping integration

## 🚀 Future Enhancements

- [ ] User authentication and profiles
- [ ] Advanced filtering and sorting
- [ ] Map integration
- [ ] User reviews and ratings
- [ ] Social sharing features
- [ ] Offline support
- [ ] Multi-language support

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for exploring the beautiful city of Ho Chi Minh, Vietnam
