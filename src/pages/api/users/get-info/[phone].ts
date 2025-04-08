'use server'

import { RegisterResponse } from "@/models/RegisterResponse";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "GET") {
    return res.status(405).json({ 
      success: false, 
      message: "Method not allowed" 
    });
  }

  try {
    const { phone } = req.query;
    const token = req.cookies['authToken']
    // Validate input
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number, OTP is required",
      });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/users/${phone}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token|| ''}`
      },
    });
    // Xử lý response không thành công
    if (response.status != 200) {
      throw new Error(`Không tìm thấy thông tin người dùng`);
    }
    const data = await response.json();
    return res.status(200).json({success: true, message: data});

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}