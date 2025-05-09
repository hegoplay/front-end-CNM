'use server'

import { RegisterResponse } from "@/models/RegisterResponse";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "DELETE") {
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
        message: "Phone number is required",
      });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/users/${phone}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token|| ''}`
      },
    });
    // Xử lý response không thành công
    if (response.status != 204) {
      console.log("Response status:", response.status);
      throw new Error(`Không tìm thấy thông tin người dùng`);
    }
    res.setHeader('Set-Cookie', 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    return res.status(200).json({success: true, message: "xoa thanh cong"});

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}