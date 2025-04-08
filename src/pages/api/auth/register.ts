import { NextApiRequest, NextApiResponse } from "next";
import { RegisterResponse } from "@/models/RegisterResponse";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const form = formidable({
      maxFileSize: 20 * 1024 * 1024,
      keepExtensions: true,
      allowEmptyFiles: false,
      multiples: false // Chỉ cho phép upload 1 file
    });
  
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Validate required fields
    const name = fields.name?.[0] || "";
    const phone = fields.phone?.[0] || "";
    const dateOfBirth = fields.dateOfBirth?.[0] || "";
    const gender = fields.gender?.[0] || "";
    
    if (!name || !phone || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Prepare form data for Java backend
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("gender", gender === 'nam' ? 'true' : 'false');
    formData.append("password", fields.password?.[0] || "");

    // Append file if exists
    const avatarFile = files.avatar?.[0];
    console.log("avatarFile", files);
    if (avatarFile) {
      const fileBlob = new Blob([fs.readFileSync(avatarFile.filepath)], {
        type: avatarFile.mimetype || 'application/octet-stream'
      });
      formData.append("avatar", fileBlob, avatarFile.originalFilename || "avatar");
    }

    // Send to Java backend
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const backendResponse = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      body: formData,
      // Headers sẽ được tự động set với boundary khi dùng FormData
      headers: {
        // KHÔNG đặt Content-Type, browser sẽ tự thêm boundary
      }
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API responded with status ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    return res.status(200).json({
      success: true,
      message: "Registration successful",
      ...data
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error"
    });
  }
}