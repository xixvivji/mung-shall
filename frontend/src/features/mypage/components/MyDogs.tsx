import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Heart, MapPin } from 'lucide-react';
import { ImageWithFallback } from '@/shared/ui/figma/ImageWithFallback';

const dogs = {
  interest: [
    {
      id: 1,
      name: '뽀미',
      breed: '포메라니안',
      age: '2살',
      gender: '여아',
      location: '서울 강남구',
      image: 'https://images.unsplash.com/photo-1626211596179-d1fe8beaf75c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb21lcmFuaWFuJTIwZG9nfGVufDF8fHx8MTc2OTA2NzQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 2,
      name: '코코',
      breed: '코기',
      age: '3살',
      gender: '남아',
      location: '경기 성남시',
      image: 'https://images.unsplash.com/photo-1713575029300-cdb14999ff65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JnaSUyMGRvZ3xlbnwxfHx8fDE3NjkwNjIzNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 3,
      name: '시바',
      breed: '시바견',
      age: '1살',
      gender: '여아',
      location: '서울 송파구',
      image: 'https://images.unsplash.com/photo-1676551494386-50763077884c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGliYSUyMGludSUyMGRvZ3xlbnwxfHx8fDE3NjkwMTA0NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
  ],
  applied: [
    {
      id: 4,
      name: '골디',
      breed: '골든 리트리버',
      age: '4살',
      gender: '남아',
      location: '인천 남동구',
      image: 'https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXIlMjBwdXBweXxlbnwxfHx8fDE3NjkwNDkxODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      status: '서류 검토중'
    },
    {
      id: 5,
      name: '비글이',
      breed: '비글',
      age: '2살',
      gender: '여아',
      location: '서울 마포구',
      image: 'https://images.unsplash.com/photo-1631048905843-88f82fba8fd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFnbGUlMjBkb2d8ZW58MXx8fHwxNzY5MDIyOTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      status: '인터뷰 대기'
    },
  ],
  completed: []
};

export function MyDogs() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl text-gray-400 mb-8">내 강아지들</h2>
      
      <Tabs defaultValue="interest" className="w-full">
        <TabsList className="mb-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="interest" className="rounded-md px-8">
            관심 ({dogs.interest.length})
          </TabsTrigger>
          <TabsTrigger value="applied" className="rounded-md px-8">
            신청 ({dogs.applied.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-md px-8">
            완료 ({dogs.completed.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="interest">
          <div className="grid grid-cols-3 gap-6">
            {dogs.interest.map((dog) => (
              <div key={dog.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <ImageWithFallback 
                    src={dog.image} 
                    alt={dog.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{dog.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{dog.breed} · {dog.age} · {dog.gender}</p>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{dog.location}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="applied">
          <div className="grid grid-cols-3 gap-6">
            {dogs.applied.map((dog) => (
              <div key={dog.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <ImageWithFallback 
                    src={dog.image} 
                    alt={dog.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-blue-400 text-white border-0">
                      {dog.status}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{dog.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{dog.breed} · {dog.age} · {dog.gender}</p>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{dog.location}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="text-center py-12 text-gray-400">
            아직 입양 완료된 강아지가 없습니다
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
