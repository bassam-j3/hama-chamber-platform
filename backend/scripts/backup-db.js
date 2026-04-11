const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

// Ensure backups directory exists
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate filename based on current date
const date = new Date();
const timestamp = date.toISOString().replace(/[:.]/g, '-');
const filename = `db_backup_${timestamp}.sql.gz`;
const filepath = path.join(backupDir, filename);

// Depending on OS, pg_dump may need to be in PATH. 
// Assuming pg_dump is available in the environment's PATH.
console.log(`⏳ Starting database backup to: ${filepath}`);

// We'll use child_process.exec to run pg_dump. 
// Note: DATABASE_URL should be a valid connection string.
// On Windows/Linux cross-compatibility, redirecting stdout to a file works in most shells.
// However, since we're using exec in Node, we need to handle cross-platform properly.
// The most reliable cross-platform way without extra libs is piping pg_dump to gzip (if gzip is available) or just writing raw SQL and zipping it via Node.
// To avoid relying on system gzip, we will use Node's built-in zlib to compress the output of pg_dump.

const zlib = require('zlib');
const { spawn } = require('child_process');

const pgDump = spawn('pg_dump', [DATABASE_URL], {
  env: { ...process.env }, // Pass environment variables
});

const writeStream = fs.createWriteStream(filepath);
const gzip = zlib.createGzip();

pgDump.stdout.pipe(gzip).pipe(writeStream);

pgDump.stderr.on('data', (data) => {
  console.warn(`pg_dump warning: ${data.toString()}`);
});

pgDump.on('close', (code) => {
  if (code === 0) {
    console.log(`✅ Backup successful! File saved at: ${filepath}`);

    // Optional: Upload to Cloudinary for offsite backup
    if (process.env.CLOUDINARY_URL) {
      console.log('☁️ CLOUDINARY_URL found. Uploading backup to Cloudinary...');
      const cloudinary = require('cloudinary').v2;
      
      cloudinary.uploader.upload(filepath, {
        resource_type: 'raw',
        folder: 'hama-chamber/db_backups',
        public_id: `db_backup_${timestamp}`,
        use_filename: true,
      })
      .then((result) => {
        console.log(`✅ Cloudinary upload successful: ${result.secure_url}`);
      })
      .catch((error) => {
        console.error('❌ Cloudinary upload failed:', error);
      });
    } else {
      console.log('ℹ️ CLOUDINARY_URL not set. Skipping offsite upload.');
    }
  } else {
    console.error(`❌ Backup process exited with code ${code}`);
    process.exit(code);
  }
});

pgDump.on('error', (err) => {
  console.error('❌ Failed to start pg_dump. Is PostgreSQL installed and in your PATH?', err);
  process.exit(1);
});
