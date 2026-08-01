"use client";

import Image from "next/image";
import { useState } from "react";

import { getInitials, resolveMediaUrl } from "@/lib/media";

type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  priority?: boolean;
};

export function UserAvatar({
  name,
  src,
  size = 48,
  className = "",
  priority = false,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const imageUrl = failed ? null : resolveMediaUrl(src);

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden bg-emerald-100 font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200 ${className}`}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true" className="text-[0.78em] tracking-tight">
          {getInitials(name)}
        </span>
      )}
    </span>
  );
}
