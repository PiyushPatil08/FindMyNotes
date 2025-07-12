# Vercel Deployment Guide for FindMyNotes

## Prerequisites
- Vercel CLI installed (✅ Already installed)
- GitHub repository connected to Vercel
- MongoDB Atlas database (for production)

## Steps to Deploy

### 1. Login to Vercel (if not already logged in)
```bash
vercel login
```

### 2. Deploy to Vercel
```bash
vercel
```

### 3. Follow the prompts:
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: `findmynotes` (or your preferred name)
- Directory: `.` (current directory)
- Override settings: `N`

### 4. Set Environment Variables
After deployment, go to your Vercel dashboard and set these environment variables:
- `MONGO_URL`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your JWT secret key
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### 5. Update API URLs
After getting your Vercel URL, update the `client/env.production` file with your actual Vercel URL:
```
VITE_API_URL=https://your-actual-vercel-url.vercel.app/api
```

### 6. Redeploy
```bash
vercel --prod
```

## Important Notes

1. **API Routes**: All backend routes now have `/api` prefix
2. **Environment Variables**: Make sure to set all required environment variables in Vercel dashboard
3. **MongoDB**: Ensure your MongoDB Atlas cluster allows connections from Vercel's IP ranges
4. **File Uploads**: Consider using Cloudinary or similar service for file uploads in production

## Troubleshooting

- If you get CORS errors, check that your frontend is making requests to the correct API endpoints
- If MongoDB connection fails, verify your connection string and network access
- Check Vercel function logs for any server-side errors 