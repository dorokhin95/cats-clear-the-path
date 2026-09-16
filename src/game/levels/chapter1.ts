import { LevelData } from '../Level';

export const CHAPTER_1_LEVELS: LevelData[] = [
  {
    id: 1,
    chapter: 1,
    name: 'Привет, котик!',
    width: 3,
    height: 3,
    cats: [
      { id: 1, x: 1, y: 1, direction: 'right', skin: 'ginger' }
    ],
    performance: {
      goldTimeMs: 10000,
      silverTimeMs: 20000,
      comboTarget: 1
    }
  },
  {
    id: 2,
    chapter: 1,
    name: 'В разные стороны',
    width: 3,
    height: 3,
    cats: [
      { id: 1, x: 0, y: 1, direction: 'left', skin: 'ginger' },
      { id: 2, x: 2, y: 1, direction: 'right', skin: 'smoky' }
    ],
    performance: {
      goldTimeMs: 12000,
      silverTimeMs: 25000,
      comboTarget: 2
    }
  },
  {
    id: 3,
    chapter: 1,
    name: 'Уступи дорогу',
    width: 3,
    height: 3,
    cats: [
      { id: 1, x: 1, y: 1, direction: 'right', skin: 'ginger' },
      { id: 2, x: 2, y: 1, direction: 'up', skin: 'smoky' }
    ],
    performance: {
      goldTimeMs: 15000,
      silverTimeMs: 30000,
      comboTarget: 2
    }
  },
  {
    id: 4,
    chapter: 1,
    name: 'Очередь за рыбкой',
    width: 4,
    height: 4,
    cats: [
      { id: 1, x: 1, y: 1, direction: 'down', skin: 'ginger' },
      { id: 2, x: 1, y: 2, direction: 'right', skin: 'smoky' },
      { id: 3, x: 2, y: 2, direction: 'right', skin: 'snowball' }
    ],
    performance: {
      goldTimeMs: 20000,
      silverTimeMs: 35000,
      comboTarget: 3
    }
  },
  {
    id: 5,
    chapter: 1,
    name: 'Две дорожки',
    width: 4,
    height: 4,
    cats: [
      { id: 1, x: 0, y: 1, direction: 'right', skin: 'ginger' },
      { id: 2, x: 1, y: 1, direction: 'up', skin: 'smoky' },
      { id: 3, x: 3, y: 2, direction: 'left', skin: 'shadow' },
      { id: 4, x: 2, y: 2, direction: 'down', skin: 'snowball' }
    ],
    performance: {
      goldTimeMs: 25000,
      silverTimeMs: 45000,
      comboTarget: 4
    }
  },
  {
    id: 6,
    chapter: 1,
    name: 'Первый вызов',
    width: 4,
    height: 4,
    cats: [
      { id: 1, x: 1, y: 1, direction: 'right', skin: 'ginger' },
      { id: 2, x: 2, y: 1, direction: 'down', skin: 'smoky' },
      { id: 3, x: 2, y: 2, direction: 'left', skin: 'shadow' },
      { id: 4, x: 1, y: 2, direction: 'down', skin: 'snowball' },
      { id: 5, x: 0, y: 0, direction: 'left', skin: 'ginger' }
    ],
    performance: {
      goldTimeMs: 30000,
      silverTimeMs: 50000,
      comboTarget: 4
    }
  },
  {
    id: 7,
    chapter: 1,
    name: 'Перекрёсток',
    width: 4,
    height: 4,
    cats: [
      { id: 1, x: 1, y: 1, direction: 'right', skin: 'ginger' },
      { id: 2, x: 2, y: 1, direction: 'right', skin: 'smoky' },
      { id: 3, x: 1, y: 2, direction: 'up', skin: 'shadow' },
      { id: 4, x: 2, y: 2, direction: 'down', skin: 'snowball' },
      { id: 5, x: 0, y: 3, direction: 'up', skin: 'ginger' },
      { id: 6, x: 0, y: 1, direction: 'right', skin: 'smoky' }
    ],
    performance: {
      goldTimeMs: 35000,
      silverTimeMs: 60000,
      comboTarget: 5
    }
  },
  {
    id: 8,
    chapter: 1,
    name: 'Уютная коробочка',
    width: 4,
    height: 4,
    cats: [
      { id: 1, x: 0, y: 0, direction: 'right', skin: 'ginger' },
      { id: 2, x: 1, y: 0, direction: 'right', skin: 'smoky' },
      { id: 3, x: 3, y: 0, direction: 'down', skin: 'snowball' },
      { id: 4, x: 3, y: 1, direction: 'down', skin: 'shadow' },
      { id: 5, x: 3, y: 3, direction: 'left', skin: 'ginger' },
      { id: 6, x: 2, y: 3, direction: 'left', skin: 'smoky' }
    ],
    performance: {
      goldTimeMs: 40000,
      silverTimeMs: 65000,
      comboTarget: 5
    }
  },
  {
    id: 9,
    chapter: 1,
    name: 'Лабиринт хвостиков',
    width: 4,
    height: 4,
    cats: [
      { id: 1, x: 1, y: 0, direction: 'down', skin: 'ginger' },
      { id: 2, x: 1, y: 1, direction: 'right', skin: 'smoky' },
      { id: 3, x: 2, y: 1, direction: 'down', skin: 'snowball' },
      { id: 4, x: 2, y: 2, direction: 'left', skin: 'shadow' },
      { id: 5, x: 1, y: 2, direction: 'down', skin: 'ginger' },
      { id: 6, x: 3, y: 3, direction: 'right', skin: 'smoky' },
      { id: 7, x: 0, y: 3, direction: 'left', skin: 'snowball' }
    ],
    performance: {
      goldTimeMs: 45000,
      silverTimeMs: 75000,
      comboTarget: 6
    }
  },
  {
    id: 10,
    chapter: 1,
    name: 'Выпускной в квартире',
    width: 4,
    height: 4,
    cats: [
      { id: 1, x: 0, y: 0, direction: 'right', skin: 'ginger' },
      { id: 2, x: 1, y: 0, direction: 'down', skin: 'smoky' },
      { id: 3, x: 1, y: 1, direction: 'right', skin: 'snowball' },
      { id: 4, x: 2, y: 1, direction: 'down', skin: 'shadow' },
      { id: 5, x: 2, y: 2, direction: 'left', skin: 'ginger' },
      { id: 6, x: 1, y: 2, direction: 'down', skin: 'smoky' },
      { id: 7, x: 3, y: 0, direction: 'up', skin: 'snowball' },
      { id: 8, x: 0, y: 3, direction: 'down', skin: 'shadow' }
    ],
    performance: {
      goldTimeMs: 50000,
      silverTimeMs: 80000,
      comboTarget: 6
    }
  }
];
