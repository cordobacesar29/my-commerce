import { NextRequest, NextResponse } from "next/server";
import { createXai } from "@ai-sdk/xai";
import { generateImage } from "ai";
import { db } from "@/lib/firebase";
import { adminAuth } from "@/lib/firebase-admin";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";

const xai = createXai({ apiKey: process.env.XAI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!bearerToken) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(bearerToken);
    // Obtenemos el UID del usuario desde el header (lo enviamos desde el frontend)
    const { uid, prompt } = await req.json();

    if (!uid || !prompt) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (decoded.uid !== uid) {
      return NextResponse.json({ error: "UID mismatch" }, { status: 403 });
    }

    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    let generationsUsed = 0;

    if (userDoc.exists()) {
      generationsUsed = userDoc.data()?.freeGenerationsUsed || 0;
    } else {
      // Primera vez: creamos el documento
      await setDoc(userRef, {
        uid,
        freeGenerationsUsed: 0,
        createdAt: serverTimestamp(),
      });
    }

    if (generationsUsed >= 3) {
      return NextResponse.json(
        {
          error:
            "Ya usaste tus 3 pruebas gratis. Compra una remera para seguir creando logos.",
        },
        { status: 403 },
      );
    }

    // Llamada a Grok Imagine
    const { image } = await generateImage({
      model: xai.image("grok-imagine-image"),
      prompt: `Logo para remera: ${prompt}. Diseño vectorial minimalista, apto para serigrafía, fondo transparente, centrado, estilo profesional para merchandising de ropa`,
      n: 1,
    });

    const imageUrl = image.base64;
    // Creamos una referencia a la sub-colección 'designs' dentro del usuario
    const designsCollectionRef = collection(db, "users", uid, "designs");

    const newDesignDoc = await addDoc(designsCollectionRef, {
      prompt,
      imageUrl,
      model: "grok-imagine-image",
      createdAt: serverTimestamp(),
      isFavorite: false
    })

    // Actualizamos el contador en Firestore
    await updateDoc(userRef, {
      freeGenerationsUsed: generationsUsed + 1,
      lastGenerationAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      designId: newDesignDoc.id,
      imageUrl,
      generationsLeft: 3 - (generationsUsed + 1),
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al generar la imagen" },
      { status: 500 },
    );
  }
}
