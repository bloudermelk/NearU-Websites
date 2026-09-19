import Image from "next/image";

export type ImageStackItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizeX: 1 | 2 | 3 | 4 | 5;
  sizeY: 1 | 2 | 3 | 4 | 5;
  posX: "left" | "center" | "right";
  posY: "top" | "bottom";
  shadow: 0 | 1 | 2 | 3 | 4 | 5;
  corner: 0 | 1 | 2 | 3 | 4 | 5;
};

/**
 * The theme's "imagestack" ACF block: two overlapping images laid out on a 5x5
 * CSS grid via data-* attributes (see .imagestack rules in theme.css).
 */
export function ImageStack({ items }: { items: ImageStackItem[] }) {
  return (
    <div className="imagestack">
      {items.map((img) => (
        <Image
          key={img.src}
          width={img.width}
          height={img.height}
          src={img.src}
          className="imagestack-item"
          alt={img.alt}
          data-size-x={img.sizeX}
          data-size-y={img.sizeY}
          data-pos-x={img.posX}
          data-pos-y={img.posY}
          data-shadow={img.shadow}
          data-corner={img.corner}
        />
      ))}
    </div>
  );
}
