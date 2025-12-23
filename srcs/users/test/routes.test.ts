// import z from 'zod';
// mock before importing server / routes

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
// import fastify from "fastify";
import { API_ERRORS } from '../src/utils/messages.js';
import { afterEach } from 'node:test';
import { ProfileDTO } from "@transcendence/core";
// import { umRoutes } from "../src/routes/um.routes.js";
import { buildApp } from '../src/index.js';
import { FastifyInstance } from 'fastify';

// import { UserProfile } from '@prisma/client'

// auto mock all functions from this file
// vi.mock("../src/services/um.service.js");
// vi.mock("../src/utils/mappers.js");

vi.mock("../src/services/um.service.js", () => ({
  findByUsername: vi.fn(),
  createProfileInData: vi.fn(),
}));

vi.mock("../src/utils/mappers.js", () => ({
  mapUserProfileToDTO: vi.fn(),
}));

import * as umService from "../src/services/um.service.js";
import * as mappers from "../src/utils/mappers.js";

let app: FastifyInstance;

describe("GET /:username", () => {

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

    // const mockProfile = { id: 1, authId: 1, username: "toto", email: "toto@test.com", createdAt: new Date(), avatarUrl: "avatars/default.png" };
    
    
    // const mockProfileDTO = { username: "toto", avatarUrl: "avatars/default.png"};

    // test("GET /:username - Should return user profile", async () => {
    //     // vi.spyOn(umService, 'findByUsername').mockResolvedValue(mockProfileDTO as ProfileDTO);
    //     // vi.spyOn(mappers, 'mapUserProfileToDTO').mockReturnValue(mockProfileDTO);

    //     (umService.findByUsername as ProfileDTO).mockResolvedValue(mockProfileDTO);
    //     (mappers.mapUserProfileToDTO as ProfileDTO).mockReturnValue(mockProfileDTO);

    //     const response = await app.inject({
    //         method: 'GET',
    //         url: "/toto"
    //     });

    //     expect(umService.findByUsername).toHaveBeenCalledWith("toto");
    //     // expect(mappers.mapUserProfileToDTO).toHaveBeenCalledWith(mockProfile);
    //     expect(response.statusCode).toBe(200);
    //     expect(JSON.parse(response.payload)).toEqual({
    //         profile: expect.objectContaining({
    //             username: "toto"
    //         })
    //     })
    // });

    test("GET /:username - Should return 404 if not found", async () => {
        vi.spyOn(umService, 'findByUsername').mockResolvedValue(null);
        
        const response = await app.inject({
            method: 'GET',
            url: "/unknown"
        });

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.payload)).toEqual({
                message: API_ERRORS.USER.NOT_FOUND
        });
    });

    test("GET /:username - Should reject admin as username", async () => {

        const response = await app.inject({
            method: 'GET',
            url: "/admin"
        });

        expect(response.statusCode).toBe(400);

        const body = JSON.parse(response.payload);
        expect(body.error).toBe(API_ERRORS.USER.BAD_REQUEST);
    });

    test("GET /:username - Should return 500 if service throws error", async () => {
        vi.spyOn(umService, 'findByUsername').mockRejectedValue(new Error(API_ERRORS.DB.CONNECTION_ERROR));
        
        const response = await app.inject({
            method: 'GET',
            url: "/unknown"
        });

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.payload)).toEqual(expect.objectContaining({
                error: "Internal Server Error",
                message: API_ERRORS.DB.CONNECTION_ERROR,
        }));
    });
})