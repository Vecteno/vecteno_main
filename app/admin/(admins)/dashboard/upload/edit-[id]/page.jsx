"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditUpload() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    tags: "",
    type: "free",
    thumbnail: null,
    image: null,
    isTrending: false,
    fileTypes: [],
    orientation: [],
  });

  const [imageDetails, setImageDetails] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/images/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setImageDetails(data.image);
          setForm({
            title: data.image.title,
            slug: data.image.slug,
            description: data.image.description,
            category: data.image.category,
            tags: data.image.tags.join(", "),
            type: data.image.type,
            isTrending: data.image.isTrending,
            fileTypes: data.image.fileTypes,
            orientation: data.image.orientation,
          });
        })
        .catch(() => setError("Error loading image details"));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Handle update logic here
  };

  if (error) return <p>{error}</p>;
  if (!imageDetails) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Image - {form.title}</h1>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        {/* Include all other form fields similarly */}
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

