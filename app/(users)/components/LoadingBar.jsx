"use client";

import { BarLoader } from "react-spinners";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300); // fake delay
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    loading && (
      <div className="fixed top-15 md:top-18 left-0 w-full z-40"> 
        <BarLoader
          color="green"
          height={4}
          width="100%"
          speedMultiplier={1.5}
        />
      </div>
    )
  );
}
