import { TestBed } from '@angular/core/testing';

import { DataSourceManagerService } from './data-source-manager.service';

describe('DataSourceManagerService', () => {
  let service: DataSourceManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSourceManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
