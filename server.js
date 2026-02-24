import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 40 * 1024 }, // 40KB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, DOCX allowed."));
    }
  },
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

// Generate email HTML
const generateEmailHTML = (formData) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff8c00 0%, #ff7700 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 30px;
    }
    .info-section {
      margin-bottom: 30px;
    }
    .info-row {
      display: flex;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .label {
      font-weight: 700;
      color: #ff8c00;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: 150px;
      min-width: 150px;
    }
    .value {
      color: #333;
      font-size: 15px;
      flex: 1;
      word-break: break-word;
    }
    .resume-note {
      background-color: #fff3cd;
      border-left: 4px solid #ff8c00;
      padding: 15px;
      margin-top: 20px;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
    }
    .resume-note strong {
      color: #ff8c00;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #999;
    }
    .footer a {
      color: #ff8c00;
      text-decoration: none;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 New Job Application</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Hello Canvas Tech Team,</div>
      
      <div class="info-section">
        <div class="info-row">
          <div class="label">Full Name</div>
          <div class="value">${formData.firstName} ${formData.lastName}</div>
        </div>
        
        <div class="info-row">
          <div class="label">Email</div>
          <div class="value">${formData.email}</div>
        </div>
        
        <div class="info-row">
          <div class="label">Phone</div>
          <div class="value">${formData.phone}</div>
        </div>
        
        <div class="info-row">
          <div class="label">City</div>
          <div class="value">${formData.city}</div>
        </div>
        
        <div class="info-row">
          <div class="label">Qualification</div>
          <div class="value">${formData.qualification}</div>
        </div>
        
        <div class="info-row">
          <div class="label">Experience</div>
          <div class="value">${formData.experience} years</div>
        </div>
        
        <div class="info-row">
          <div class="label">Current Salary</div>
          <div class="value">₹${formData.salary}</div>
        </div>
        
        <div class="info-row">
          <div class="label">Skills</div>
          <div class="value">${formData.skills}</div>
        </div>
      </div>

      <div class="resume-note">
        <strong>📎 Resume Attached:</strong> The candidate's CV/Resume is attached to this email.
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Canvas Tech</strong> - India's Best Talent Acquisition & Job Placement Consultancy</p>
      <p><a href="https://canvastech.in">Visit Website</a> | <a href="mailto:support@canvastech.in">Contact Support</a></p>
      <p style="margin-top: 15px; color: #ccc;">© 2026 Canvas Tech. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// API endpoint to handle form submission with file upload
app.post(
  "/api/submit-application",
  upload.single("resume"),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        city,
        qualification,
        experience,
        salary,
        skills,
      } = req.body;

      // Validate required fields
      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !city ||
        !qualification ||
        !experience ||
        !salary ||
        !skills
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Resume file is required" });
      }

      // Prepare email content
      const formData = {
        firstName,
        lastName,
        email,
        phone,
        city,
        qualification,
        experience,
        salary,
        skills,
      };

      const htmlContent = generateEmailHTML(formData);

      // Send email with attachment
      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: "adityabhat242@gmail.com",
        subject: `New Job Application from ${firstName} ${lastName}`,
        html: htmlContent,
        attachments: [
          {
            filename: req.file.originalname,
            path: req.file.path,
          },
        ],
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message:
          "Application submitted successfully! We will contact you soon.",
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit application. Please try again.",
        error: error.message,
      });
    }
  },
);

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});