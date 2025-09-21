import { http, HttpResponse } from 'msw';

export const handlers = [
  // Vérification email: libre par défaut
  http.post('/api/check-email', async () => {
    return HttpResponse.json({ available: true });
  }),

  // Référentiels
  http.get('/api/departments', async () => {
    return HttpResponse.json({ departments: [{ code: '75', name: 'Paris' }] });
  }),
  http.get('/api/pro-data', async () => {
    return HttpResponse.json({
      sectors: [
        {
          key: 'batiment',
          label: 'Bâtiment',
          description: 'Secteur du bâtiment',
          categories: [
            { key: 'plomberie', label: 'Plomberie', description: 'Plombier' },
          ],
        },
      ],
    });
  }),
];


