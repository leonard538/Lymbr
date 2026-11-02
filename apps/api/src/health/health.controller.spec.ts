import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { configureApp } from '../configure-app.js';

describe('GET /v1/health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds 200 with status ok and needs no auth', async () => {
    await request(app.getHttpServer()).get('/v1/health').expect(200, { status: 'ok' });
  });

  it('is only served under the /v1 prefix', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });
});
