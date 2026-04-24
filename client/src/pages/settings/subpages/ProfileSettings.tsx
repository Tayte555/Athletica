import { Edit2Icon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ErrorModal from "../../../components/UI/ErrorModal";

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

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeModal = () => {
    setModal({
      isOpen: false,
      title: "",
      message: "",
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setModal({
          isOpen: true,
          title: "Not logged in",
          message: "You need to be logged in to view your profile settings.",
        });
        return;
      }

      try {
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          setModal({
            isOpen: true,
            title: "Failed to load profile",
            message:
              data.message || "Your profile details could not be loaded.",
          });
          return;
        }

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

        setModal({
          isOpen: true,
          title: "Network error",
          message: "Something went wrong while loading your profile settings.",
        });
      }
    };

    fetchProfile();
  }, []);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setModal({
        isOpen: true,
        title: "Not logged in",
        message: "You need to be logged in to update your profile.",
      });
      return;
    }

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
        setModal({
          isOpen: true,
          title: "Profile update failed",
          message: data.message || "Your profile could not be updated.",
        });
        return;
      }

      setModal({
        isOpen: true,
        title: "Profile saved",
        message: "Your profile details have been saved successfully.",
      });

      setForm((prev) => ({
        ...prev,
        avatar: null,
        avatarUrl: data.avatar
          ? `http://localhost:5555${data.avatar}`
          : prev.avatarUrl,
      }));
    } catch (err) {
      console.error("Error updating profile:", err);

      setModal({
        isOpen: true,
        title: "Network error",
        message:
          "Something went wrong while saving your profile. Please try again.",
      });
    }
  };

  return (
    <div>
      <h1 className="border-b border-black pb-2 text-xl font-medium">
        Public Profile
      </h1>

      <div className="mt-4 flex items-center space-x-4">
        <div className="relative h-36 w-36">
          <img
            src={
              form.avatar
                ? URL.createObjectURL(form.avatar)
                : form.avatarUrl
                  ? form.avatarUrl
                  : "/assets/default-avatar.jpg"
            }
            className="h-36 w-36 rounded-full object-cover"
            alt="Profile avatar"
          />

          <button
            type="button"
            onClick={openFilePicker}
            className="absolute bottom-0 right-0 rounded-md border bg-white p-2 shadow hover:bg-gray-100"
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
        <label className="mb-1 block text-sm font-bold">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none"
        />
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-sm font-bold">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
          maxLength={300}
          placeholder="Tell people about yourself..."
          className="w-full resize-none border-b border-gray-300 bg-transparent py-1 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">{form.bio.length}/300</p>
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-sm font-bold">Location</label>
        <input
          type="text"
          value={form.location}
          list="location-options"
          placeholder="Start typing your city..."
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none"
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
        <label className="mb-1 block text-sm font-bold">Pronouns</label>
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
          className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none"
        >
          <option value="">Prefer not to say</option>
          <option value="He/Him">He/Him</option>
          <option value="She/Her">She/Her</option>
          <option value="They/Them">They/Them</option>
          <option value="He/They">He/They</option>
          <option value="She/They">She/They</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      {form.pronouns === "Custom" && (
        <div className="mt-5">
          <label className="mb-1 block text-sm font-bold">
            Custom pronouns
          </label>
          <input
            type="text"
            value={form.customPronouns}
            placeholder="Enter your pronouns"
            onChange={(e) =>
              setForm({ ...form, customPronouns: e.target.value })
            }
            className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none"
          />
        </div>
      )}

      <div className="mt-5">
        <label className="mb-1 block text-sm font-bold">Link</label>
        <input
          type="text"
          value={form.link}
          placeholder="https://example.com"
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none"
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
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              form.isPrivate ? "left-8" : "left-1"
            }`}
          />
        </button>
      </div>

      <button
        className="mt-4 rounded-md bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
        onClick={handleSaveChanges}
      >
        Save Changes
      </button>

      <ErrorModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </div>
  );
}
