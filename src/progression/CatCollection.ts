export type CatRarity = 'common' | 'rare' | 'special';

export interface SkinDefinition {
  id: string;
  name: string;
  rarity: CatRarity;
  cost: number;
  unlockedByDefault?: boolean;
  description: string;
  icon: string;
}

export const CAT_SKINS: SkinDefinition[] = [
  {
    id: 'ginger',
    name: 'Рыжик',
    rarity: 'common',
    cost: 0,
    unlockedByDefault: true,
    description: 'Весёлый рыжий непоседа с белой грудкой.',
    icon: '🐱'
  },
  {
    id: 'smoky',
    name: 'Дымок',
    rarity: 'common',
    cost: 50,
    description: 'Спокойный пепельно-серый пушистик.',
    icon: '🐈'
  },
  {
    id: 'snowball',
    name: 'Снежок',
    rarity: 'common',
    cost: 75,
    description: 'Белоснежный котик с небесно-голубыми глазками.',
    icon: '🤍'
  },
  {
    id: 'shadow',
    name: 'Уголёк',
    rarity: 'common',
    cost: 100,
    description: 'Грациозный черный кот с изумрудными глазами.',
    icon: '🐈‍⬛'
  },
  {
    id: 'siamese',
    name: 'Сиамчик',
    rarity: 'rare',
    cost: 150,
    description: 'Элегантный котик с темными ушками и лапками.',
    icon: '🐾'
  },
  {
    id: 'calico',
    name: 'Трёхцветка',
    rarity: 'rare',
    cost: 200,
    description: 'Котик на счастье и удачу с яркими пятнышками.',
    icon: '✨'
  },
  {
    id: 'hat',
    name: 'Кот в шляпе',
    rarity: 'special',
    cost: 300,
    description: 'Настоящий джентльмен в миниатюрном котелке.',
    icon: '🎩'
  },
  {
    id: 'pirate',
    name: 'Кот-пират',
    rarity: 'special',
    cost: 400,
    description: 'Гроза диванных морей с пиратской повязкой.',
    icon: '🏴‍☠️'
  },
  {
    id: 'astronaut',
    name: 'Космонавт',
    rarity: 'special',
    cost: 500,
    description: 'Мечтатель в прозрачном звездном шлеме.',
    icon: '🚀'
  }
];

export class CatCollection {
  public static getAllSkins(): SkinDefinition[] {
    return [...CAT_SKINS];
  }

  public static getSkin(id: string): SkinDefinition | undefined {
    return CAT_SKINS.find((skin) => skin.id === id);
  }
}
