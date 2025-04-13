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
    const { conversationId } = req.query;
    const token = req.cookies['authToken']
    // Validate input
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    console.log("apiUrl", conversationId);
    const response = await fetch(`${apiUrl}/conversations/initialize/${conversationId}`, {

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
    return res.status(200).json({success: true, message: "success"});

  } catch (error) {
    console.error("initialize conversation Error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}