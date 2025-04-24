import api from './api';

export const aiService = {
  trainModels: () => api.post('/ai/train'),
  analyzeClaim: (claimId) => api.get(`/ai/claims/${claimId}/analyze`),
  verifyDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ai/documents/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
}; 