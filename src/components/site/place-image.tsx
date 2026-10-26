import Image, { type ImageProps } from "next/image";

/** next/image avec rendu direct pour les SVG (déjà légers) et optimisation AVIF/WebP pour les photos. */
export function PlaceImage({ src, alt, ...rest }: Omit<ImageProps, "src" | "alt"> & { src: string; alt: string }) {
  const isSvg = src.toLowerCase().endsWith(".svg");
  return <Image src={src} alt={alt} unoptimized={isSvg} {...rest} />;
}
