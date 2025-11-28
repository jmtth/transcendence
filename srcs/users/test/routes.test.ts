import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import fastify from "fastify";
import { umRoutes } from "../src/routes/um.routes.js";

jest.mock("../src/services/um.service.js", () =>({
    findByUsername: jest.fn(),
    createProfile: jest.fn()
}));

import * as umService from "../src/services/um.service.js";

describe("User Management Routes", () => {
    const app = fastify();

    beforeAll(async () => {
        app.register(umRoutes);
        await app.ready();
    });

    afterAll(() => {
        app.close();
    });

    test("GET /users/:username - Should return user profile", async () => {
        const mockUser = { id: 1, username: "toto", email: "toto@test.com", createdAt: new Date() };
        (umService.findByUsername as jest.Mock).mockResolvedValue(mockUser);

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
        (umService.findByUsername as jest.Mock).mockResolvedValue(mockUser);

        const response = await app.inject({
            method: 'GET',
            url: "/users/unknown"
        });

        expect(response.statusCode).toBe(404);
    });

    test("GET /users/:username - Should reject admin as username", async () => {

        const response = await app.inject({
            method: 'GET',
            url: "/users/admin"
        });

        expect(response.statusCode).toBe(400);
    });


})