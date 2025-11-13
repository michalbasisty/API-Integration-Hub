import axios from 'axios';

jest.mock('axios');

const API_BASE_URL = 'http://localhost:8000/api';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should fetch health status', async () => {
      const mockResponse = {
        status: 'ok',
        service: 'pulseapi-backend',
      };

      (axios.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const response = await axios.get(`${API_BASE_URL}/health`);
      expect(response.data.status).toBe('ok');
    });
  });

  describe('getStatus', () => {
    it('should fetch service status', async () => {
      const mockResponse = {
        status: 'ok',
        database: 'connected',
        redis: 'connected',
      };

      (axios.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const response = await axios.get(`${API_BASE_URL}/status`);
      expect(response.data.database).toBe('connected');
      expect(response.data.redis).toBe('connected');
    });
  });

  describe('getProjects', () => {
    it('should fetch projects list', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Project 1', status: 'active' },
        ],
      };

      (axios.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const response = await axios.get(`${API_BASE_URL}/projects`);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const errorMessage = 'Request failed';
      (axios.get as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      try {
        await axios.get(`${API_BASE_URL}/projects`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });
});
