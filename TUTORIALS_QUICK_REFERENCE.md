# Tutorial Management System - Quick Reference Guide

## 🎯 Quick Access URLs

### Public Frontend
- **Tutorials List:** `http://localhost:3000/tutorials`
- **Tutorial Detail:** `http://localhost:3000/tutorial/{slug}`
- **Search Tutorials:** `http://localhost:3000/tutorials?search=javascript`
- **Filter by Difficulty:** `http://localhost:3000/tutorials?difficulty=beginner`
- **Filter by Category:** `http://localhost:3000/tutorials?category={categoryId}`

### Admin Interface
- **Tutorials List:** `http://localhost:3000/admin/tutorials`
- **Create Tutorial:** `http://localhost:3000/admin/tutorials/new`
- **Edit Tutorial:** `http://localhost:3000/admin/tutorials/edit/{tutorialId}`
- **Manage Categories:** `http://localhost:3000/admin/tutorials/categories`

### API Endpoints (Backend)
- **Base:** `http://localhost:5000/api/tutorials`

---

## 📝 Admin Workflow

### 1. Create a Category
1. Navigate to `/admin/tutorials/categories`
2. Click **"Add Category"** button
3. Fill in:
   - **Name** - e.g., "JavaScript"
   - **Icon** - Emoji, e.g., "📘"
   - **Color** - Pick a hex color
   - **Description** (optional)
   - **Order** - Display order
4. Click **"Create Category"**

### 2. Create a Tutorial
1. Navigate to `/admin/tutorials`
2. Click **"Add New Tutorial"** button
3. Fill in required fields:
   - **Title** - Tutorial title
   - **Category** - Select from dropdown
   - **Difficulty** - beginner/intermediate/advanced
   - **Content** - Use rich text editor
4. Add optional fields:
   - **Description** - Brief intro
   - **Featured Image** - Click to select from media library
   - **Duration** - Minutes to complete
   - **Video** - YouTube/Vimeo URL (auto-extracts ID)
   - **Code Examples** - Click "Add Code Example"
   - **Tags** - Comma-separated
5. Set **Status**:
   - Draft - Not published yet
   - Published - Visible to public
6. Check **Active** to enable, **Featured** to highlight
7. Click **"Save Tutorial"**

### 3. Publish/Update Tutorial
1. Go to `/admin/tutorials`
2. Find the tutorial
3. Click **Edit** (pencil icon)
4. Change Status to "Published"
5. Click **"Save Tutorial"**

### 4. Manage Visibility
1. Go to `/admin/tutorials`
2. Click **Eye icon** to toggle visibility
3. Click **Star icon** to toggle featured status

### 5. Delete Tutorial
1. Go to `/admin/tutorials`
2. Click **Trash icon**
3. Confirm deletion

---

## 📊 Content Management Best Practices

### Tutorial Titles
- Be descriptive and specific
- Include skill level if needed
- Keep under 80 characters for SEO
- **Examples:**
  - "Getting Started with React Hooks"
  - "Advanced CSS Grid Techniques for Responsive Design"

### Difficulty Levels
- **Beginner** - No prior knowledge needed
- **Intermediate** - Basic understanding required
- **Advanced** - Expert knowledge needed

### Content Structure
1. **Introduction** - What will they learn?
2. **Prerequisites** - What do they need to know?
3. **Step-by-Step Instructions** - Main content
4. **Code Examples** - Real-world examples
5. **Summary** - Key takeaways
6. **Next Steps** - Related tutorials/resources

### Code Examples
Add multiple examples with:
- **Title** - Descriptive name
- **Language** - JavaScript, Python, HTML, CSS, etc.
- **Code** - Actual code snippet

### Tags
Use consistent, searchable tags:
- Technology: javascript, python, react, etc.
- Category: web, mobile, backend, etc.
- Level: beginner, intermediate, advanced
- Type: tutorial, guide, tips, etc.

### Videos
- Supports YouTube and Vimeo
- Paste full URL - ID is auto-extracted
- YouTube example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Vimeo example: `https://vimeo.com/123456789`

---

## 🎬 Video Integration

### YouTube
1. Copy the full video URL
2. Paste in "Video URL" field
3. Select "YouTube" as platform
4. Click save - ID auto-extracts
5. Video ID appears: `dQw4w9WgXcQ`

### Vimeo
1. Copy the full video URL
2. Paste in "Video URL" field
3. Select "Vimeo" as platform
4. Click save - ID auto-extracts
5. Video ID appears: `123456789`

### Custom Thumbnails
- Optional: Upload custom thumbnail
- If not provided, platform default is used
- Recommended size: 1280x720px

---

## 🔍 Frontend Navigation

