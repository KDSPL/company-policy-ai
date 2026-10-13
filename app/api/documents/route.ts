import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractPdfText } from "@/lib/pdf/extractText";
import { chunkText } from "@/lib/ai/chunkText";
import { generateEmbedding } from "@/lib/ai/embedText";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("GET /api/documents error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch documents",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // --------------------------------------------------
    // 1. Get uploaded file
    // --------------------------------------------------

    const formData = await req.formData();

    const file = formData.get("file");


    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file received",
        },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File size must not exceed 500 MB",
        },
        { status: 400 }
      );
    }

    // console.log("File name:", file.name);
    // console.log("File size:", file.size);
    // console.log("File type:", file.type);

    // --------------------------------------------------
    // 2. Convert file to Buffer
    // --------------------------------------------------

    const arrayBuffer = await file.arrayBuffer();

    const pdfBuffer = Buffer.from(arrayBuffer);

    // --------------------------------------------------
    // 3. Generate SHA-256 hash
    // --------------------------------------------------

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      arrayBuffer
    );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    );

    const fileHash = hashArray
      .map((byte) =>
        byte.toString(16).padStart(2, "0")
      )
      .join("");

    console.log("File hash:", fileHash);

    // --------------------------------------------------
    // 4. Check duplicate document
    // --------------------------------------------------

    const existingDocument =
      await prisma.document.findUnique({
        where: {
          fileHash,
        },
      });

    if (existingDocument) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This document has already been uploaded.",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 5. Extract text from PDF
    // --------------------------------------------------

    const extractedText =
      await extractPdfText(pdfBuffer);

    console.log(
      "Extracted text length:",
      extractedText.length
    );

    console.log(
      "Extracted text preview:",
      extractedText.substring(0, 500)
    );

    if (!extractedText.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not extract text from this PDF.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Split text into chunks
    // --------------------------------------------------

    const chunks = chunkText(extractedText);

    console.log(
      "Total chunks:",
      chunks.length
    );

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No usable text chunks were created.",
        },
        { status: 400 }
      );
    }


    // --------------------------------------------------
    // 7. Create document
    // --------------------------------------------------

    const document = await prisma.document.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ""),

        fileName: file.name,

        fileUrl: `/uploads/${file.name}`,

        fileType: file.type,

        fileSize: file.size,

        // Temporary value until authentication
        // is implemented.
        uploadedBy: "admin",

        fileHash,

        status: "ACTIVE",
      },
    });

    console.log(
      "Document created:",
      document.id
    );

    // // --------------------------------------------------
    // // 8. Save document chunks
    // // --------------------------------------------------

    // await prisma.documentChunk.createMany({
    //   data: chunks.map((chunk) => ({
    //     documentId: document.id,
    //     content: chunk,
    //   })),
    // });


    // console.log(
    //   `Saved ${chunks.length} chunks for document ${document.id}`
    // );

    // --------------------------------------------------
    // 8. Generate embeddings and save document chunks
    // --------------------------------------------------

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      console.log(
        `Generating embedding ${i + 1}/${chunks.length}`
      );

      // Generate embedding using nomic-embed-text
      const embedding = await generateEmbedding(chunk);

      console.log(
        `Embedding dimensions for chunk ${i + 1}:`,
        embedding.length
      );

      // Convert number[] into PostgreSQL vector format
      const vector = `[${embedding.join(",")}]`;

      const chunkId = crypto.randomUUID();

      // Prisma does not directly support Unsupported("vector"),
      // so we insert the vector using raw SQL.
      await prisma.$executeRaw`
    INSERT INTO "DocumentChunk"
      ("id", "documentId", "content", "embedding", "createdAt")
    VALUES
      (
        ${chunkId},
        ${document.id},
        ${chunk},
        ${vector}::vector,
        NOW()
      )
  `;
    }

    // console.log(
    //   `Saved ${chunks.length} chunks with embeddings for document ${document.id}`
    // );

    // --------------------------------------------------
    // 9. Return response
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Document uploaded and processed successfully",
      document,
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error(
      "POST /api/documents error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload document",
      },
      { status: 500 }
    );
  }
}