
import { NextResponse } from "next/server";
import { searchSimilarChunks } from "@/lib/ai/vectorSearch";
import { generateAnswer } from "@/lib/ai/generateAnswer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }
  try {
    // 1. Get logged-in user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Read request
    const body = await req.json();

    const question = body.question?.trim();
    const chatId = body.chatId?.trim();

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question is required",
        },
        { status: 400 }
      );
    }

    // 3. Find existing chat OR create new chat
    let chat;

    if (chatId) {
      chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId: userId,
        },
      });

      if (!chat) {
        return NextResponse.json(
          {
            success: false,
            message: "Chat not found",
          },
          { status: 404 }
        );
      }
    } else {
      chat = await prisma.chat.create({
        data: {
          userId: userId,
          title:
            question.length > 50
              ? question.substring(0, 50) + "..."
              : question,
        },
      });
    }

    // 4. Save USER message
    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: "USER",
        content: question,
      },
    });

    // 5. Vector search
    const chunks = await searchSimilarChunks(question, 1);

    // 6. No relevant policy found
    if (chunks.length === 0) {
      const answer =
        "I could not find this information in the available company policies.";

      await prisma.chatMessage.create({
        data: {
          chatId: chat.id,
          role: "ASSISTANT",
          content: answer,
        },
      });

      await prisma.chat.update({
        where: {
          id: chat.id,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        chatId: chat.id,
        question,
        answer,
        sources: [],
      });
    }

    // 7. Build context
    const MAX_CONTEXT_CHARS = 1000;

    const context = chunks
      .map((chunk, index) => {
        return `Policy Source ${index + 1}:
${chunk.content}`;
      })
      .join("\n\n")
      .slice(0, MAX_CONTEXT_CHARS);

    // 8. Generate answer using Qwen
    // const aiStart = Date.now();
    const answer = await generateAnswer({
      question,
      context,
    });


    // const generationTime =
    //   Date.now() - aiStart;

    // console.log(
    //   "⏱️ Qwen generation:",
    //   generationTime,
    //   "ms"
    // );

    // console.log(
    //   "QWEN ANSWER:",
    //   answer
    // );


    // 9. Save ASSISTANT message
    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: "ASSISTANT",
        content: answer,
      },
    });

    // 10. Update chat timestamp
    await prisma.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // 11. Return response
    return NextResponse.json({
      success: true,
      chatId: chat.id,
      question,
      answer,
      sources: chunks.map((chunk) => ({
        id: chunk.id,
        documentId: chunk.documentId,
        distance: chunk.distance,
      })),
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate answer",
      },
      { status: 500 }
    );
  }
}

