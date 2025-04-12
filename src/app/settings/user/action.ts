"use client"; // Đánh dấu đây là Server Action

import { UserUpdateRequest } from "@/types/user"; // Đảm bảo type này tồn tại

// Định nghĩa type cho state trả về
export interface FormState {
  success: boolean;
  error: string | null;
}

// Hàm action xử lý cập nhật thông tin user
export async function updateUserAction(
  prevState: FormState | null,
  formData: FormData,
  updateUserInfo: (updates: Partial<UserUpdateRequest>) => Promise<void> // Truyền hàm từ context
): Promise<FormState> {
  const name = formData.get("name") as string;
  const isMale = formData.get("isMale") === "true"; // Chuyển string thành boolean
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const bio = formData.get("bio") as string;
  const baseImgFile = formData.get("baseImg") as File | null;
  const backgroundImgFile = formData.get("backgroundImg") as File | null;

  console.log("baseImgFile:", baseImgFile);
  console.log("backgroundImgFile:", backgroundImgFile);

  try {
    await updateUserInfo({
      name,
      isMale,
      dateOfBirth,
      bio,
      baseImg: baseImgFile || undefined, // Không cần selectedFile vì file đã lấy từ formData
      backgroundImg: backgroundImgFile || undefined,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Lỗi cập nhật thông tin người dùng:", error);
    return { success: false, error: "Cập nhật thông tin thất bại" };
  }
}