"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface CompanyLogoProps {
  companyName: string;
  fallback?: string;
  size?: number;
}

export default function CompanyLogo({ companyName, fallback, size = 24 }: CompanyLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        // Brandfetch API endpoint - using domain-based lookup
        const domain = companyName.toLowerCase().replace(/\s+/g, "");
        const response = await fetch(
          `https://api.brandfetch.io/v2/brands/${domain}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_BRANDFETCH_API_KEY || ""}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json() as { logos?: Array<{ type?: string; image?: string }> };
          // Try to get the icon or logo - prefer icon, then symbol, then any logo
          const icon = data.logos?.find((logo) => logo.type === "icon") ||
                      data.logos?.find((logo) => logo.type === "symbol") ||
                      data.logos?.find((logo) => logo.type === "logo") ||
                      data.logos?.[0];

          if (icon?.image) {
            setLogoUrl(icon.image);
          }
        }
      } catch {
        // Silently fail - will use fallback
        console.debug("Logo not found for:", companyName);
      } finally {
        setLoading(false);
      }
    };

    if (companyName && process.env.NEXT_PUBLIC_BRANDFETCH_API_KEY) {
      fetchLogo();
    } else {
      setLoading(false);
    }
  }, [companyName]);

  if (loading) {
    return (
      <div
        className="rounded bg-base-300/50 animate-pulse shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={companyName}
        width={size}
        height={size}
        className="rounded shrink-0 object-contain bg-base-100 p-1"
        unoptimized
      />
    );
  }

  // Fallback to text initial
  return (
    <div
      className="rounded bg-base-200 border border-base-300/50 flex items-center justify-center text-xs font-medium text-base-content/60 shrink-0"
      style={{ width: size, height: size }}
    >
      {fallback || companyName.charAt(0).toUpperCase()}
    </div>
  );
}
