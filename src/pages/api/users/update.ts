"use server";
import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files, File } from "formidable";
import { UserResponseDto, UserUpdateRequest } from "@/types/user";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Tắt bodyParser mặc định của Next.js để dùng formidable
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponseDto | { success: boolean; message: string }>
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const form = formidable({
      maxFileSize: 20 * 1024 * 1024, // 20MB
      keepExtensions: true,
      minFileSize: 0,
      allowEmptyFiles: true,
      multiples: false, // Chỉ cho phép upload 1 file
    });

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Log dữ liệu để debug
    // console.log("Fields:", fields);
    // console.log("Files:", files);

    // Validate required fields
    const name = fields.name?.[0] || "";
    const isMale = fields.isMale?.[0] || ""; // "true" hoặc "false" từ form
    const dateOfBirth = fields.dateOfBirth?.[0] || "";
    const bio = fields.bio?.[0] || "";

    if (!name || !isMale || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Prepare form data for Java backend
    const formData = new FormData();
    formData.append("name", name);
    formData.append("isMale", isMale);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("bio", bio);

    // Xử lý baseImg
    const baseImgFile = Array.isArray(files.baseImg) ? files.baseImg[0] : files.baseImg;
    if ( baseImgFile && baseImgFile.size > 0  && baseImgFile.filepath) {
      const fileBlob = new Blob([fs.readFileSync(baseImgFile.filepath)], {
        type: baseImgFile.mimetype || "application/octet-stream",
      });
      formData.append("baseImg", fileBlob, baseImgFile.originalFilename || "baseImg");
    }

    // Xử lý backgroundImg
    const backgroundImgFile = Array.isArray(files.backgroundImg)
      ? files.backgroundImg[0]
      : files.backgroundImg;
    if (backgroundImgFile && backgroundImgFile.size > 0 && backgroundImgFile.filepath ) {
      const fileBlob = new Blob([fs.readFileSync(backgroundImgFile.filepath)], {
        type: backgroundImgFile.mimetype || "application/octet-stream",
      });
      formData.append(
        "backgroundImg",
        fileBlob,
        backgroundImgFile.originalFilename || "backgroundImg"
      );
    }

    // Send to Java backend
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl) {
      throw new Error("API base URL is not defined");
    }

    const backendResponse = await fetch(`${apiUrl}/users/`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${req.cookies.authToken || ""}`,
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API responded with status ${backendResponse.status}`);
    }

    const data: UserResponseDto = await backendResponse.json();
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      ...data,
    });
  } catch (error) {
    console.error("User Update Error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}