import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(conversationId: number, senderId: number, content: string) {
    return this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: true,
      },
    });
  }

  async getMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: true,
      },
    });
  }

  async getConversationList() {
    return this.prisma.conversation.findMany({
      include: {
        user: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async getMyMessages(userId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { userId },
      include: {
        messages: true,
      },
    });

    if (!conversation) return [];

    return this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: true,
      },
    });
  }

  async canAccessConversation(
    conversationId: number,
    userId: number,
    role: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return false;

    if (role === 'ADMIN') return true;

    return conversation.userId === userId;
  }

  async getOrCreateConversation(userId: number) {
    return this.prisma.conversation.upsert({
      where: {
        userId,
      },
      update: {},
      create: {
        userId,
      },
    });
  }
}
