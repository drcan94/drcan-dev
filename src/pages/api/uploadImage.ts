interface CloudinaryResponse {
  secure_url: string;
}

interface UploadTypes {
  image: File;
  signature: string;
  timestamp: number;
  folder?: string;
}

export const uploadImage = async (
  uploadInfo: UploadTypes
): Promise<string | null> => {
  try {
    const { image, signature, timestamp, folder } = uploadInfo;
    
    const api_key = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
    
    const formData = new FormData();

    formData.append("file", image);
    formData.append("api_key", api_key);
    formData.append("timestamp", String(timestamp));
    folder && formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
      }/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const data = response.json();
      await data.then((res: { error: { message: string } }) => {
        console.log("error", res.error.message);
      });
    }

    const data: CloudinaryResponse =
      (await response.json()) as CloudinaryResponse;
    console.log("data", data);
    return data.secure_url;
  } catch (err) {
    console.log("Error occurred:", err);
    return null;
  }
};
