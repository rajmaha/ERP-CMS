require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔄 Testing MongoDB Connection...\n');
console.log('Database URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('\n✓ MongoDB Connection Successful!');
  console.log('✓ Database is ready to use');
  console.log('\nYou can now start the server with: npm run dev');
  mongoose.connection.close();
  process.exit(0);
})
.catch(err => {
  console.error('\n✗ MongoDB Connection Failed!');
  console.error('\nError:', err.message);
  console.error('\nTroubleshooting:');
  console.error('1. Check if MongoDB is running:');
  console.error('   - Local: brew services start mongodb-community (macOS)');
  console.error('   - Atlas: Check cluster status in MongoDB Cloud');
  console.error('2. Verify connection string in .env file');
  console.error('3. Check username/password (for Atlas)');
  console.error('4. Check IP whitelist (for Atlas)');
  process.exit(1);
});
