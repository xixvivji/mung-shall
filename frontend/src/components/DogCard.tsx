import { MapPin, Calendar, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DogCardProps {
  id: number;
  name: string;
  breed: string;
  age: string;
  gender: string;
  location: string;
  image: string;
  description: string;
}

export function DogCard({ name, breed, age, gender, location, image, description }: DogCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-[hsl(var(--primary))] hover:text-white transition-colors">
          <Heart size={20} />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-[hsl(var(--secondary))] mb-1">{name}</h4>
          <p className="text-[hsl(var(--text-secondary))]">{breed}</p>
        </div>

        <p className="text-sm text-[hsl(var(--text-secondary))] line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1 text-[hsl(var(--text-secondary))]">
            <Calendar size={16} />
            <span>{age}</span>
          </div>
          <div className="px-3 py-1 bg-[hsl(var(--surface))] rounded-full text-[hsl(var(--text-secondary))]">
            {gender}
          </div>
          <div className="flex items-center gap-1 text-[hsl(var(--text-secondary))]">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
        </div>

        <button className="w-full py-3 bg-[hsl(var(--primary))] text-white rounded-xl hover:bg-[hsl(var(--primary-hover))] transition-colors">
          자세히 보기
        </button>
      </div>
    </div>
  );
}
