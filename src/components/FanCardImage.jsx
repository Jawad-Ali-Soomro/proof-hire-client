import { useState } from "react";
import { fallbackSrc } from "../data/landingImages.js";

export default function FanCardImage({ primary, index }) {
  const [src, setSrc] = useState(primary);

  return (
    <img
      src={src}
      alt=""
      className="h-full w-full object-cover"
      width={800}
      height={600}
      loading={index > 2 ? "lazy" : "eager"}
      decoding="async"
      referrerPolicy="no-referrer-when-downgrade"
      onError={() => {
        setSrc((current) =>
          current.includes("picsum.photos") ? current : fallbackSrc(index)
        );
      }}
    />
  );
}
