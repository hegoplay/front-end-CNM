'use server'

import { RegisterResponse } from "@/models/RegisterResponse";
import { BasicResponse } from "@/types/utils";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BasicResponse | null>  
) {
  
  // Chỉ chấp nhận phương thức DELETE
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      message: "Method not allowed" 
    });
  }
  const { conversationId } = req.query;

  console.log("converastionId:", conversationId);

  try {
    const token = req.cookies['authToken']
    // Validate input
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    // console.log("emoji:", req.body.emoji);  
    const response = await fetch(`${apiUrl}/messages/conversation/${conversationId}`, {

      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token|| ''}`
      },
      body: JSON.stringify({}),
    });
    // Xử lý response không thành công
    if (response.status != 200) {
      throw new Error(`Thêm reaction tin nhắn thất bại`);
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