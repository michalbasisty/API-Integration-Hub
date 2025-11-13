import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHealth', () => {
    it('should call the health endpoint', (done) => {
      service.getHealth().subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });
  });

  describe('getStatus', () => {
    it('should call the status endpoint', (done) => {
      service.getStatus().subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });
  });

  describe('getProjects', () => {
    it('should return projects array', (done) => {
      service.getProjects().subscribe((response) => {
        expect(Array.isArray(response.data)).toBe(true);
        done();
      });
    });
  });
});
