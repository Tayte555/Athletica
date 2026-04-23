import { Edit2Icon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ProfileSettings() {
  const [form, setForm] = useState({
    avatar: null as File | null,
    avatarUrl: "",
    name: "",
    bio: "",
    location: "",
    pronouns: "",
    customPronouns: "",
    link: "",
    isPrivate: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const savedPronouns = data.pronouns || "";
        const presetPronouns = [
          "",
          "He/Him",
          "She/Her",
          "They/Them",
          "He/They",
          "She/They",
        ];

        setForm({
          avatar: null,
          avatarUrl: data.avatar ? `http://localhost:5555${data.avatar}` : "",
          name: data.name || "",
          bio: data.bio || "",
          location: data.location || "",
          pronouns: presetPronouns.includes(savedPronouns)
            ? savedPronouns
            : "Custom",
          customPronouns: presetPronouns.includes(savedPronouns)
            ? ""
            : savedPronouns,
          link: data.link || "",
          isPrivate: Boolean(data.isPrivate),
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const finalPronouns =
      form.pronouns === "Custom" ? form.customPronouns : form.pronouns;

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("bio", form.bio);
    formData.append("location", form.location);
    formData.append("pronouns", finalPronouns);
    formData.append("link", form.link);
    formData.append("isPrivate", String(form.isPrivate));

    if (form.avatar) {
      formData.append("avatar", form.avatar);
    }

    try {
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update profile");
        return;
      }

      console.log("Profile updated:", data);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div>
      <h1 className="border-b pb-2 border-black text-xl font-medium">
        Public Profile
      </h1>

      <div className="flex items-center space-x-4 mt-4">
        <div className="relative w-36 h-36">
          <img
            src={
              form.avatar
                ? URL.createObjectURL(form.avatar)
                : form.avatarUrl
                  ? form.avatarUrl
                  : "/assets/default-avatar.jpg"
            }
            className="w-36 h-36 rounded-full object-cover"
            alt="Profile avatar"
          />

          <button
            type="button"
            onClick={openFilePicker}
            className="absolute bottom-0 right-0 bg-white border rounded-md p-2 shadow hover:bg-gray-100"
          >
            <Edit2Icon size={16} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setForm({
                ...form,
                avatar: e.target.files[0],
              });
            }
          }}
        />
      </div>

      <div className="mt-5">
        <label className="text-sm font-bold mb-1 block">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full py-1 border-b border-gray-300 focus:outline-none bg-transparent"
        />
      </div>

      <div className="mt-5">
        <label className="text-sm font-bold mb-1 block">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
          maxLength={300}
          placeholder="Tell people about yourself..."
          className="w-full py-1 border-b border-gray-300 focus:outline-none resize-none bg-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">{form.bio.length}/300</p>
      </div>

      <div className="mt-5">
        <label className="text-sm font-bold mb-1 block">Location</label>
        <input
          type="text"
          value={form.location}
          list="location-options"
          placeholder="Start typing your city..."
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="w-full py-1 border-b border-gray-300 focus:outline-none bg-transparent"
        />

        <datalist id="location-options">
          <option value="Birmingham, UK" />
          <option value="London, UK" />
          <option value="Manchester, UK" />
          <option value="Leeds, UK" />
          <option value="Liverpool, UK" />
          <option value="Nottingham, UK" />
          <option value="Coventry, UK" />
        </datalist>
      </div>

      <div className="mt-5">
        <label className="text-sm font-bold mb-1 block">Pronouns</label>
        <select
          value={form.pronouns}
          onChange={(e) =>
            setForm({
              ...form,
              pronouns: e.target.value,
              customPronouns:
                e.target.value === "Custom" ? form.customPronouns : "",
            })
          }
          className="w-full py-1 border-b border-gray-300 focus:outline-none bg-transparent"
        >
          <option value="">Prefer not to say</option>
          <option value="He/Him">He/Him</option>
          <option value="She/Her">She/Her</option>
          <option value="They/Them">They/Them</option>
          <option value="He/They">He/They</option>
          <option value="She/They">She/They</option>
        </select>
      </div>

      <div className="mt-5">
        <label className="text-sm font-bold mb-1 block">Link</label>
        <input
          type="text"
          value={form.link}
          placeholder="https://example.com"
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          className="w-full py-1 border-b border-gray-300 focus:outline-none bg-transparent"
        />
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border p-4">
        <div>
          <p className="font-semibold">Private account</p>
          <p className="text-sm text-gray-500">
            Only approved followers can view your full profile.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({ ...prev, isPrivate: !prev.isPrivate }))
          }
          className={`relative h-7 w-14 rounded-full transition ${
            form.isPrivate ? "bg-gray-900" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute bg-white top-1 h-5 w-5 rounded-full  transition ${
              form.isPrivate ? "left-8" : "left-1"
            }`}
          />
        </button>
      </div>

      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
        onClick={handleSaveChanges}
      >
        Save Changes
      </button>
    </div>
  );
}
