export async function uploadImage(
  url: string,
  file: File,
  fieldName = "image",
): Promise<string> {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data.imageUrl;
}
