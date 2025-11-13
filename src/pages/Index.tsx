import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  distance: number;
  bio: string;
  image: string;
  interests: string[];
  verified: boolean;
}

const mockProfiles: Profile[] = [
  {
    id: 1,
    name: 'Анна',
    age: 28,
    location: 'Москва',
    distance: 1.2,
    bio: 'Архитектор с любовью к искусству и путешествиям. Ищу серьёзные отношения с интересным собеседником.',
    image: 'https://cdn.poehali.dev/projects/3dbf1073-df46-498b-8ade-7eceea983fbf/files/6cc367e4-631a-49af-b1e3-69bc380b3b91.jpg',
    interests: ['Искусство', 'Путешествия', 'Архитектура'],
    verified: true,
  },
  {
    id: 2,
    name: 'Дмитрий',
    age: 32,
    location: 'Москва',
    distance: 2.5,
    bio: 'Предприниматель, увлекаюсь спортом и литературой. Ценю искренность и глубокие разговоры.',
    image: 'https://cdn.poehali.dev/projects/3dbf1073-df46-498b-8ade-7eceea983fbf/files/fd4ac00d-51a2-40bc-ba76-dca7524f11a9.jpg',
    interests: ['Спорт', 'Литература', 'Бизнес'],
    verified: true,
  },
  {
    id: 3,
    name: 'Екатерина',
    age: 29,
    location: 'Москва',
    distance: 3.8,
    bio: 'Психолог и любитель классической музыки. Ищу серьёзные отношения с человеком со схожими ценностями.',
    image: 'https://cdn.poehali.dev/projects/3dbf1073-df46-498b-8ade-7eceea983fbf/files/c4e4b660-5c55-4ecc-909e-8c448a905ca3.jpg',
    interests: ['Музыка', 'Психология', 'Театр'],
    verified: true,
  },
];

const Index = () => {
  const [profiles] = useState<Profile[]>(mockProfiles);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentView, setCurrentView] = useState<'discover' | 'favorites' | 'messages'>('discover');
  const [ageRange, setAgeRange] = useState<number[]>([25, 40]);
  const [maxDistance, setMaxDistance] = useState<number[]>([10]);

  const toggleFavorite = (profileId: number) => {
    setFavorites(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const displayedProfiles = currentView === 'favorites'
    ? profiles.filter(p => favorites.includes(p.id))
    : profiles;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Élite</h1>
          
          <nav className="flex items-center gap-2">
            <Button
              variant={currentView === 'discover' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('discover')}
              className="gap-2"
            >
              <Icon name="Search" size={18} />
              Поиск
            </Button>
            <Button
              variant={currentView === 'favorites' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('favorites')}
              className="gap-2"
            >
              <Icon name="Heart" size={18} />
              Избранное
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {favorites.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={currentView === 'messages' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('messages')}
              className="gap-2"
            >
              <Icon name="MessageCircle" size={18} />
              Сообщения
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="w-80 space-y-6 hidden lg:block">
            <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="SlidersHorizontal" size={20} className="text-primary" />
                <h2 className="text-xl font-semibold">Фильтры</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Возраст</label>
                    <span className="text-sm text-muted-foreground">
                      {ageRange[0]} - {ageRange[1]}
                    </span>
                  </div>
                  <Slider
                    value={ageRange}
                    onValueChange={setAgeRange}
                    min={18}
                    max={60}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Icon name="MapPin" size={16} className="text-primary" />
                      Расстояние
                    </label>
                    <span className="text-sm text-muted-foreground">
                      до {maxDistance[0]} км
                    </span>
                  </div>
                  <Slider
                    value={maxDistance}
                    onValueChange={setMaxDistance}
                    min={1}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Интересы</label>
                  <div className="flex flex-wrap gap-2">
                    {['Искусство', 'Спорт', 'Путешествия', 'Музыка', 'Литература', 'Бизнес'].map(
                      interest => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent transition-colors"
                        >
                          {interest}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Сбросить фильтры
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Crown" size={20} className="text-primary" />
                <h3 className="font-semibold">Premium</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Получите безлимитные лайки и приоритет в показе
              </p>
              <Button className="w-full">Оформить подписку</Button>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {currentView === 'discover' && 'Рекомендации для вас'}
                  {currentView === 'favorites' && 'Избранные профили'}
                  {currentView === 'messages' && 'Сообщения'}
                </h2>
                <p className="text-muted-foreground">
                  {currentView === 'discover' && `Найдено ${profiles.length} профилей рядом`}
                  {currentView === 'favorites' && `${favorites.length} профилей в избранном`}
                  {currentView === 'messages' && 'У вас пока нет сообщений'}
                </p>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Icon name="SlidersHorizontal" size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Фильтры</SheetTitle>
                    <SheetDescription>
                      Настройте параметры поиска
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium">Возраст</label>
                        <span className="text-sm text-muted-foreground">
                          {ageRange[0]} - {ageRange[1]}
                        </span>
                      </div>
                      <Slider
                        value={ageRange}
                        onValueChange={setAgeRange}
                        min={18}
                        max={60}
                        step={1}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Icon name="MapPin" size={16} />
                          Расстояние
                        </label>
                        <span className="text-sm text-muted-foreground">
                          до {maxDistance[0]} км
                        </span>
                      </div>
                      <Slider
                        value={maxDistance}
                        onValueChange={setMaxDistance}
                        min={1}
                        max={50}
                        step={1}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {currentView === 'messages' ? (
              <Card className="p-12 text-center animate-fade-in">
                <Icon name="MessageCircle" size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Начните общение</h3>
                <p className="text-muted-foreground">
                  Добавьте профили в избранное и начните диалог
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedProfiles.map((profile, index) => (
                  <Card
                    key={profile.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in group bg-card/50 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {profile.verified && (
                          <Badge className="bg-primary text-primary-foreground">
                            <Icon name="BadgeCheck" size={14} className="mr-1" />
                            Проверен
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant={favorites.includes(profile.id) ? 'default' : 'secondary'}
                        className="absolute top-4 left-4 rounded-full"
                        onClick={() => toggleFavorite(profile.id)}
                      >
                        <Icon
                          name={favorites.includes(profile.id) ? 'Heart' : 'Heart'}
                          size={18}
                          className={favorites.includes(profile.id) ? 'fill-current' : ''}
                        />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center gap-2 text-white">
                          <Icon name="MapPin" size={16} className="text-primary" />
                          <span className="text-sm">{profile.distance} км от вас</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-semibold">
                            {profile.name}, {profile.age}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Icon name="MapPin" size={14} />
                            {profile.location}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {profile.bio}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {profile.interests.map(interest => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1" variant="outline">
                          <Icon name="User" size={16} className="mr-2" />
                          Профиль
                        </Button>
                        <Button className="flex-1">
                          <Icon name="MessageCircle" size={16} className="mr-2" />
                          Написать
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
