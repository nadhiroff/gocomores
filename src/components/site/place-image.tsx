import Image, { type ImageProps } from "next/image";

/**
 * next/image avec rendu direct pour les SVG (déjà légers) et optimisation AVIF/WebP pour les photos.
 * Les photos distantes (Wikimedia) sont chargées directement par le navigateur : Wikimedia accepte
 * le lien direct mais filtre les téléchargements serveur sans User-Agent de navigateur.
 */
export function PlaceImage({ src, alt, ...rest }: Omit<ImageProps, "src" | "alt"> & { src: string; alt: string }) {
  const direct = src.toLowerCase().endsWith(".svg") || /^https?:\/\//.test(src);
  return <Image src={src} alt={alt} unoptimized={direct} {...rest} />;
}
