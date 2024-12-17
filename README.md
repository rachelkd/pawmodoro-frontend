# Pawmodoro Web Application

A web application that gamifies studying using the Pomodoro technique and virtual pet care.

## Development Setup

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The application uses the following environment variables:

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

## Deployment Guide

### Backend Deployment (Render.com)

1. Create a Render account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Name: `pawmodoro-api` (or your preferred name)
   - Environment: `Java`
   - Build Command: `./mvnw clean install -DskipTests`
   - Start Command: `java -jar target/your-jar-name.jar`
   - Instance Type: Free (or your preferred tier)
5. Add environment variables if needed
6. Click "Create Web Service"
7. Note down your service URL (e.g., `https://pawmodoro-api.onrender.com`)

### Frontend Deployment (Netlify)

1. Create a Netlify account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Configure the build settings:
   - Build Command: `cd frontend && npm run build`
   - Publish Directory: `frontend/.next`
4. Add environment variables in Netlify dashboard:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your Render.com backend URL (e.g., `https://pawmodoro-api.onrender.com`)
5. Deploy your site
6. (Optional) Configure a custom domain

### CORS Configuration

Make sure your Spring Boot backend allows requests from your Netlify domain. Add this configuration to your backend:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "http://localhost:3000",  // Development
                "https://your-netlify-app.netlify.app"  // Production
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

### Post-Deployment Checklist

1. Backend:
   - [ ] Backend is successfully deployed on Render
   - [ ] API endpoints are accessible
   - [ ] Environment variables are set
   - [ ] CORS is properly configured

2. Frontend:
   - [ ] Frontend is successfully deployed on Netlify
   - [ ] Environment variables are set in Netlify dashboard
   - [ ] Application loads without errors
   - [ ] API calls are working
   - [ ] Authentication flow is working
   - [ ] Images and assets are loading

3. Testing:
   - [ ] Test user registration
   - [ ] Test user login
   - [ ] Test cat creation and management
   - [ ] Test timer functionality
   - [ ] Test responsive design on different devices

### Troubleshooting

Common issues and solutions:

1. CORS errors:
   - Verify CORS configuration in backend
   - Check if frontend URL is correctly added to allowed origins

2. API connection issues:
   - Verify environment variables are set correctly
   - Check if backend service is running
   - Verify API endpoints are accessible

3. Authentication issues:
   - Clear browser storage and try again
   - Check if tokens are being properly stored
   - Verify authentication headers in requests

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
