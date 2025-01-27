# **Engineering Learning Platform**

A collaborative platform designed for engineering students and educators to share and explore engineering projects, promoting enterprise-involved, project-based learning.

---

## **Overview**

The platform provides users with the ability to:
- Browse engineering projects in an interactive 3D gallery.
- Search and filter projects by various criteria (institution, type, skill level, etc.).
- Create and share their own engineering projects.
- Collaborate with others on projects.
- View detailed project information, media, and resources.

---

## **Tech Stack**

### **Frontend**
- **React.js**: Component-based library for building the user interface.
- **Material-UI**: Prebuilt React components for consistent design.
- **Three.js**: Enables 3D visualization for the gallery.
- **React Router**: Manages client-side navigation.
- **Axios**: Simplifies API calls and handles requests.

### **Backend**
- **Node.js**: JavaScript runtime for the server.
- **Express.js**: Framework for building RESTful APIs.
- **Prisma ORM**: Simplifies database interactions.
- **PostgreSQL**: Relational database for structured data.
- **AWS S3**: Media storage and management.

---

## **Database Schema**

The database includes four primary models:

### **User**
- Stores user information, authentication details, and timestamps.
- Manages project ownership and collaborations.

### **Project**
- Contains metadata like title, description, institution, type, and skill level.
- Links to creators, collaborators, media, and tags.

### **Media**
- Stores media files (images, documents, videos) linked to projects.
- Supports multiple media types.

### **Tag**
- Categorizes projects and facilitates search and filtering.
- Ensures unique tag names.

---

## **Setup Instructions**

### **Prerequisites**
- Node.js (v14 or higher)
- PostgreSQL
- AWS Account
- Git

---

### **Local Development Setup**
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Install dependencies for both frontend and backend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Configure environment variables using the provided `.env.example` file.
4. Initialize the database:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```
5. Start development servers:
   ```bash
   cd backend && npm run dev
   cd ../frontend && npm start
   ```

---

### **Environment Configuration**
The following environment variables are required:
- **DATABASE_URL**: PostgreSQL connection string.
- **AWS_ACCESS_KEY_ID** and **AWS_SECRET_ACCESS_KEY**: AWS credentials.
- **AWS_REGION** and **AWS_S3_BUCKET_NAME**: Region and S3 bucket name.
- **JWT_SECRET**: Secret for JSON Web Token authentication.

---

### **Deployment to AWS**

#### **S3 Configuration**
1. Create an S3 bucket for media storage.
2. Configure CORS policies to allow cross-origin requests.
3. Set bucket policies for public access or appropriate permissions.

#### **Database Deployment**
1. Launch an RDS PostgreSQL instance.
2. Configure security groups and networking for accessibility.
3. Apply database migrations using Prisma.

#### **Backend Deployment**
1. Set up an EC2 instance.
2. Install dependencies and set up the Node.js environment.
3. Use **PM2** for process management.
4. Configure **Nginx** as a reverse proxy for the backend server.

#### **Frontend Deployment**
1. Build production-ready assets:
   ```bash
   cd frontend && npm run build
   ```
2. Deploy the build folder to the S3 bucket:
   ```bash
   aws s3 sync ./build s3://<your-bucket-name> --acl public-read
   ```
3. (Optional) Configure a **CloudFront** distribution for enhanced delivery and set up a custom domain.

---

## **Key Design Decisions**

- **3D Gallery**: Three.js enables an intuitive and immersive browsing experience.
- **Search and Filter**: Combines multi-criteria filtering with real-time updates for efficient project discovery.
- **Scalability**: RESTful API and modular architecture ensure the platform can scale with user demand.
- **Security**: Implements JWT authentication, AWS IAM policies, and secure database connections.

---

## **Future Enhancements**

- Real-time collaboration tools.
- Advanced analytics for projects.
- Integration with Learning Management Systems (LMS).
- Mobile application development.
- AI-powered project recommendations.

---

