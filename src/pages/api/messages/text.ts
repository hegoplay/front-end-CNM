'use server'

import { RegisterResponse } from "@/models/RegisterResponse";
import { MessageResponse } from "@/types/chat";
import { BasicResponse } from "@/types/utils";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BasicResponse>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      message: "Method not allowed" 
    });
  }




  try {
    const token = req.cookies['authToken']
    // Validate input
    console.log("req.body", req.body)
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/messages/text`, {

      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token|| ''}`
      },
      body: JSON.stringify({ ...req.body,type: "TEXT" }),
    });
    // Xử lý response không thành công
    if (response.status != 200) {
      throw new Error(`Gửi tin nhắn thất bại`);
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