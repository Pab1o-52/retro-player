export interface FeaturedGame {
  id: string;
  title: string;
  system: 'nes' | 'sega';
  coverUrl: string;
  romUrl: string;
}

export const FEATURED_GAMES: FeaturedGame[] = [
  {
    id: 'smb1-archive',
    title: 'Super Mario Bros.',
    system: 'nes',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Super_Mario_Bros._box.png',
    romUrl: 'https://archive.org/download/nes-romset-ultra-us/Super%20Mario%20Bros.%20%28Japan%2C%20USA%29.nes'
  },
  {
    id: 'sonic1-archive',
    title: 'Sonic the Hedgehog',
    system: 'sega',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/b/ba/Sonic_the_Hedgehog_1_Genesis_box_art.jpg',
    romUrl: 'https://archive.org/download/SegaGenesisRomCollectionByGhostware/Sonic%20The%20Hedgehog%20%28USA%2C%20Europe%29.md'
  },
  {
    id: 'contra-archive',
    title: 'Contra',
    system: 'nes',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/2/22/Contra_Coverart.png',
    romUrl: 'https://archive.org/download/nes-romset-ultra-us/Contra%20%28USA%29.nes'
  }
];
