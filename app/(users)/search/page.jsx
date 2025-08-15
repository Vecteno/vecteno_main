"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FaCrown } from "react-icons/fa";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const selectedCategory = category || "All Creatives";

  const showCategoryName = selectedCategory !== "All Creatives";
  const hasQuery = query.trim().length > 0;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      const url = `/api/search?q=${encodeURIComponent(query)}${category ? `&category=${encodeURIComponent(category)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.images);
      setLoading(false);
    };
    // Fetch if query or category exists (to handle category-only searches)
    if (hasQuery || showCategoryName) {
      fetchSearchResults();
    } else {
      // If neither query nor category, reset results & loading
      setResults([]);
      setLoading(false);
    }
  }, [query, category]);

  return (
    <div className="max-w-full min-h-[90vh] mx-auto p-6">
      <h1 className="text-xl text-gray-700 font-semibold mb-4">
        {hasQuery ? (
          <>
            Results for <span className="capitalize">"{query}"</span> {showCategoryName && <>in "{selectedCategory}" category</>}
          </>
        ) : showCategoryName ? (
          <>Results in "{selectedCategory}"</>
        ) : (
          <>All Results</>
        )}
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 px-2">
          {results.map((img) => (
            <div
              key={img._id}
              className="relative w-full h-[50%] break-inside-avoid overflow-hidden rounded-lg shadow hover:shadow-xl transition"
            >
              <Link href={`/${img.category.replace(/\s+/g, "-")}/${img.slug}`}>
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full rounded-lg hover:opacity-90 transition-all duration-300"
                />
                {img.type === "premium" && (
                  <div className="absolute top-2 right-2 bg-yellow-400 p-1 rounded-full shadow">
                    <FaCrown className="text-white text-xs" />
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto p-6">Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}
