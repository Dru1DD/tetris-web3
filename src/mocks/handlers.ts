import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/user', async () => {
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
];
