import { TestBed } from '@angular/core/testing';

import { LocalJsonService } from './local-json.service';

describe('LocalJsonService', () => {
  let service: LocalJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
