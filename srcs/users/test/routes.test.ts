import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import fastify from "fastify";
import { umRoutes } from "../src/routes/um.routes.js";

jest.mock("../src/services/um.service.js", () =>({
    findByUsername: jest.fn(),
    createProfile: jest.fn()
}));

import * as umService from "../src/services/um.service.js";
import { getProfileByUsername } from '../src/controllers/um.controller.js';

describe("User Management Routes", () => {
    const app = fastify();

    beforeAll(async () => {
        app.register(umRoutes);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    const mockUser = { id: 1, authId: 1, username: "toto", email: "toto@test.com", createdAt: new Date() };
    const mockFindByUsername = jest.fn<typeof umService.findByUsername>();

    test("GET /users/:username - Should return user profile", async () => {
        const mockRequest = {
            params: { username: 'toto' },
            log: { info: jest.fn() }
        } as any;

        const mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as any;

        jest.spyOn(umService, 'findByUsername');
        
        mockFindByUsername(mockUser);

        const response = await app.inject({
            method: 'GET',
            url: "/users/toto"
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual(expect.objectContaining({
            username: "toto"
        }));
    });

    test("GET /users/:username - Should return 404 if not found", async () => {
        const mockRequest = {
            params: { username: 'unknown' },
            log: { info: jest.fn() }
        } as any;

        const mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as any;

        const response = await app.inject({
            method: 'GET',
            url: "/users/unknown"
        });

        (umService.findByUsername as jest.Mock).mockResolvedValue(null);

        await getProfileByUsername(request, reply);

        expect(reply.status).toHaveBeenCalledWith(404);
        expect(reply.send).toHaveBeenCalledWith({message: "User not found"})
    });

    test("GET /users/:username - Should reject admin as username", async () => {

        const response = await app.inject({
            method: 'GET',
            url: "/users/admin"
        });

        expect(response.statusCode).toBe(400);
    });


})