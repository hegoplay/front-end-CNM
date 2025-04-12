"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { RegisterResponse } from "@/models/RegisterResponse";
import { UserResponseDto } from "@/types/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponseDto | null>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json(null);
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/users/whoami`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Thêm headers khác nếu cần (Authorization, etc.)
        "Authorization": `Bearer ${req.cookies.authToken}`,
      },
      body: JSON.stringify({}),
    });

    // Xử lý response không thành công
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Send Check Phone Error:", error);
    return res.status(500).json(null);
  }
}
