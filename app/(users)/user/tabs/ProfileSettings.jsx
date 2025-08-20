"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DefaultUserIcon from "@/app/components/DefaultUserIcon";

export default function ProfileSettings() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    mobile: "",
    profileImage: "",
    isGoogleUser: false,
  });
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/profileInfo");
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setNewName(data.user.name);
        setPreview(data.user.profileImage);
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadToLocal = async () => {
    const data = new FormData();
    data.append("image", image);
    data.append("type", "profileImages");

    const res = await fetch("/api/upload-profile", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    if (result.success) {
      return result.url;
    } else {
      throw new Error(result.error || "Upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Updating...");

    let imageUrl = user.profileImage;

    if (image) {
      try {
        imageUrl = await uploadToLocal();
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Image upload failed");
        setMessage("Image upload failed");
        return;
      }
    }

    const res = await fetch("/api/updateProfile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        profileImage: imageUrl,
        mobile: user.mobile, // <-- include mobile
      }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success("Profile updated!");
      // Trigger custom event to update navbar
      window.dispatchEvent(new CustomEvent("profileUpdated"));
      // Update local user state
      setUser((prev) => ({
        ...prev,
        name: newName,
        profileImage: imageUrl,
        mobile: user.mobile,
      }));
    } else {
      toast.error(result.error || "Update failed");
    }

    setMessage(result.message || "Update failed");
  };

  const handleChangePassword = async () => {
    if (!newPassword) return setMessage("Enter new password");
    const res = await fetch("/api/changePassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    const result = await res.json();
    setMessage(result.message || "Password change failed");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">Your Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="font-light text-gray-500">
          (Please click the{" "}
          <span className="font-semibold">'Save changes'</span> button after
          updating your data)
        </p>
        <div>
          <label>Name:</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            value={user.email}
            readOnly
            className="border px-3 py-2 rounded w-full bg-gray-100"
          />
        </div>

        <div>
          <label>Mobile Number:</label>
          <input
            type="text"
            value={user.mobile || ""}
            onChange={(e) =>
              setUser({
                ...user,
                mobile: e.target.value.replace(/\D/g, "").slice(0, 10), // only digits, max 10
              })
            }
            inputMode="numeric"
            pattern="\d*"
            placeholder="Enter 10-digit mobile number"
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div>
          <label className="mr-2">Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border border-gray-400 text-center p-1 rounded-lg cursor-pointer hover:bg-gray-300"
          />
          <div className="mt-4 flex flex-col items-center">
            {preview || user.profileImage ? (
              <img
                src={preview || user.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
              />
            ) : (
              <div className="mb-2">
                <DefaultUserIcon size={128} className="shadow-lg" />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Save Changes
        </button>
      </form>

      {!user.isGoogleUser ? (
        <div className="mt-6">
          <h3 className="underline underline-offset-2">Change Password</h3>
          <input
            type="password"
            placeholder="New Password"
            className="border px-3 py-2 mt-2 rounded w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            onClick={handleChangePassword}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-800 cursor-pointer"
          >
            Change Password
          </button>
        </div>
      ) : (
        <div className="mt-6 text-gray-600 italic">
          You are logged in with Google.
        </div>
      )}

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
