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
  },
  {
    id: 'bunny',
    name: 'Котик-зайка',
    rarity: 'rare',
    cost: 120,
    description: 'Очаровательный ушастик в пушистой шапочке зайки.',
    icon: '🐰'
  },
  {
    id: 'flower',
    name: 'Цветочек',
    rarity: 'rare',
    cost: 180,
    description: 'Нежный весенний котик с венком из цветочных лепестков.',
    icon: '🌸'
  },
  {
    id: 'frog',
    name: 'Лягушонок',
    rarity: 'rare',
    cost: 250,
    description: 'Забавная зеленая шапка-лягушка с выпуклыми глазками.',
    icon: '🐸'
  },
  {
    id: 'winter',
    name: 'Зимний пушистик',
    rarity: 'special',
    cost: 320,
    description: 'Тёплая вязаная зимняя шапочка с пушистым помпоном.',
    icon: '🧶'
  },
  {
    id: 'pumpkin',
    name: 'Тыковка',
    rarity: 'special',
    cost: 400,
    description: 'Яркая тыквенная шляпка к весёлому осеннему маскараду.',
    icon: '🎃'
  },
  {
    id: 'santa',
    name: 'Дед Мороз',
    rarity: 'special',
    cost: 500,
    description: 'Праздничный новогодний колпак с белоснежным помпоном.',
    icon: '🎅'
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
