require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://gdclone-omega.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/^.*$/, cors(corsOptions));
app.use(express.json());

const pool = new Pool({
  user: 'neondb', // PostgreSQL user
  host: 'ep-bold-smoke-ad0pqel1-pooler.c-2.us-east-1.aws.neon.tech', // Database host
  database: 'drive', // Name of the database
  password: 'npg_BZ0g9lcpiToj', // Database user password
  port: 5432, // Default PostgreSQL port
    ssl: {
    rejectUnauthorized: false // this is important to bypass unauthorized SSL certificates (useful in some cases)
  }
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database:', err));

// --- AWS S3 Configuration ---
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION
});

// Configure Multer for S3 uploads (for single file)
const uploadSingle = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  }),
  limits: { fileSize: 1024 * 1024 * 50 } // 50 MB limit
});

// Configure Multer for S3 uploads (for multiple files)
const uploadMultiple = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  }),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit per file
  fileFilter: (req, file, cb) => {
    // Optional: Add file type filtering if needed
    // if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
    //     return cb(new Error('Only image and PDF files are allowed!'), false);
    // }
    cb(null, true);
  }
});

// --- API Routes ---

app.get('/', (req, res) => {
  res.send('Server is up!');
});

// app.get('/api/drive', async (req, res) => {
//   console.log('GET /api/drive called');
//   try {
//     const result = await pool.query('SELECT * FROM drive ORDER BY id DESC');
//     console.log('DB result:', result.rows);
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error in /api/drive:', err);
//     res.status(500).send('Database error');
//   }
// });

app.get('/api/drive', async (req, res) => {
  console.log('GET /api/drive called');
  try {
    const result = await pool.query('SELECT * FROM drive ORDER BY id DESC');
    console.log('DB result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    // Enhanced error logging
    console.error('Error in /api/drive:', err.message);
    console.error('Stack trace:', err.stack);

    // Send a detailed error message in the response
    res.status(500).send(`Database error: ${err.message}`);
  }
});



// Single file upload route
app.post('/api/upload', uploadSingle.single('file'), async (req, res) => {
  console.log('POST /api/upload (single file) called');

  if (!req.file) {
    return res.status(400).json({ message: 'No File Uploaded.' });
  }

  const fileUrl = req.file.location;

  try {
    const result = await pool.query(
      'INSERT INTO drive (url) VALUES ($1) RETURNING *',
      [fileUrl]
    );
    console.log('File URL saved to DB:', result.rows[0]);

    res.status(201).json({
      message: 'File uploaded and URL saved to database successfully!',
      fileUrl: fileUrl,
      dbEntry: result.rows[0]
    });

  } catch (err) {
    console.error('Error saving file URL to database:', err);
    res.status(500).send('Error saving file URL to database');
  }
});

// Multiple file upload route
app.post('/api/upload-multiple', uploadMultiple.array('files', 10), async (req, res) => {
  console.log('POST /api/upload-multiple (multiple files) called');

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  const uploadedFileUrls = req.files.map(file => file.location);
  const dbEntries = [];

  try {
    // Using a transaction to ensure all or none are inserted
    await pool.query('BEGIN');
    for (const fileUrl of uploadedFileUrls) {
      const result = await pool.query(
        'INSERT INTO drive (url) VALUES ($1) RETURNING *',
        [fileUrl]
      );
      dbEntries.push(result.rows[0]);
    }
    await pool.query('COMMIT');

    console.log('Multiple file URLs saved to DB:', dbEntries);

    res.status(201).json({
      message: 'Files uploaded and URLs saved to database successfully!',
      fileUrls: uploadedFileUrls,
      dbEntries: dbEntries
    });

  } catch (err) {
    await pool.query('ROLLBACK'); // Rollback on error
    console.error('Error saving multiple file URLs to database:', err);
    res.status(500).send('Error saving multiple file URLs to database');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on https://gdclone-c7gy.onrender.com/`);
});








