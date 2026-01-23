type DogGalleryProps = {
  images: string[];
};

export default function DogGallery({ images }: DogGalleryProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {images.map((src, index) => (
        <div key={`${src}-${index}`} className="aspect-[4/3] overflow-hidden rounded-lg bg-[#f3f3f3]">
          <img alt="" className="h-full w-full object-cover" src={src} />
        </div>
      ))}
    </div>
  );
}
