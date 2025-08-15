'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const Filter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType = searchParams.get('type') || 'all';
  const [filter, setFilter] = useState(initialType);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (filter === 'all') {
      params.delete('type');
    } else {
      params.set('type', filter);
    }
    router.push(`?${params.toString()}`);
  }, [filter]);

  return (
    <div className="flex items-center gap-4 px-4 md:px-20 mb-6">
      <label htmlFor="typeFilter" className="font-medium text-gray-700">
        Filter:
      </label>
      <select
        id="typeFilter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All</option>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
      </select>
    </div>
  );
};

export default Filter;
