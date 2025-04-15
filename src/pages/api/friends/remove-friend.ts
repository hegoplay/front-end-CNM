"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { BasicResponse } from "@/types/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BasicResponse | null>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json(null);
  }

  const {friendPhone} = req.body

  // console.log("receiverPhone:", receiverPhone);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Sửa lại env variable
    const response = await fetch(`${apiUrl}/friends/remove-friend?friendPhoneNumber=${friendPhone}`, {
      method: "DELETE",
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

    const data = await response.text();
    // const data = await response.json();
    return res.status(200).json({success: true, data: data});
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json(null);
  }
}
