"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditImage() {
  const [imageDetails, setImageDetails] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchImageDetails();
    }
  }, [id]);

  const fetchImageDetails = async () => {
    try {
      const res = await fetch(`/api/admin/images/${id}`);
      const data = await res.json();
      if (res.ok) {
        setImageDetails(data.image);
      } else {
        setError(data.error || "Failed to load image details");
      }
    } catch (err) {
      setError("Error fetching image details");
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    // Update logic here
  };

  if (error) return <p>{error}</p>;
  if (!imageDetails) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Image - {imageDetails.title}</h1>
      <form onSubmit={handleUpdate}>
        {/* Add similar form fields as in upload to edit these details */}
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

