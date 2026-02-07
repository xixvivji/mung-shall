import AdoptionStatusTag from "@/features/adoption/components/AdoptionStatusTag";

type DogGalleryProps = {
  images: string[];
  statusLabel: string;
};

export default function DogGallery({ images, statusLabel }: DogGalleryProps) {
  const [mainImage, ...restImages] = images;
  const thumbnails = restImages.slice(0, 2);
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#eee] bg-[#f7f7f7]">
        <div className="absolute right-4 top-4 z-10">
          <AdoptionStatusTag label={statusLabel} />
        </div>
        {mainImage ? (
          <img alt="" className="h-full w-full object-cover" src={mainImage} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#999]">No image</div>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => {
          const src = thumbnails[index];
          return (
            <div key={`${src ?? "placeholder"}-${index}`} className="aspect-[4/3] overflow-hidden rounded-2xl border border-[#eee] bg-[#f7f7f7]">
              {src ? (
                <img alt="" className="h-full w-full object-cover" src={src} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#999]">No image</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
