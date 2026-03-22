# QR Code File Sharing (Cloud + QR)

A cloud-based QR Code file sharing web app for a university course project.

Users upload a file → backend stores it in **AWS S3** → metadata is stored in **MongoDB** → backend returns a **QR code** that opens a download page → downloads are tracked.

## Features

- **File upload (up to 100MB)**
- **Unique file ID** per upload
- **AWS S3 storage** (private objects)
- **QR code generation** for each file
- **Download page** for scanned QR codes
- **MongoDB metadata** (name, size, type, S3 key, expiry)
- **Download counter**
- **Automatic expiration** (default 24 hours)
- **Clean responsive UI** (vanilla HTML/CSS/JS)

## Architecture (high-level)

```mermaid
flowchart LR
  U[User Browser] -->|Upload file| FE[Frontend: HTML/CSS/JS]
  FE -->|POST /api/upload| API[Node.js + Express API]
  API -->|PutObject| S3[(AWS S3 Bucket)]
  API -->|Save metadata| MDB[(MongoDB)]
  API -->|QR (download URL)| FE

  U2[Other User] -->|Scan QR| FE2[Download Page]
  FE2 -->|GET /api/file/:id| API
  FE2 -->|GET /api/download/:id| API
  API -->|GetObject stream| S3
  API -->|increment downloads| MDB
```

## Data flow (end-to-end)

1. **Upload**: user selects a file on `index.html`.
2. Frontend sends `multipart/form-data` to `POST /api/upload`.
3. Backend:
   - generates an **id**
   - uploads the file to **S3** as a **private** object
   - stores metadata in **MongoDB** with an **expiresAt**
   - generates a **QR code** for the download page URL
4. Frontend shows the QR and a copyable link.
5. Another user scans QR → opens `download.html?id=<id>`.
6. Download page loads metadata via `GET /api/file/:id` and downloads through `GET /api/download/:id`.

## API endpoints

- `POST /api/upload` – upload file to S3 and create metadata
- `GET /api/file/:id` – return metadata and download endpoint
- `GET /api/download/:id` – stream file from S3, increment download counter

### Example API responses

**POST `/api/upload`** (success)

```json
{
  "id": "Y8cC2oQ9QxgQbC5yPj1cA",
  "originalName": "notes.pdf",
  "size": 345234,
  "mimeType": "application/pdf",
  "expiresAt": "2026-03-18T10:20:30.000Z",
  "downloadPageUrl": "http://localhost:4000/download.html?id=Y8cC2oQ9QxgQbC5yPj1cA",
  "qrDataUrl": "data:image/png;base64,iVBORw0KGgoAAA..."
}
```

**GET `/api/file/:id`** (success)

```json
{
  "id": "Y8cC2oQ9QxgQbC5yPj1cA",
  "originalName": "notes.pdf",
  "size": 345234,
  "mimeType": "application/pdf",
  "downloads": 3,
  "createdAt": "2026-03-17T10:20:30.000Z",
  "expiresAt": "2026-03-18T10:20:30.000Z",
  "downloadUrl": "http://localhost:4000/api/download/Y8cC2oQ9QxgQbC5yPj1cA"
}
```

**GET `/api/file/:id`** (expired)

```json
{
  "error": "FileExpired",
  "message": "This file has expired."
}
```

## Database schema (MongoDB)

Collection: `files`

```js
{
  _id: "Y8cC2oQ9QxgQbC5yPj1cA",
  originalName: "notes.pdf",
  mimeType: "application/pdf",
  size: 345234,
  bucket: "qr-filesharing-prod",
  s3Key: "Y8cC2oQ9QxgQbC5yPj1cA/notes.pdf",
  downloads: 3,
  createdAt: ISODate("2026-03-17T10:20:30.000Z"),
  expiresAt: ISODate("2026-03-18T10:20:30.000Z")
}
```

## AWS S3 setup (beginner friendly)

### 1) Create a bucket

- Open AWS Console → **S3** → **Create bucket**
- Bucket name: e.g. `qr-filesharing-yourname`
- Region: choose a nearby region
- **Block all public access**: ON (recommended)
- Create bucket

### 2) Create an IAM user for the app

- AWS Console → **IAM** → Users → Create user (e.g. `qr-filesharing-app`)
- Attach a policy that allows only S3 actions for your bucket.

Example policy (edit bucket name + region as needed):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowBucketObjectAccess",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::qr-filesharing-yourname/*"
    }
  ]
}
```

### 3) Create access keys

- IAM → Users → your user → **Security credentials** → **Create access key**
- Copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### 4) (Recommended) Add automatic S3 expiration

Even though the app enforces expiration in MongoDB, you should also configure **S3 Lifecycle rules** so objects are deleted automatically:

- S3 bucket → **Management** → **Lifecycle rules** → Create rule
- Apply to: all objects (or a prefix)
- Expire current versions: **1 day**

## Where the cloud integration happens (code pointers)

- **Upload to S3**: `backend/services/s3Service.js` (`uploadToS3`)
- **Create file record**: `backend/models/File.js`
- **Upload API**: `backend/controllers/uploadController.js`
- **Download streaming from S3**: `backend/controllers/downloadController.js`
- **QR generation**:
  - On upload (base64 data URL): `backend/controllers/uploadController.js`
  - As PNG endpoint: `GET /api/qr/:id` in `backend/controllers/qrController.js`
- **Expiration enforcement**:
  - API blocks expired files (`410 Gone`): `fileController` and `downloadController`
  - Background cleanup (every 30 min): `backend/services/cleanupService.js`

## Connect to cloud (Atlas + S3)

Step-by-step: **[CLOUD_SETUP.md](./CLOUD_SETUP.md)** (MongoDB Atlas, AWS S3, environment variables, Vercel).

## Run locally (Windows / macOS / Linux)

### Prerequisites

- Node.js 18+ (recommended 20+)
- MongoDB (local) or MongoDB Atlas
- AWS S3 bucket + access keys

### 1) Configure environment variables

Copy:

- `backend/.env.example` → `backend/.env`

Then fill values (see **`CLOUD_SETUP.md`** for cloud connection details).

### 2) Install and run backend

```bash
cd backend
npm install
npm run dev
```

Open:

- App: `http://localhost:4000`

## Deploy (cloud)

### Backend hosting options

- **Render / Railway / Fly.io** (simple)
- **AWS Elastic Beanstalk** (AWS-native)
- **EC2** (manual but flexible)

### Recommended deployment combo (course-project friendly)

- **Frontend**: served by the Node backend (already configured)
- **Backend**: Render/Railway
- **MongoDB**: MongoDB Atlas free tier
- **Storage**: AWS S3

### Deployment checklist

- Set production environment variables (same as `.env.example`)
- Set `APP_BASE_URL` to your deployed URL (for QR links)
- Ensure your host allows requests up to 100MB

## Security considerations

- **S3 objects stay private** (no public bucket/object access)
- Downloads go through your API (`/api/download/:id`) so you can:
  - enforce **expiration**
  - increment **download counter**
  - avoid exposing S3 credentials
- Add rate limits and secure headers (already included)
- Keep `.env` out of git (already in `.gitignore`)
- Use long random IDs (nanoid) so guessing is impractical

---

If you want, I can also add optional user accounts (login), password-protected shares, or one-time download links.
