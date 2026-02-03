const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://rajmaha:Chohbar570@cluster0.ggqbk.mongodb.net/?appName=Cluster0';
const BACKUP_DIR = path.join(__dirname, 'database-backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('🔄 Starting MongoDB backup...');
console.log(`📁 Backup location: ${backupPath}`);

// Use mongodump to backup the database
const command = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Backup failed:', error.message);
    console.error('\n⚠️  Make sure MongoDB Database Tools are installed:');
    console.error('   Visit: https://www.mongodb.com/try/download/database-tools');
    console.error('   Or install via Homebrew: brew install mongodb-database-tools');
    return;
  }
  
  if (stderr) {
    console.log('Output:', stderr);
  }
  
  console.log('✅ Backup completed successfully!');
  console.log(`📂 Files saved to: ${backupPath}`);
  console.log('\n💡 To restore this backup, run:');
  console.log(`   mongorestore --uri="YOUR_MONGODB_URI" "${backupPath}"`);
});
