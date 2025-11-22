import { http, HttpResponse } from 'msw';

const mockUserList = [
  {
    uid: 1,
    displayName: 1,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 1,
    bestScore: 1,
    place: 1,
  },
  {
    uid: 2,
    displayName: 2,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 2,
    bestScore: 2,
    place: 2,
  },
  {
    uid: 3,
    displayName: 3,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 3,
    bestScore: 3,
    place: 3,
  },
  {
    uid: 4,
    displayName: 4,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 4,
    bestScore: 4,
    place: 4,
  },
  {
    uid: 5,
    displayName: 5,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 5,
    bestScore: 5,
    place: 5,
  },
  {
    uid: 6,
    displayName: 6,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 6,
    bestScore: 6,
    place: 6,
  },
  {
    uid: 7,
    displayName: 7,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 7,
    bestScore: 7,
    place: 7,
  },
  {
    uid: 8,
    displayName: 8,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 8,
    bestScore: 8,
    place: 8,
  },
  {
    uid: 9,
    displayName: 9,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 9,
    bestScore: 9,
    place: 9,
  },
  {
    uid: 10,
    displayName: 10,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 10,
    bestScore: 10,
    place: 10,
  },
  {
    uid: 11,
    displayName: 11,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 11,
    bestScore: 11,
    place: 11,
  },
  {
    uid: 12,
    displayName: 12,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 12,
    bestScore: 12,
    place: 12,
  },
  {
    uid: 13,
    displayName: 13,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 13,
    bestScore: 13,
    place: 13,
  },
  {
    uid: 14,
    displayName: 14,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 14,
    bestScore: 14,
    place: 14,
  },
  {
    uid: 15,
    displayName: 15,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 15,
    bestScore: 15,
    place: 15,
  },
  {
    uid: 16,
    displayName: 16,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 16,
    bestScore: 16,
    place: 16,
  },
  {
    uid: 17,
    displayName: 17,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 17,
    bestScore: 17,
    place: 17,
  },
  {
    uid: 18,
    displayName: 18,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 18,
    bestScore: 18,
    place: 18,
  },
  {
    uid: 19,
    displayName: 19,
    photoUrl: 'https://pbs.twimg.com/profile_images/1921770226909151232/W6LvPImN_normal.jpg',
    score: 19,
    bestScore: 19,
    place: 19,
  },
];

export const handlers = [
  http.post('*/user', async () => {
    return HttpResponse.json(
      {
        score: 120,
        bestScore: 666,
        place: 3,
      },
      {
        headers: {
          'Set-Cookie': 'session=mockedSessionId; Path=/; HttpOnly;',
        },
      },
    );
  }),

  http.get('*/leaderboard', async () => {
    return HttpResponse.json({
      list: mockUserList,
    });
  }),
];
