import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { buildApp, logger } from '../src/index.js';
import { FastifyInstance } from 'fastify/types/instance.js';

vi.mock('../src/services/friends.service.js', () => ({
  friendshipService: {
    createFriend: vi.fn(),
    getFriendsByUserId: vi.fn(),
    updateFriendshipNickname: vi.fn(),
    updateFriendshipStatus: vi.fn(),
    removeFriend: vi.fn(),
  },
}));

import { friendshipService } from '../src/services/friends.service.js';
import { mockProfileDTO, mockProfileDTO2 } from './profiles.controller.test.js';
import {
  AppError,
  ERR_DEFS,
  FriendshipFullDTO,
  FriendshipUnifiedDTO,
  LOG_RESOURCES,
} from '@transcendence/core';

describe('Friends Controller tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env['NODE_ENV'] = 'test';
    app = await buildApp();

    // app.addHook('preHandler', async (req) => {
    //   const userId = req.headers['x-user-id'];
    //   const role = req.headers['x-user-role'];
    //   if (userId) {
    //     req.user = {
    //       id: parseInt(userId as string, 10),
    //       role: role || 'USER',
    //     };
    //   }
    // });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockFriendshipFullDTO = {
    id: 1,
    status: 'ACCEPTED',
    nickname: 'receiverNick',
    requester: mockProfileDTO,
    receiver: mockProfileDTO2,
  };

  const mockFriendshipUnifiedDTO = {
    id: 1,
    status: 'ACCEPTED',
    nickname: 'receiverNick',
    friend: mockProfileDTO,
  };

  const generateMockFriendshipUnifiedDTOs = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
      ...mockFriendshipUnifiedDTO,
      id: index + 1,
      nickname: `Nick_${index + 1}`,
      friend: { ...mockProfileDTO, id: 100 + index },
    }));
  };

  const mockManyFriendshipUnifiedDTO = generateMockFriendshipUnifiedDTOs(10);

  // describe('POST /users/friends', () => {
  //   test('Should add friend successfully - 201', async () => {
  //     vi.spyOn(friendshipService, 'createFriend').mockResolvedValue(mockFriendshipFullDTO as FriendshipFullDTO);

  //     const response = await app.inject({
  //       method: 'POST',
  //       url: '/users/friends',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //       payload: { targetId: 2 },
  //     });

  //     // expect(friendshipService.createFriend).toHaveBeenCalledWith(1, 2);
  //     expect(response.statusCode).toBe(201);
  //     // expect(JSON.parse(response.payload)).toEqual(mockFriendshipFullDTO);
  //   });

  //   test('Should return 401 if userId is missing', async () => {
  //     const response = await app.inject({
  //       method: 'POST',
  //       url: '/users/friends',
  //       payload: { targetId: 2 },
  //     });

  //     expect(response.statusCode).toBe(401);
  //     // expect(JSON.parse(response.payload)).toEqual({
  //     //   message: 'Unauthorized',
  //     // });
  //   });

  //   test('Should return 400 if userId equals targetId', async () => {
  //     const response = await app.inject({
  //       method: 'POST',
  //       url: '/users/friends',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //       payload: { targetId: 1 },
  //     });

  //     expect(response.statusCode).toBe(400);
  //     // expect(JSON.parse(response.payload)).toEqual({
  //     //   message: 'Cannot add yourself as friend',
  //     // });
  //   });

  //   test('Should return 400 for invalid targetId', async () => {
  //     const response = await app.inject({
  //       method: 'POST',
  //       url: '/users/friends',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //       payload: { targetId: -1 },
  //     });

  //     expect(response.statusCode).toBe(400);
  //   });

  //   test('Should return 400 if users do not exist', async () => {
  //     vi.spyOn(friendshipService, 'createFriend').mockRejectedValue(
  //       new AppError(ERR_DEFS.RESOURCE_NOT_FOUND, {})
  //     );

  //     const response = await app.inject({
  //       method: 'POST',
  //       url: '/users/friends',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //       payload: { targetId: 999 },
  //     });

  //     expect(response.statusCode).toBe(400);
  //     // expect(JSON.parse(response.payload).message).toContain('do not exist');
  //   });

  //   test('Should return 409 if already friends', async () => {
  //     vi.spyOn(friendshipService, 'createFriend').mockRejectedValue(
  //       new Error('Friendship already exists'),
  //     );

  //     const response = await app.inject({
  //       method: 'POST',
  //       url: '/users/friends',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //       payload: { targetId: 2 },
  //     });

  //     expect(response.statusCode).toBe(409);
  //   });
  // });

  describe('DELETE /friends/:id', () => {
    test('Should delete friendship - 200', async () => {
      vi.spyOn(friendshipService, 'removeFriend').mockResolvedValue(
        mockFriendshipFullDTO as FriendshipFullDTO,
      );

      const response = await app.inject({
        method: 'DELETE',
        url: '/friends/2',
        headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
      });
      logger.error(response);

      // expect(friendshipService.removeFriend).toHaveBeenCalledWith(1, 2);
      expect(response.statusCode).toBe(200);
    });

    test('Should return 404 if not friends with target', async () => {
      vi.spyOn(friendshipService, 'removeFriend').mockRejectedValue(
        new AppError(ERR_DEFS.RESOURCE_NOT_FOUND, {
          userId: 1,
          details: {
            resource: LOG_RESOURCES.FRIEND,
            targetId: 2,
          },
        }),
      );

      const response = await app.inject({
        method: 'DELETE',
        url: '/friends/3',
        headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
      });

      expect(response.statusCode).toBe(404);
    });

    // test('Should allow admin to delete any friendship', async () => {
    //   vi.spyOn(friendshipService, 'removeFriend').mockResolvedValue(mockFriendshipDTO as any);

    //   const response = await app.inject({
    //     method: 'DELETE',
    //     url: '/friends/2',
    //     headers: { 'x-user-id': '15', 'x-user-role': 'ADMIN' },
    //   });

    //   expect(response.statusCode).toBe(200);
    // });

    test('Should return 404 if profile not found', async () => {
      vi.spyOn(friendshipService, 'removeFriend').mockRejectedValue(
        new AppError(ERR_DEFS.RESOURCE_NOT_FOUND, {
          userId: 1,
          details: {
            resource: LOG_RESOURCES.PROFILE,
            targetId: 2,
          },
        }),
      );

      const response = await app.inject({
        method: 'DELETE',
        url: '/friends/2',
        headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
      });

      expect(response.statusCode).toBe(404);
    });

    test('Should return 401 if userId is missing', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/friends/2',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // describe('GET /friends', () => {
  //   test('Should return friends list - 200', async () => {
  //     vi.spyOn(friendshipService, 'getFriendsByUserId').mockResolvedValue(mockManyFriendshipUnifiedDTO as FriendshipUnifiedDTO[]);

  //     const response = await app.inject({
  //       method: 'GET',
  //       url: '/friends',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //     });

  //     expect(response.statusCode).toBe(200);
  //   });

  //   test('Should return 200 if no friends found', async () => {
  //     vi.spyOn(friendshipService, 'getFriendsByUserId').mockResolvedValue([]);

  //     const response = await app.inject({
  //       method: 'GET',
  //       url: '/friends',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //     });
  //     logger.warn(response);

  //     expect(response.statusCode).toBe(200);
  //   });
  // });

  // describe('PATCH /friends/:id/nickname', () => {
  //   test('Should update friend nickname - 200', async () => {
  //     const updatedFriendship = { ...mockFriendshipFullDTO, nickname: 'newNick' };
  //     vi.mocked(friendshipService.updateFriendshipNickname).mockResolvedValue(
  //       updatedFriendship as FriendshipFullDTO,
  //     );

  //     const response = await app.inject({
  //       method: 'PATCH',
  //       url: `/friends/2/nickname`,
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //       payload: { nickname: 'newNick' },
  //     });

  //     expect(response.statusCode).toBe(200);
  //     // expect(JSON.parse(response.payload).relationId).toBe(1);
  //   });

  //   test('Should return 404 if friendship not found', async () => {
  //     vi.spyOn(friendshipService, 'updateFriendshipNickname').mockRejectedValue(
  //       new AppError(ERR_DEFS.RESOURCE_NOT_FOUND, {}),
  //     );

  //     const response = await app.inject({
  //       method: 'PATCH',
  //       url: '/friends/2/nickname',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //       payload: { nickname: 'newNick' },
  //     });

  //     expect(response.statusCode).toBe(404);
  //   });

  //   test('Should return 401 if userId is missing', async () => {
  //     const response = await app.inject({
  //       method: 'PATCH',
  //       url: '/friends/2/nickname',
  //       headers: { 'x-user-name': 'toto' },
  //       payload: { nickname: 'newNick' },
  //     });

  //     expect(response.statusCode).toBe(401);
  //   });

  //   test('Should return 400 for invalid nickname', async () => {
  //     const response = await app.inject({
  //       method: 'PATCH',
  //       url: '/friends/2/nickname',
  //       headers: { 'x-user-id': '1', 'x-user-name': 'toto' },
  //       payload: { nickname: 'a'.repeat(51) },
  //     });

  //     expect(response.statusCode).toBe(400);
  //   });
  // });
});
