'use server'

import { RegisterResponse } from "@/models/RegisterResponse";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  
  // Chỉ chấp nhận phương thức DELETE
  if (req.method !== "DELETE") {
    return res.status(405).json({ 
      success: false, 
      message: "Method not allowed" 
    });
  }
  const { id } = req.query;

  try {
    const token = req.cookies['authToken']
    // Validate input
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/messages/${id}`, {

      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token|| ''}`
      },
      body: JSON.stringify({}),
    });
    // Xử lý response không thành công
    if (response.status != 200) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error(`Xóa tin nhắn thất bại`);
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