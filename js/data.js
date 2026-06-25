// data.js — Family data: Abad · Duggan · Levenfeld
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA NOTES (for reuse across client sites):
//   • photoUrl    — direct image URL (Google Drive thumbnail). null = show initials.
//   • died        — year (number) or null if living
//   • photos[]    — array of { url, caption, year } for the person's gallery
//   • videos[]    — array of { url, title, year, thumb } for person's videos
//   • highlightPersonId in SITE_CONFIG replaces the old isYou boolean
//   • relation    — role as seen from the highlight person's perspective
//
// PHOTO URLS — all use Google Drive thumbnail format:
//   https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200
//   Converts HEIC → JPEG automatically, works without login for public files,
//   applies EXIF orientation so phone-photographed prints appear upright.
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

// ── Shorthand ─────────────────────────────────────────────────────────────────
const thumb = id => `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;

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
    photoUrl:   thumb('1FNKbt0U3ytGgrIx_KvVD6akvNUlIyLjb'),  // Mom's birthday, 1970
    photos: [
      { url: thumb('1FNKbt0U3ytGgrIx_KvVD6akvNUlIyLjb'), caption: "Mom's Birthday",    year: 1970 },
      { url: thumb('1DvP7BYOiHWFcpqR9jhOadP-3stsH6Ku6'), caption: 'Abad Family',        year: 1987 },
      { url: thumb('1HYqNMdnRvSFyBh3URXx7QGQKv2AWWze1'), caption: 'Family Photo',        year: 1980 },
      { url: thumb('1BFWSOse4pY1jjdCJzFtAvWmr3fK8GzEx'), caption: '',                    year: 1990 },
      { url: thumb('1L1UfKGUk3vltyvMzua9xWrTpNZDXBvTW'), caption: '',                    year: null },
    ],
    videos: [],
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
    photoUrl:   thumb('16guq3s3u2urAQabK9LDqXpXdI9wRlbMD'),   // Reunion 1990
    photos: [
      { url: thumb('16guq3s3u2urAQabK9LDqXpXdI9wRlbMD'), caption: 'Family Reunion',      year: 1990 },
      { url: thumb('1DvP7BYOiHWFcpqR9jhOadP-3stsH6Ku6'), caption: 'Abad Family',         year: 1987 },
      { url: thumb('1HYqNMdnRvSFyBh3URXx7QGQKv2AWWze1'), caption: 'Family Photo',         year: 1980 },
    ],
    videos: [],
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
    photos: [
      { url: thumb('1OQ7xdhF5gPeybs4XshHDWxnUdc1HdqJf'), caption: 'Young Beth & Kevin',  year: null },
    ],
    videos: [],
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
    photoUrl:   thumb('1xrOQSCuUYa1vMe8iylVncZwSMSfjk8vE'),   // Young Beth & Terri, 1973
    photos: [
      { url: thumb('1xrOQSCuUYa1vMe8iylVncZwSMSfjk8vE'), caption: 'With Terri',           year: 1973 },
      { url: thumb('1tQDVv8TXNhw0h3YmB12v_dmnoBHoqK8Q'), caption: 'With Terri',           year: 1978 },
      { url: thumb('1OQ7xdhF5gPeybs4XshHDWxnUdc1HdqJf'), caption: 'Young Beth & Kevin',   year: null },
      { url: thumb('1BClgTjp2z2XUneAzBKMw1VcbVUAuH5LH'), caption: '',                     year: 1980 },
      { url: thumb('1DvP7BYOiHWFcpqR9jhOadP-3stsH6Ku6'), caption: 'Abad Family',          year: 1987 },
      { url: thumb('11QGXXhmQogLEWPoI2VXuS3bnxrxba8T5'), caption: 'Abad Family',          year: 1987 },
      { url: thumb('1OmIbTyJmrbZgEHNv6gU9dMVsZTyTRM3h'), caption: 'Abad Family',          year: 1987 },
    ],
    videos: [],
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
    photoUrl:   thumb('1o5ZhvnB_ZtHXw6Q-vWmByyRO8IVhPzr6'),   // Teenage Terri, 1983
    photos: [
      { url: thumb('1JPAUWy1WJ8RRNEwxXKy_DxcGHfj_7_KP'), caption: 'Young Terri',          year: 1975 },
      { url: thumb('1o5ZhvnB_ZtHXw6Q-vWmByyRO8IVhPzr6'), caption: 'Teenage Terri',        year: 1983 },
      { url: thumb('1xrOQSCuUYa1vMe8iylVncZwSMSfjk8vE'), caption: 'With Beth',             year: 1973 },
      { url: thumb('1tQDVv8TXNhw0h3YmB12v_dmnoBHoqK8Q'), caption: 'With Beth',             year: 1978 },
      { url: thumb('1dUv6gtDhFk1-BGaFYhgG9uXCKFFrOMWP'), caption: 'Maui Trip',             year: 2005 },
    ],
    videos: [],
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
    photos: [
      { url: thumb('1dUv6gtDhFk1-BGaFYhgG9uXCKFFrOMWP'), caption: 'Maui Trip',            year: 2005 },
    ],
    videos: [],
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
    photoUrl:   thumb('1eqbKhaHOefI24CgA4RVxiK_LTZyO9dgs'),   // Gustavo's Birthday, 2001
    photos: [
      { url: thumb('1eqbKhaHOefI24CgA4RVxiK_LTZyO9dgs'), caption: "Gustavo's Birthday",  year: 2001 },
      { url: thumb('1iyG1FLlvA8ThpezXyCc1NAVncwFxYrX6'), caption: 'Baby Shower',          year: 2004 },
      { url: thumb('1dUv6gtDhFk1-BGaFYhgG9uXCKFFrOMWP'), caption: 'Maui Trip',            year: 2005 },
    ],
    videos: [],
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
    photoUrl:   thumb('1im8jLZYSkFaD4dEAv2s8u7d0cA-E1rua'),   // Young Diego, 2004
    photos: [
      { url: thumb('1im8jLZYSkFaD4dEAv2s8u7d0cA-E1rua'), caption: 'Young Diego',          year: 2004 },
    ],
    videos: [],
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
    photoUrl:   thumb('1mXr06ulv_52eyHWL17QEwYZoe7NdHQVs'),   // Young Kevin, 2006
    photos: [
      { url: thumb('1mXr06ulv_52eyHWL17QEwYZoe7NdHQVs'), caption: 'Young Kevin',          year: 2006 },
      { url: thumb('1ccnZtNcUhLfAgJP00zNf-fN6qbWFBPXO'), caption: 'Christmas',            year: 2009 },
    ],
    videos: [],
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
const MEMORIES = [

  // ── Original memories ──────────────────────────────────────────────────────

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
    id:          'mem-christmas-2018',
    title:       'Christmas 2018',
    year:        2018,
    category:    'holidays',
    description: '',
    coverPhoto:  thumb('1klaIJQxYcyCLEPk9siIolSrOHCrSoqPL'),
    photos: [
      { url: thumb('1klaIJQxYcyCLEPk9siIolSrOHCrSoqPL'), caption: '', year: 2018 },
      { url: thumb('1nncB_Fzs197n_lXOe0hqOOAKYNt75yTA'), caption: '', year: 2018 },
      { url: thumb('17lWUZl8DC1zCo5GoGLCwNoQfErzflFm1'), caption: '', year: 2018 },
      { url: thumb('1u1RwhDep9ClAI7d3aP-Dlwq6YFaNILzs'), caption: '', year: 2018 },
      { url: thumb('1LUzA9eUQ0n1EFge5wxDUoZamCvBihWja'), caption: '', year: 2018 },
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

  // ── New memories — digitized from physical prints ──────────────────────────

  {
    id:          'mem-abuelo-mom-bday',
    title:       "Abuelo's Mom's Birthday",
    year:        1970,
    category:    'birthdays',
    description: '',
    coverPhoto:  thumb('1FNKbt0U3ytGgrIx_KvVD6akvNUlIyLjb'),
    photos: [
      { url: thumb('1FNKbt0U3ytGgrIx_KvVD6akvNUlIyLjb'), caption: "Abuelo's Mom's Birthday", year: 1970 },
    ],
    videos:  [],
    people:  ['jose'],
  },

  {
    id:          'mem-beth-terri-childhood',
    title:       'Beth & Terri Growing Up',
    year:        1973,
    category:    'everyday',
    description: 'Elizabeth and Teresa as kids.',
    coverPhoto:  thumb('1xrOQSCuUYa1vMe8iylVncZwSMSfjk8vE'),
    photos: [
      { url: thumb('1xrOQSCuUYa1vMe8iylVncZwSMSfjk8vE'), caption: 'Young Beth and Terri', year: 1973 },
      { url: thumb('1tQDVv8TXNhw0h3YmB12v_dmnoBHoqK8Q'), caption: 'With Terri',           year: 1978 },
    ],
    videos:  [],
    people:  ['elizabeth','teresa'],
  },

  {
    id:          'mem-terri-young',
    title:       'Young Terri',
    year:        1975,
    category:    'everyday',
    description: '',
    coverPhoto:  thumb('1JPAUWy1WJ8RRNEwxXKy_DxcGHfj_7_KP'),
    photos: [
      { url: thumb('1JPAUWy1WJ8RRNEwxXKy_DxcGHfj_7_KP'), caption: 'Terri',          year: 1975 },
      { url: thumb('1o5ZhvnB_ZtHXw6Q-vWmByyRO8IVhPzr6'), caption: 'Teenage Terri',  year: 1983 },
    ],
    videos:  [],
    people:  ['teresa'],
  },

  {
    id:          'mem-abad-portraits-80s',
    title:       'Abad Family Portraits',
    year:        1980,
    category:    'milestones',
    description: 'Family portraits from the early 1980s.',
    coverPhoto:  thumb('1DCSEXLksBN_fsE4QhMYpbWUkEAt2cdgD'),
    photos: [
      { url: thumb('1HYqNMdnRvSFyBh3URXx7QGQKv2AWWze1'), caption: 'Family Photo',    year: 1980 },
      { url: thumb('1Ht6xnrilbeJsabBYOMIYx2sP243JL17J'), caption: 'Family Photo',    year: 1980 },
      { url: thumb('1BClgTjp2z2XUneAzBKMw1VcbVUAuH5LH'), caption: '',               year: 1980 },
      { url: thumb('1DCSEXLksBN_fsE4QhMYpbWUkEAt2cdgD'), caption: 'Family Portrait', year: 1983 },
    ],
    videos:  [],
    people:  ['jose','liz','elizabeth','teresa'],
  },

  {
    id:          'mem-abad-1987',
    title:       'Abad Family — 1987',
    year:        1987,
    category:    'everyday',
    description: '',
    coverPhoto:  thumb('1DvP7BYOiHWFcpqR9jhOadP-3stsH6Ku6'),
    photos: [
      { url: thumb('1DvP7BYOiHWFcpqR9jhOadP-3stsH6Ku6'), caption: 'Abad Family', year: 1987 },
      { url: thumb('11QGXXhmQogLEWPoI2VXuS3bnxrxba8T5'), caption: 'Abad Family', year: 1987 },
      { url: thumb('1OmIbTyJmrbZgEHNv6gU9dMVsZTyTRM3h'), caption: 'Abad Family', year: 1987 },
    ],
    videos:  [],
    people:  ['jose','liz','elizabeth','teresa'],
  },

  {
    id:          'mem-young-beth-kevin',
    title:       'Young Beth & Kevin',
    year:        null,
    category:    'everyday',
    description: '',
    coverPhoto:  thumb('1OQ7xdhF5gPeybs4XshHDWxnUdc1HdqJf'),
    photos: [
      { url: thumb('1OQ7xdhF5gPeybs4XshHDWxnUdc1HdqJf'), caption: 'Young Beth and Kevin', year: null },
    ],
    videos:  [],
    people:  ['kevinb','elizabeth'],
  },

  {
    id:          'mem-reunion-1990',
    title:       'Family Reunion',
    year:        1990,
    category:    'reunions',
    description: '',
    coverPhoto:  thumb('16guq3s3u2urAQabK9LDqXpXdI9wRlbMD'),
    photos: [
      { url: thumb('16guq3s3u2urAQabK9LDqXpXdI9wRlbMD'), caption: 'Family Reunion', year: 1990 },
    ],
    videos:  [],
    people:  ['liz'],
  },

  {
    id:          'mem-levenfeld-early',
    title:       'Levenfeld Family — Early Years',
    year:        2001,
    category:    'milestones',
    description: 'Gustavo and Diego in their earliest years.',
    coverPhoto:  thumb('1eqbKhaHOefI24CgA4RVxiK_LTZyO9dgs'),
    photos: [
      { url: thumb('1eqbKhaHOefI24CgA4RVxiK_LTZyO9dgs'), caption: "Gustavo's Birthday", year: 2001 },
      { url: thumb('1iyG1FLlvA8ThpezXyCc1NAVncwFxYrX6'), caption: 'Baby Shower',         year: 2004 },
      { url: thumb('1im8jLZYSkFaD4dEAv2s8u7d0cA-E1rua'), caption: 'Young Diego',         year: 2004 },
    ],
    videos:  [],
    people:  ['gustavo','teresa','diego'],
  },

  {
    id:          'mem-maui-2005',
    title:       'Maui Trip',
    year:        2005,
    category:    'travel',
    description: '',
    coverPhoto:  thumb('1dUv6gtDhFk1-BGaFYhgG9uXCKFFrOMWP'),
    photos: [
      { url: thumb('1dUv6gtDhFk1-BGaFYhgG9uXCKFFrOMWP'), caption: 'Maui Trip', year: 2005 },
    ],
    videos:  [],
    people:  ['teresa','arturo','gustavo'],
  },

  {
    id:          'mem-young-kevin-2006',
    title:       'Baby Kevin',
    year:        2006,
    category:    'milestones',
    description: '',
    coverPhoto:  thumb('1mXr06ulv_52eyHWL17QEwYZoe7NdHQVs'),
    photos: [
      { url: thumb('1mXr06ulv_52eyHWL17QEwYZoe7NdHQVs'), caption: 'Young Kevin', year: 2006 },
    ],
    videos:  [],
    people:  ['kevinjose'],
  },

  {
    id:          'mem-christmas-collection',
    title:       'Family Christmases',
    year:        2013,
    category:    'holidays',
    description: 'Christmas gatherings from 2009, 2013, and 2014.',
    coverPhoto:  thumb('1uUAKa971XBSzR2cbdcYXqo87woXUHq1g'),
    photos: [
      { url: thumb('1ccnZtNcUhLfAgJP00zNf-fN6qbWFBPXO'), caption: 'Christmas', year: 2009 },
      { url: thumb('1uUAKa971XBSzR2cbdcYXqo87woXUHq1g'), caption: 'Christmas', year: 2013 },
      { url: thumb('1EM51440S89VxIDFj8sAjxOGLcCslNcz5'), caption: 'Christmas', year: 2014 },
    ],
    videos:  [],
    people:  ['jose','liz','kevinb','elizabeth','kevinjose','john','teresa','arturo','gustavo','diego'],
  },

  {
    id:          'mem-easter-2011',
    title:       'Easter 2011',
    year:        2011,
    category:    'holidays',
    description: '',
    coverPhoto:  thumb('10YD_EC75UkhSHZYbx7780tSeScJXbXYj'),
    photos: [
      { url: thumb('10YD_EC75UkhSHZYbx7780tSeScJXbXYj'), caption: 'Easter', year: 2011 },
    ],
    videos:  [],
    people:  ['jose','liz','kevinb','elizabeth','arturo','kevinjose','john','gustavo','teresa','diego'],
  },

];
