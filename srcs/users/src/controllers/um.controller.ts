import { FastifyInstance, FastifyReply } from "fastify";

interface User {
    username: string;
    email?: string;
    avatarUrl?: string;
}

export async function getUserById(this: FastifyInstance) {

};

export async function getAvatar(this:FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    
};