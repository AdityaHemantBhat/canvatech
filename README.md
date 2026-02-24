# Canvas Tech Backend Server

Backend server for handling file uploads and sending emails with attachments.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file in the server directory:

```bash
cp .env.example .env
```

3. Configure your email credentials in `.env`:

```
PORT=5000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Getting Gmail App Password

1. Go to https://myaccount.google.com/
2. Click "Security" in the left menu
3. Enable "2-Step Verification" if not already enabled
4. Search for "App passwords"
5. Select "Mail" and "Windows Computer" (or your device)
6. Copy the generated 16-character password
7. Paste it in `.env` as `EMAIL_PASSWORD`

## Running the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### POST /api/submit-application

Handles job application form submission with file upload.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - firstName (string)
  - lastName (string)
  - email (string)
  - phone (string)
  - city (string)
  - qualification (string)
  - experience (string)
  - salary (string)
  - skills (string)
  - resume (file) - PDF, DOC, or DOCX (max 40KB)

**Response:**

```json
{
  "success": true,
  "message": "Application submitted successfully! We will contact you soon."
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "Server is running"
}
```

## File Storage

Uploaded files are stored in the `server/uploads/` directory. You can modify the server to delete files after sending or keep them for records.

## Notes

- Files are automatically deleted after email is sent (commented out by default)
- Maximum file size: 40KB
- Allowed file types: PDF, DOC, DOCX
- Email is sent using Gmail SMTP
