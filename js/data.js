// data.js — Family data: Abad · Duggan · Levenfeld

const FAMILY_COLORS = {
  Abad:      '#C9A457',
  Welch:     '#6B8F71',
  Duggan:    '#4A6FA5',
  Levenfeld: '#C17A5A'
};

const PEOPLE = [
  {
    id: 'jose',
    name: 'Jose Maria Abad',
    firstName: 'Jose Maria',
    lastName: 'Abad',
    initials: 'JA',
    born: 1936,
    status: 'Living',
    family: 'Abad',
    generation: 1,
    relation: 'Maternal grandfather',
    bio: ''
  },
  {
    id: 'liz',
    name: 'Liz Welch',
    firstName: 'Liz',
    lastName: 'Welch',
    initials: 'LW',
    born: 1942,
    status: 'Living',
    family: 'Welch',
    generation: 1,
    relation: 'Maternal grandmother',
    bio: ''
  },
  {
    id: 'kevinb',
    name: 'Kevin Barry Duggan',
    firstName: 'Kevin B.',
    lastName: 'Duggan',
    initials: 'KB',
    born: 1965,
    status: 'Living',
    family: 'Duggan',
    generation: 2,
    relation: 'Your dad',
    bio: ''
  },
  {
    id: 'elizabeth',
    name: 'Elizabeth Denise Abad',
    firstName: 'Elizabeth',
    lastName: 'Abad',
    initials: 'EA',
    born: 1966,
    status: 'Living',
    family: 'Abad',
    generation: 2,
    relation: 'Your mom',
    bio: ''
  },
  {
    id: 'teresa',
    name: 'Teresa Abad',
    firstName: 'Teresa',
    lastName: 'Abad',
    initials: 'TA',
    born: 1970,
    status: 'Living',
    family: 'Abad',
    generation: 2,
    relation: 'Your aunt',
    bio: ''
  },
  {
    id: 'arturo',
    name: 'Arturo Levenfeld',
    firstName: 'Arturo',
    lastName: 'Levenfeld',
    initials: 'AL',
    born: 1970,
    status: 'Living',
    family: 'Levenfeld',
    generation: 2,
    relation: 'Your uncle by marriage',
    bio: ''
  },
  {
    id: 'gustavo',
    name: 'Gustavo Jodian Levenfeld',
    firstName: 'Gustavo',
    lastName: 'Levenfeld',
    initials: 'GL',
    born: 2002,
    status: 'Living',
    family: 'Levenfeld',
    generation: 3,
    relation: 'Your cousin',
    bio: ''
  },
  {
    id: 'diego',
    name: 'Diego Antonio Levenfeld',
    firstName: 'Diego',
    lastName: 'Levenfeld',
    initials: 'DL',
    born: 2004,
    status: 'Living',
    family: 'Levenfeld',
    generation: 3,
    relation: 'Your cousin',
    bio: ''
  },
  {
    id: 'kevinjose',
    name: 'Kevin Jose Duggan',
    firstName: 'Kevin J.',
    lastName: 'Duggan',
    initials: 'KJ',
    born: 2006,
    status: 'Living',
    family: 'Duggan',
    generation: 3,
    relation: 'You!',
    isYou: true,
    bio: ''
  },
  {
    id: 'john',
    name: 'John Antonio Duggan',
    firstName: 'John',
    lastName: 'Duggan',
    initials: 'JD',
    born: 2008,
    status: 'Living',
    family: 'Duggan',
    generation: 3,
    relation: 'Your brother',
    bio: ''
  }
];

const COUPLES = [
  { id: 'couple-gen1',      person1Id: 'jose',    person2Id: 'liz',       marriedYear: 1963 },
  { id: 'couple-duggan',    person1Id: 'kevinb',  person2Id: 'elizabeth', marriedYear: 2002 },
  { id: 'couple-levenfeld', person1Id: 'arturo',  person2Id: 'teresa',    marriedYear: 1998 }
];

// parentCoupleId → childId
const PARENT_CHILD = [
  { parentCoupleId: 'couple-gen1',      childId: 'elizabeth' },
  { parentCoupleId: 'couple-gen1',      childId: 'teresa'    },
  { parentCoupleId: 'couple-duggan',    childId: 'kevinjose' },
  { parentCoupleId: 'couple-duggan',    childId: 'john'      },
  { parentCoupleId: 'couple-levenfeld', childId: 'gustavo'   },
  { parentCoupleId: 'couple-levenfeld', childId: 'diego'     }
];

// SVG layout — center (x, y) of each person node
const LAYOUT = {
  jose:      [430, 110],
  liz:       [570, 110],
  kevinb:    [158, 310],
  elizabeth: [292, 310],
  arturo:    [658, 310],
  teresa:    [792, 310],
  kevinjose: [140, 500],
  john:      [310, 500],
  gustavo:   [640, 500],
  diego:     [810, 500]
};

// Midpoint of each couple's connector line
const COUPLE_MID = {
  'couple-gen1':      [500,  110],
  'couple-duggan':    [225,  310],
  'couple-levenfeld': [725,  310]
};
