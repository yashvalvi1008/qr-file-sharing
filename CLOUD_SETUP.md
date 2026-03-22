# Connect this project to the cloud (MongoDB Atlas + AWS S3)

The app is already built for cloud: it stores **files in S3** and **metadata in MongoDB**. You only need to create the services and set **environment variables**.

---

## 1. MongoDB Atlas (database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → create a **free** cluster (if you don’t have one).
2. **Database Access** → create a user (username + password). Save the password.
3. **Network Access** → **Add IP Address**:
   - For development: **Add Current IP Address** (or `0.0.0.0/0` for testing — less secure).
   - For Vercel/serverless: use `0.0.0.0/0` or Atlas’s **Vercel integration** so Atlas allows your app’s IPs.
4. **Clusters** → **Connect** → **Drivers** → copy the connection string.  
   It looks like:
   ```text
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your user password. If the password has special characters, [URL-encode](https://www.urlencoder.org/) them.
6. Choose a database name in the path (e.g. `qr_filesharing` or `qr-file-sharingg`). The app will create collections on first use.

---

## 2. AWS S3 (file storage)

1. **S3** → create a bucket (private, block public access — recommended).
2. **IAM** → create a user (programmatic access) with a policy that allows only your bucket, e.g. `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on `arn:aws:s3:::YOUR_BUCKET_NAME/*`.
3. Create **Access key** → copy **Access key ID** and **Secret access key** (keep them secret; rotate if leaked).

---

## 3. Environment variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and set:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Full Atlas URI (`mongodb+srv://...`) |
| `USE_IN_MEMORY_DB` | `false` when using Atlas |
| `STORAGE_PROVIDER` | `s3` for cloud (or `auto` if all AWS vars are set) |
| `AWS_REGION` | e.g. `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | IAM user |
| `AWS_SECRET_ACCESS_KEY` | IAM user |
| `S3_BUCKET_NAME` | Your bucket name |
| `APP_BASE_URL` | Public URL of your app (see below) |
| `JWT_SECRET` | Long random string (for login tokens) |

**Important**

- **`APP_BASE_URL`** must be your real site URL so QR codes point to the right host, e.g.  
  `https://your-app.vercel.app` or `https://yourdomain.com`  
  **Not** `http://localhost:4000` in production.
- Do **not** use `mongodb://mongo:27017/...` unless you run the app **inside Docker Compose** with a `mongo` service. For Atlas + your PC or Vercel, use **`mongodb+srv://...`**.

---

## 4. Run locally (connected to cloud)

```powershell
cd backend
npm install
npm run dev
```

Open `http://localhost:4000`. Uploads go to **S3** and metadata to **Atlas**.

---

## 5. Deploy (e.g. Vercel)

1. Push the repo to GitHub.
2. Import the project in Vercel; root directory is the **repo root** (where `vercel.json` lives).
3. In Vercel → **Settings → Environment Variables**, add the same variables as in `.env` (Production).
4. Redeploy after saving env vars.

If you see **500 / FUNCTION_INVOCATION_FAILED**, open **Runtime Logs** in Vercel — usually missing `MONGODB_URI`, wrong Atlas IP allowlist, or invalid AWS credentials.

---

## 6. Quick checklist

- [ ] Atlas cluster running + user created  
- [ ] Network Access allows your IP (dev) or `0.0.0.0/0` (serverless)  
- [ ] S3 bucket + IAM policy + access keys  
- [ ] `.env` / Vercel env: `MONGODB_URI`, `USE_IN_MEMORY_DB=false`, AWS vars, `S3_BUCKET_NAME`, `APP_BASE_URL`, `JWT_SECRET`  
- [ ] `APP_BASE_URL` matches your deployed URL  

---

## Security

- Never commit `.env` or paste access keys in public chats.
- Rotate IAM keys if they were exposed.
- Use strong `JWT_SECRET` in production.
