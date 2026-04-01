import * as migration_20250929_111647 from './20250929_111647'
import * as migration_20260401_000000 from './20260401_000000'

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260401_000000.up,
    down: migration_20260401_000000.down,
    name: '20260401_000000',
  },
]