### Browse Tutorials
1. Go to `/tutorials`
2. Browse grid of tutorials
3. Use filters:
   - **Difficulty** dropdown
   - **Category** dropdown
   - **Search** box

### View Tutorial
1. Click on any tutorial card
2. See full content, video, code examples
3. View related tutorials
4. Click tags to search similar tutorials

### Pagination
- Default: 12 tutorials per page
- Click page numbers to navigate
- Use Previous/Next buttons

---

## 📈 Monitoring

### View Statistics
- Each tutorial shows **view count** in admin list
- View count increments when:
  - User views tutorial detail page
  - Only for published tutorials
  - Count shown in admin panel

### Filter Tutorials
**By Status:**
- All - All tutorials
- Published - Visible to public
- Draft - Not yet published

**By Difficulty:**
- All Levels
- Beginner
- Intermediate
- Advanced

**By Category:**
- Select any created category

---

## ⚙️ API Endpoints (for developers)

### Get Tutorials
```bash
# Get all tutorials
curl http://localhost:5000/api/tutorials

# Search
curl "http://localhost:5000/api/tutorials?search=javascript"

# Filter by difficulty
curl "http://localhost:5000/api/tutorials?difficulty=beginner"

# Pagination
curl "http://localhost:5000/api/tutorials?page=2&limit=12"
```

### Get Tutorial Detail
```bash
# By slug
curl http://localhost:5000/api/tutorials/by-slug/tutorial-slug

# By ID
curl http://localhost:5000/api/tutorials/TUTORIAL_ID
```

### Admin Operations (requires JWT token)
```bash
# Create
curl -X POST http://localhost:5000/api/tutorials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"...", "content":"...", "category":"..."}'

# Update
curl -X PUT http://localhost:5000/api/tutorials/TUTORIAL_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"published"}'

# Delete
curl -X DELETE http://localhost:5000/api/tutorials/TUTORIAL_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Tutorial Not Appearing
- ✅ Check Status is "Published"
- ✅ Check isActive is checked
- ✅ Verify Category exists and is active
- ✅ Clear browser cache

### Video Not Embedding
- ✅ Verify video platform (YouTube/Vimeo)
- ✅ Check video URL is correct
- ✅ Video ID should auto-extract on save
- ✅ Try refreshing page

### Code Examples Not Showing
- ✅ Click "Add Code Example" to add
- ✅ Fill in language and code
- ✅ Click "Remove Example" to delete
- ✅ Save the tutorial

### Category Can't Delete
- ✅ Category is used by tutorials
- ✅ Delete/move tutorials first
- ✅ Then delete category

### Search Not Working
- ✅ Searches title, description, and tags
- ✅ Case-insensitive search
- ✅ Try simpler search terms
- ✅ Ensure tutorials are published

---

## 📋 Field Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Title | Text | ✅ | Must be unique per system |
| Description | Text | ❌ | Brief intro text |
| Content | Rich HTML | ✅ | Use editor for formatting |
| Category | Dropdown | ✅ | Select from categories |
| Difficulty | Select | ✅ | beginner/intermediate/advanced |
| Duration | Number | ❌ | Minutes to complete |
| Featured Image | Image | ❌ | From media library |
| Video Type | Select | ❌ | youtube/vimeo/none |
| Video URL | URL | ❌ | Full URL, ID auto-extracts |
| Tags | Text | ❌ | Comma-separated |
| Status | Select | ✅ | draft/published |
| Active | Toggle | ✅ | Show/hide in public |
| Featured | Toggle | ❌ | Highlight tutorial |
| Order | Number | ❌ | Display sort order |

---

## 🎓 Content Tips

### SEO Optimization
- Write descriptive titles (50-60 characters)
- Add meta description (150-160 characters)
- Use relevant keywords in tags
- Write comprehensive content

### Engagement
- Add related tutorials for cross-linking
- Include code examples with explanations
- Break content into sections with headings
- Use featured images to attract attention

### Accessibility
- Use semantic HTML in content
- Add alt text to images
- Use code syntax highlighting
- Structure content with clear headings

---

## 📊 Statistics

- **Tutorials**: Unlimited
- **Categories**: Unlimited
- **Code Examples**: Unlimited per tutorial
- **Related Tutorials**: Unlimited per tutorial
- **Tags**: Unlimited
- **Max Title Length**: No limit (recommend <80 chars)
- **Pagination**: Default 12 per page (configurable)

---

## 🔐 Security

- All admin operations require JWT authentication
- Admin role required for management
- Published tutorials visible only when Status = Published
- Input validation on all fields
- Rate limiting on API calls
- CORS protection enabled

---

## 📚 Related Documentation

- See `GALLERY_SYSTEM_COMPLETE.md` for gallery system
- See blog system for similar content management
- See media library for image/file management

---

Generated: 2024-02-02
Last Updated: 2024-02-02
