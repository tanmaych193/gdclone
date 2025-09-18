// uploadFile.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../s3Client.js";
import fs from "fs";
import path from "path";

/**
 * Uploads a file to S3
 * @param {string} filePath - Local path to the file
 * @param {string} fileName - The key (filename) in S3
 */
export const uploadFileToS3 = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ACL: "public-read", // Optional: allows public access
    ContentType: getMimeType(filePath),
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("File uploaded successfully:", data);
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return fileUrl;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

// Optional: basic content type guessing
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".mp4") return "video/mp4";
  return "application/octet-stream";
};