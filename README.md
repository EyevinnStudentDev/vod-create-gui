<h1 align="center">
  VOD Create GUI
</h1>

<div align="center">
    <strong>VOD Create GUI</strong> is a user-friendly web-based application designed to simplify video transcoding and storage management using MinIO. Upload videos, transcode them to streaming-friendly formats, and efficiently manage your video content.
  <br />
  <br />
  :book: <b><a href="https://eyevinn.github.io/{{repo-name}}/">Read the documentation (github pages)</a></b> :eyes:
  <br />
</div>

<div align="center">
<br />

[![github release](https://img.shields.io/github/v/release/EyevinnStudentDev/vod-create-gui?style=flat-square)](https://github.com/EyevinnStudentDev/vod-create-gui/releases)
[![license](https://img.shields.io/github/license/eyevinn/{{repo-name}}.svg?style=flat-square)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg?style=flat-square)](https://github.com/EyevinnStudentDev/vod-create-gui/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![made with love by Eyevinn](https://img.shields.io/badge/made%20with%20%E2%99%A5%20by-Eyevinn-59cbe8.svg?style=flat-square)](https://github.com/EyevinnStudentDev)
[![Slack](http://slack.streamingtech.se/badge.svg)](http://slack.streamingtech.se)
</div>

---

## Features

✅ **Upload video files** into MinIO for secure storage  
✅ **Transcode video** into HLS format for streaming  
✅ **Presigned URL generation** for secure file uploads  
✅ **Built with Next.js** for modern web development  
✅ **Docker support** for easy deployment  

---

## Requirements

- **Node.js v18.15.0 or higher** (For running Next.js)  
- **npm v8.5.0 or higher** (For managing dependencies)  
- **Next.js v14.1.3 or higher** (For frontend and backend logic)  
- **Docker** (For containerized deployment)  
- **MinIO** (For object storage)  

---

## Installation Guide

### **1. Clone the Repository**
```bash
git clone https://github.com/EyevinnStudentDev/vod-create-gui.git
cd vod-create-gui
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Environment Variables**
Create a `.env` file in the root directory and add the following configuration, where you replace the values with corresponding values from your services. All of which are available at Eyevinn's OSAAS: https://app.osaas.io/:
```bash
# for API calls to OSAAS
OSC_ACCESS_TOKEN=OSC_ACCESS_TOKEN

# MinIO Storage
MINIO_ACCESS_KEY=MINIO_ACCESS_KEY
MINIO_SECRET_ACCESS_KEY=MINIO_SECRET_ACCESS_KEY

# MinIO input bucket
AWS_ACCESS_KEY=AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY
AWS_TENANT_BUCKET=AWS_TENANT_BUCKET

# MinIO output bucket
AWS_URL_OUT=AWS_URL_OUT
AWS_ACCESS_KEY_OUT=AWS_ACCESS_KEY_OUT
AWS_SECRET_ACCESS_KEY_OUT=AWS_SECRET_ACCESS_KEY_OUT

AWS_URL=AWS_URL
AWS_SSL=AWS_SSL
```

### **4. Run the Application**

#### **Development Mode**
```bash
npm run dev
```

#### **Production Mode**
```bash
npm run build
npm start
```
The application will be available at **http://localhost:3000**.

---

## **Docker Setup**
To run the application inside Docker, follow these steps:

### **1. Build the Docker Image**
```bash
docker build --no-cache -t vod-create-gui .
```

### **2. Run the Application with Docker**
```bash
docker run --env-file .env -p 3000:3000 vod-create-gui
```

This will start the application in a Docker image.

---

## **API Endpoints**
| **Method** | **URL** | **Description** | **Requires Body?** |
|------------|---------|----------------|--------------------|
| `GET` | `/api/getFiles` | Fetch input files from MinIO | No |
| `GET` | `/api/getTranscodedFiles` | Fetch transcoded files from MinIO | No |
| `POST` | `/api/presignedUrl` | Generate presigned URL for upload | Yes |
| `POST` | `/api/presignedEncore` | Generate presigned URL for transcoding with SVT Encore | Yes |
| `POST` | `/api/presignedTranscoded` | Generate presigned URL transcoded file in output MinIO bucket | Yes |
| `POST` | `/api/transcode` | Start video transcoding | Yes |
| `DELETE` | `/api/deleteFile` | Delete a file from MinIO | Yes |
| `DELETE` | `/api/emptyBucket` | Deletes all transcoded files from the MinIO output bucket | No |

---

## **Development Notes**
- The **frontend** is built using **Next.js, TailwindCSS, and TypeScript**.
- The **backend** uses **Next.js API routes** to manage video uploads and processing.
- **MinIO** is used for storing video files before and after transcoding.

---

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## License

This project is licensed under the MIT License, see [LICENSE](LICENSE).

# Support

Join our [community on Slack](http://slack.streamingtech.se) where you can post any questions regarding any of our open source projects. Eyevinn's consulting business can also offer you:

- Further development of this component
- Customization and integration of this component into your platform
- Support and maintenance agreement

Contact [sales@eyevinn.se](mailto:sales@eyevinn.se) if you are interested.

# About Eyevinn Technology

[Eyevinn Technology](https://www.eyevinntechnology.se) is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor. As our way to innovate and push the industry forward we develop proof-of-concepts and tools. The things we learn and the code we write we share with the industry in [blogs](https://dev.to/video) and by open sourcing the code we have written.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!
