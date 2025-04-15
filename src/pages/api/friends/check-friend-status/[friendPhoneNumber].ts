"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { BasicResponse } from "@/types/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BasicResponse | null>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "GET") {
    return res.status(405).json(null);
  }

  // lấy phone từ body
  const {friendPhoneNumber} = req.query;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/friends/check-friend-status/${friendPhoneNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Thêm headers khác nếu cần (Authorization, etc.)
        "Authorization": `Bearer ${req.cookies.authToken}`,
      },
    });

    // Xử lý response không thành công
    if (!response.ok) {
      const content = await response.json();
      console.error("Response not ok: ",content );
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    // const data = await response.json();
    return res.status(200).json({success: true, data: data});
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json(null);
  }
}
