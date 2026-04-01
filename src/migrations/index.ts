import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260401_105938 from './20260401_105938';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260401_105938.up,
    down: migration_20260401_105938.down,
    name: '20260401_105938'
  },
];
