export async function registerAction(prevState: any, formData: FormData) {
  try {
    // Extract data from FormData
    const name = formData.get('name') as string; // Type assertion
    const avatar = formData.get('avatar') as File; // Type assertion
    const dateOfBirth = formData.get('dateOfBirth') as string; // Type assertion
    const password = formData.get('password') as string; // Type assertion
    const phone = formData.get('phone') as string; // Type assertion
    const gender = formData.get('gender') as string; // Type assertion

    // console.log("formData", avatar);

    // Basic validation (add more as needed)
    if (!name || !dateOfBirth || !phone || !gender || !password) {
      // console.error("Missing required fields");
      return { success: false, message: "Missing required fields" }; // Or throw an error
    }

    // Log FormData (for debugging)
    console.log("formData", formData);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 500, 400)
      console.error(`HTTP error! status: ${response.status}`);
      return { success: false, message: `HTTP error! status: ${response.status}` };
    }

    const data = await response.json();
    console.log("Response from backend:", data);

    return { success: true, ...data };// Or return { success: true, ...data };

  } catch (error) {
    console.error("Error during registration:", error);
    return { success: false, message: "Registration failed", error: error }; // Or throw an error
  }
}