import { OptimizedImage } from "@/components/shared/optimized-image";

interface PhotoGridProps {
  photos: string[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo, index) => (
        <OptimizedImage
          key={photo}
          src={photo}
          alt={`Profile photo ${index + 1}`}
          width={400}
          height={500}
          className="rounded-xl aspect-[3/4] object-cover"
          priority={index < 3}
        />
      ))}
    </div>
  );
}
