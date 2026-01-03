import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { afterEach } from 'node:test';
import { AppError, ERR_DEFS, LOG_RESOURCES, ProfileDTO } from '@transcendence/core';
import { buildApp } from '../src/index.js';
import { FastifyInstance } from 'fastify';

vi.mock('../src/services/um.service.js', () => ({
  profileService: {
    getByUsername: vi.fn(),
    getById: vi.fn(),
    createProfile: vi.fn(),
  },
}));

vi.mock('../src/utils/mappers.js', () => ({
  mapUserProfileToDTO: vi.fn(),
}));

export const mockProfileDTO = { id: 1, username: 'toto', avatarUrl: 'default.png' };
export const mockProfileDTO2 = { id: 2, username: 'tata', avatarUrl: 'default.png' };

import { profileService } from '../src/services/profiles.service.js';

let app: FastifyInstance;

describe.skip('GET /:username', () => {
  beforeAll(async () => {
    process.env['NODE_ENV'] = 'test';
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('GET /:username - Should return user profile', async () => {
    vi.spyOn(profileService, 'getByUsername').mockResolvedValue(mockProfileDTO as ProfileDTO);

    const response = await app.inject({
      method: 'GET',
      url: '/toto',
    });

    expect(profileService.getByUsername).toHaveBeenCalledWith('toto');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual(mockProfileDTO);
  });

  test('GET /:username - Should return 404 if not found', async () => {
    vi.spyOn(profileService, 'getByUsername').mockRejectedValue(
      new AppError(ERR_DEFS.RESOURCE_NOT_FOUND, {
        details: {
          resource: LOG_RESOURCES.PROFILE,
          username: 'unknown',
        },
      }),
    );

    const response = await app.inject({
      method: 'GET',
      url: '/unknown',
    });

    expect(response.statusCode).toBe(404);
  });

  test('GET /:username - Should reject admin as username', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/admin',
    });

    const body = JSON.parse(response.payload);

    expect(response.statusCode).toBe(400);
    expect(body.message).toBe('Validation failed');
  });

  test('GET /:username - Should return 500 if service throws unhandled error', async () => {
    vi.spyOn(profileService, 'getByUsername').mockRejectedValue(new Error('DB crashed'));

    const response = await app.inject({
      method: 'GET',
      url: '/unknown',
    });

    expect(response.statusCode).toBe(500);
  });
});
