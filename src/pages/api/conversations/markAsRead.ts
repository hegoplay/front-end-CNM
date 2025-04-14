"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { RegisterResponse } from "@/models/RegisterResponse";
import { UserResponseDto } from "@/types/user";
import { BasicResponse } from "@/types/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BasicResponse | null>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json(null);
  }
  if (!req.body.conversationId) {
    return res.status(400).json({ error: "conversationId is required" });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/conversations/mark-as-read/${req.body.conversationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Thêm headers khác nếu cần (Authorization, etc.)
        "Authorization": `Bearer ${req.cookies.authToken}`,
      },
    });

    // Xử lý response không thành công
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    // const data = await response.json();
    return res.status(200).json({success: true});
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json(null);
  }
}
