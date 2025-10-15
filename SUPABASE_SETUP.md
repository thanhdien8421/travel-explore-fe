# Supabase Setup Guide

## Overview
The travel explore application now uses Supabase Storage for image uploads instead of manual URL input. This provides better user experience and proper image management.

## Setup Steps

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization and create a new project
4. Wait for the project to be set up (usually takes 1-2 minutes)

### 2. Configure Storage
1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Create a new bucket called `travel-images`
4. Set the bucket to **Public** (for public image access)
5. Configure policies if needed (allow public read access)

### 3. Get Configuration Values
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **URL**: Your project URL (e.g., `https://xyzcompany.supabase.co`)
   - **anon key**: Your anonymous/public key

### 4. Update Environment Variables
1. Open `.env.local` in your project root
2. Replace the placeholder values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### 5. Restart Development Server
After updating the environment variables:
```bash
npm run dev
```

## Features Added

### Image Upload Component
- **Drag & Drop**: Users can drag images directly onto the upload area
- **File Selection**: Click to open file picker
- **Progress Indicator**: Shows upload progress with spinner
- **Image Preview**: Displays uploaded images with remove option
- **File Validation**: Accepts PNG, JPG, GIF up to 5MB
- **Vietnamese Interface**: All text in Vietnamese for better UX

### Storage Integration
- **Automatic Upload**: Files are uploaded to Supabase Storage automatically
- **Unique Filenames**: Uses timestamps to prevent filename conflicts
- **Public URLs**: Generates public URLs for uploaded images
- **Error Handling**: Proper error messages for failed uploads

## File Structure
```
src/
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── components/
│   └── supabase-image-upload.tsx  # Upload component
└── app/locations/add/
    └── page.tsx             # Integrated into location form
```

## Testing
1. Navigate to `/locations/add` in your browser
2. Try uploading an image by:
   - Dragging an image file onto the upload area
   - Clicking to select a file
3. Verify the image appears in preview
4. Submit the form to ensure the image URL is included

## Troubleshooting

### Environment Variables Not Loading
- Restart the development server after updating `.env.local`
- Check that variables start with `NEXT_PUBLIC_` for client-side access

### Upload Errors
- Verify your Supabase project is active
- Check that the `travel-images` bucket exists and is public
- Ensure your anon key has the correct permissions

### File Size Issues
- Current limit is 5MB per image
- Supported formats: PNG, JPG, GIF
- Check browser console for specific error messages

## Next Steps
1. Set up your Supabase project and storage bucket
2. Update the environment variables
3. Test the image upload functionality
4. Consider adding image optimization/resizing if needed