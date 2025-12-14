# VitaBlog - Complete Feature List

## ✅ Fully Implemented Features

### 1. Blog Post Management
- ✅ Create new blog posts with rich content
- ✅ Edit existing blog posts
- ✅ Delete blog posts
- ✅ List all published posts with pagination
- ✅ View single post with full content
- ✅ Draft/Published status toggle
- ✅ Category and tags support
- ✅ Featured image upload
- ✅ View counter
- ✅ Author information display

### 2. Image Upload System
- ✅ Upload featured images for blog posts
- ✅ Image preview before upload
- ✅ Automatic image storage in `/uploads/posts/`
- ✅ Support for JPEG, JPG, PNG, GIF, WEBP formats
- ✅ 5MB file size limit
- ✅ Automatic file naming with timestamps

### 3. Comment System
- ✅ Signed-in users can comment on blog posts
- ✅ Comments require approval before publishing
- ✅ Display approved comments on posts
- ✅ Comment moderation system
- ✅ User information displayed with comments
- ✅ Timestamp for each comment

### 4. Subscriber Management
- ✅ Email subscription form
- ✅ Subscribe to blog updates
- ✅ Unsubscribe functionality
- ✅ Subscriber list management (admin only)
- ✅ Active/inactive subscriber tracking
- ✅ Subscriber count dashboard

### 5. Social Media Sharing
- ✅ Facebook sharing button
- ✅ Twitter/X sharing button
- ✅ LinkedIn sharing button
- ✅ WhatsApp sharing button
- ✅ Automatic post URL generation
- ✅ Pre-filled share text with post title

### 6. User Authentication
- ✅ User registration
- ✅ Email/password login
- ✅ Email-based authentication (VitaWell appointments)
- ✅ JWT token authentication
- ✅ Role-based access (Admin, Author, Viewer)
- ✅ User profile management
- ✅ Logout functionality

### 7. Admin Dashboard
- ✅ Total posts count
- ✅ Total products count
- ✅ Subscriber count
- ✅ Pending comments count
- ✅ Quick access to create new posts
- ✅ Product and opportunity creation

### 8. Frontend Features
- ✅ Responsive design with Tailwind CSS
- ✅ Modern, professional UI
- ✅ Navigation between pages
- ✅ Blog post grid display
- ✅ Single post view with full content
- ✅ Comment form for signed-in users
- ✅ Subscribe form on homepage
- ✅ Social sharing buttons
- ✅ Image upload interface
- ✅ Post creation/editing form

## API Endpoints

### Posts
- `GET /api/posts` - List published posts (paginated, searchable)
- `GET /api/posts/all` - List all posts including drafts (author/admin)
- `GET /api/posts/:slug` - Get single post with comments
- `POST /api/posts` - Create new post (author/admin)
- `PUT /api/posts/:id` - Update post (author/admin)
- `DELETE /api/posts/:id` - Delete post (author/admin)
- `POST /api/posts/:id/image` - Upload featured image (author/admin)
- `POST /api/posts/:id/comments` - Add comment (authenticated users)

### Subscribers
- `POST /api/subscribers` - Subscribe to blog
- `POST /api/subscribers/unsubscribe` - Unsubscribe from blog
- `GET /api/subscribers` - List all subscribers (admin only)
- `GET /api/subscribers/count` - Get subscriber count (admin only)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/email-auth` - Login via email (VitaWell appointments)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

## Database Models

### Post
- id (UUID)
- authorId (UUID, foreign key to User)
- title (String)
- slug (String, unique)
- excerpt (Text)
- content (Text)
- featuredImage (String, URL)
- category (String)
- tags (Array of Strings)
- isPublished (Boolean)
- views (Integer)
- createdAt, updatedAt (Timestamps)

### Subscriber
- id (UUID)
- email (String, unique)
- firstName, lastName (String, optional)
- isActive (Boolean)
- subscribedAt, unsubscribedAt (Date)
- createdAt, updatedAt (Timestamps)

### Comment
- id (UUID)
- postId (UUID, foreign key to Post)
- userId (UUID, foreign key to User)
- content (Text)
- status (Enum: approved, pending, rejected)
- likes (Integer)
- createdAt, updatedAt (Timestamps)

## How to Use

### Creating a Blog Post
1. Sign in to your account
2. Click "New Post" in the navigation
3. Fill in the post details:
   - Title (required)
   - Excerpt (optional)
   - Content (required)
   - Category (optional)
   - Tags (comma-separated)
   - Featured image (optional)
4. Check "Publish immediately" if you want it live right away
5. Click "Save Post"
6. If you selected an image, it will be uploaded automatically

### Uploading Images
1. When creating/editing a post, click "Choose Image"
2. Select an image file (JPEG, PNG, GIF, or WEBP)
3. The image will be previewed
4. Save the post to upload the image

### Commenting on Posts
1. Sign in to your account
2. Navigate to a blog post
3. Scroll to the comments section
4. Write your comment
5. Click "Post Comment"
6. Your comment will be submitted for approval

### Subscribing to Blog
1. Scroll to the subscribe section on the homepage
2. Enter your email address
3. Click "Subscribe"
4. You'll receive confirmation

### Sharing Posts
1. Navigate to any blog post
2. Scroll to the "Share this post" section
3. Click on any social media platform button
4. The post will be shared with the title and URL

## Technical Details

### Image Storage
- Images are stored in `VitaBlog/uploads/posts/`
- Files are named: `post-{timestamp}-{random}.{extension}`
- Maximum file size: 5MB
- Supported formats: JPEG, JPG, PNG, GIF, WEBP

### Security
- JWT token authentication
- Role-based access control
- Image file type validation
- File size limits
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers

### Performance
- Pagination for post lists
- Database indexing on slugs
- Efficient queries with Sequelize
- Static file serving for images

## Next Steps

To start using the blog:
1. Ensure PostgreSQL is running
2. Run database migrations: `npm run db:migrate`
3. Start the server: `npm run server:dev`
4. Open the frontend in your browser
5. Sign in and start creating posts!

