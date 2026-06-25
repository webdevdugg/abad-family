// data.js — Family data: Abad · Duggan · Levenfeld
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA NOTES (for reuse across client sites):
//   • photoUrl    — direct image URL (Google Drive: .../uc?export=view&id=ID,
//                   or Cloudflare R2 direct URL). null = show initials.
//   • died        — year (number) or null if living
//   • photos[]    — array of { url, caption, year } for the person's gallery
//   • videos[]    — array of { url, title, year, thumb } for person's videos
//   • highlightPersonId in SITE_CONFIG replaces the old isYou boolean
//   • relation    — role as seen from the highlight person's perspective
// ─────────────────────────────────────────────────────────────────────────────

const SITE_CONFIG = {
  siteName:          'Abad · Duggan · Levenfeld',
  established:       1963,
  tagline:           'Three generations. Four families. One story.',
  highlightPersonId: 'kevinjose',   // the "you" node — change per client site
};

const FAMILY_COLORS = {
  Abad:      '#C9A457',
  Welch:     '#6B8F71',
  Duggan:    '#4A6FA5',
  Levenfeld: '#C17A5A',
};

const PEOPLE = [
  {
    id:         'jose',
    name:       'Jose Maria Abad',
    firstName:  'Jose Maria',
    lastName:   'Abad',
    initials:   'JA',
    born:       1936,
    died:       null,
    status:     'Living',
    family:     'Abad',
    generation: 1,
    relation:   'Maternal grandfather',
    bio:        '',
    photoUrl:   null,          // e.g. 'https://drive.google.com/uc?export=view&id=ABC'
    photos:     [],            // { url, caption, year }
    videos:     [],            // { url, title, year, thumb }
  },
  {
    id:         'liz',
    name:       'Liz Welch',
    firstName:  'Liz',
    lastName:   'Welch',
    initials:   'LW',
    born:       1942,
    died:       null,
    status:     'Living',
    family:     'Welch',
    generation: 1,
    relation:   'Maternal grandmother',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
  {
    id:         'kevinb',
    name:       'Kevin Barry Duggan',
    firstName:  'Kevin B.',
    lastName:   'Duggan',
    initials:   'KB',
    born:       1965,
    died:       null,
    status:     'Living',
    family:     'Duggan',
    generation: 2,
    relation:   'Your dad',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
  {
    id:         'elizabeth',
    name:       'Elizabeth Denise Abad',
    firstName:  'Elizabeth',
    lastName:   'Abad',
    initials:   'EA',
    born:       1966,
    died:       null,
    status:     'Living',
    family:     'Abad',
    generation: 2,
    relation:   'Your mom',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
  {
    id:         'teresa',
    name:       'Teresa Abad',
    firstName:  'Teresa',
    lastName:   'Abad',
    initials:   'TA',
    born:       1970,
    died:       null,
    status:     'Living',
    family:     'Abad',
    generation: 2,
    relation:   'Your aunt',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
  {
    id:         'arturo',
    name:       'Arturo Levenfeld',
    firstName:  'Arturo',
    lastName:   'Levenfeld',
    initials:   'AL',
    born:       1970,
    died:       null,
    status:     'Living',
    family:     'Levenfeld',
    generation: 2,
    relation:   'Your uncle by marriage',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
  {
    id:         'gustavo',
    name:       'Gustavo Jodian Levenfeld',
    firstName:  'Gustavo',
    lastName:   'Levenfeld',
    initials:   'GL',
    born:       2002,
    died:       null,
    status:     'Living',
    family:     'Levenfeld',
    generation: 3,
    relation:   'Your cousin',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
  {
    id:         'diego',
    name:       'Diego Antonio Levenfeld',
    firstName:  'Diego',
    lastName:   'Levenfeld',
    initials:   'DL',
    born:       2004,
    died:       null,
    status:     'Living',
    family:     'Levenfeld',
    generation: 3,
    relation:   'Your cousin',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
  {
    id:         'kevinjose',
    name:       'Kevin Jose Duggan',
    firstName:  'Kevin J.',
    lastName:   'Duggan',
    initials:   'KJ',
    born:       2006,
    died:       null,
    status:     'Living',
    family:     'Duggan',
    generation: 3,
    relation:   'You!',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
  {
    id:         'john',
    name:       'John Antonio Duggan',
    firstName:  'John',
    lastName:   'Duggan',
    initials:   'JD',
    born:       2008,
    died:       null,
    status:     'Living',
    family:     'Duggan',
    generation: 3,
    relation:   'Your brother',
    bio:        '',
    photoUrl:   null,
    photos:     [],
    videos:     [],
  },
];

// Couples — order within PARENT_CHILD determines left→right visual ordering
const COUPLES = [
  { id: 'couple-gen1',      person1Id: 'jose',    person2Id: 'liz',       marriedYear: 1963 },
  { id: 'couple-duggan',    person1Id: 'kevinb',  person2Id: 'elizabeth', marriedYear: 2002 },
  { id: 'couple-levenfeld', person1Id: 'arturo',  person2Id: 'teresa',    marriedYear: 1998 },
];

// parentCoupleId → childId
// ORDER HERE controls left-to-right order of siblings in the tree
const PARENT_CHILD = [
  { parentCoupleId: 'couple-gen1',      childId: 'elizabeth' },  // → couple-duggan goes LEFT
  { parentCoupleId: 'couple-gen1',      childId: 'teresa'    },  // → couple-levenfeld goes RIGHT
  { parentCoupleId: 'couple-duggan',    childId: 'kevinjose' },
  { parentCoupleId: 'couple-duggan',    childId: 'john'      },
  { parentCoupleId: 'couple-levenfeld', childId: 'gustavo'   },
  { parentCoupleId: 'couple-levenfeld', childId: 'diego'     },
];

// ── Memories ──────────────────────────────────────────────────────────────────
// Each memory: { id, title, year, category, description, coverPhoto, photos[], videos[], people[] }
// coverPhoto / photos[].url — same URL formats as person photoUrl above
// videos[].url  — direct video URL or YouTube embed URL
// people[]      — array of person IDs who appear in this memory
const MEMORIES = [
  {
    id:          'mem-reunion-2019',
    title:       'Family Reunion — Miami',
    year:        2019,
    category:    'reunions',
    description: 'The whole family gathered in Miami for a long weekend — the first time all three generations were together in one place.',
    coverPhoto:  null,
    photos:      [],
    videos:      [],
    people:      ['jose','liz','elizabeth','kevinb','kevinjose','john','teresa','arturo','gustavo','diego'],
  },
  {
    id:          'mem-christmas-2022',
    title:       'Christmas 2018',
    year:        2018,
    category:    'holidays',
    description: '',
    coverPhoto:  'https://lh3.googleusercontent.com/d/1klaIJQxYcyCLEPk9siIolSrOHCrSoqPL',
    photos: [
      { url: 'https://lh3.googleusercontent.com/d/1klaIJQxYcyCLEPk9siIolSrOHCrSoqPL', caption: '', year: 2018 },
      { url: 'https://lh3.googleusercontent.com/d/1nncB_Fzs197n_lXOe0hqOOAKYNt75yTA', caption: '', year: 2018 },
      { url: 'https://lh3.googleusercontent.com/d/17lWUZl8DC1zCo5GoGLCwNoQfErzflFm1', caption: '', year: 2018 },
      { url: 'https://lh3.googleusercontent.com/d/1u1RwhDep9ClAI7d3aP-Dlwq6YFaNILzs', caption: '', year: 2018 },
      { url: 'https://lh3.googleusercontent.com/d/1LUzA9eUQ0n1EFge5wxDUoZamCvBihWja', caption: '', year: 2018 },
    ],
    videos:      [],
    people:      ['elizabeth','kevinb','kevinjose','john'],
  },
  {
    id:          'mem-wedding-duggan',
    title:       'Kevin & Elizabeth\'s Wedding',
    year:        2002,
    category:    'weddings',
    description: 'Kevin Barry and Elizabeth Abad were married in a ceremony surrounded by family.',
    coverPhoto:  null,
    photos:      [],
    videos:      [],
    people:      ['elizabeth','kevinb','jose','liz'],
  },
  {
    id:          'mem-wedding-levenfeld',
    title:       'Teresa & Arturo\'s Wedding',
    year:        1998,
    category:    'weddings',
    description: '',
    coverPhoto:  null,
    photos:      [],
    videos:      [],
    people:      ['teresa','arturo','jose','liz'],
  },
  {
    id:          'mem-kj-18',
    title:       'Kevin Turns 18',
    year:        2024,
    category:    'birthdays',
    description: '',
    coverPhoto:  null,
    photos:      [],
    videos:      [],
    people:      ['kevinjose','elizabeth','kevinb','john'],
  },
  {
    id:          'mem-spain',
    title:       'Trip to Spain',
    year:        2017,
    category:    'travel',
    description: 'Visiting the Abad family roots.',
    coverPhoto:  null,
    photos:      [],
    videos:      [],
    people:      ['jose','liz','elizabeth'],
  },
];
