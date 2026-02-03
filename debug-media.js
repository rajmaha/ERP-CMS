require('dotenv').config();
const mongoose = require('mongoose');
const Media = require('./models/Media');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  const allMedia = await Media.find().populate('group', 'name');
  console.log('\n=== ALL MEDIA FILES ===');
  console.log(`Total files: ${allMedia.length}\n`);
  
  allMedia.forEach(media => {
    console.log(`Name: ${media.originalName}`);
    console.log(`FileType: ${media.fileType}`);
    console.log(`MimeType: ${media.mimeType}`);
    console.log(`Group: ${media.group?.name || 'No group'}`);
    console.log(`URL: ${media.url}`);
    console.log('---');
  });
  
  const imageCount = allMedia.filter(m => m.fileType === 'image').length;
  console.log(`\nImages with fileType='image': ${imageCount}`);
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
