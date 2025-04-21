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
    const { phoneNumber } = req.body;
    const { conversationId } = req.query as { conversationId: string };
    console.log("conversationId ", conversationId);
    console.log("phoneNumber ", phoneNumber);
    const token = req.cookies['authToken']
    // Validate input
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/conversations/${conversationId}/delete-member?memberPhone=${phoneNumber}`, {

      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token|| ''}`
      },
    });
    // Xử lý response không thành công
    if (response.status != 200) {
      const res = await response.json();
      console.error("Error deleting member:", res);
      throw new Error(res.detail || "Failed to delete member");
    }
    return res.status(200).json({success: true, message: "success"});

  } catch (error) {
    console.error("initialize conversation Error:", error);
    // const errorMessage = await (error instanceof Error ? error.message.json());
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}