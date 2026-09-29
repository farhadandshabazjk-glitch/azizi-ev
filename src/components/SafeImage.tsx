"use client";

import { useState } from "react";

/**
 * Image with a designed fallback surface, so a missing file degrades into
 * the showroom green instead of leaving a hole in the layout.
 */
export default function SafeImage({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={`${className} bg-[repeating-linear-gradient(135deg,#0e4a3c_0px,#0e4a3c_14px,#14614f_14px,#14614f_28px)]`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
