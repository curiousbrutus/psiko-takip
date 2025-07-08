"use server";

import { analyzeTestResults } from '@/ai/flows/analyze-test-results';
import { db, auth } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { z } from 'zod';

const BurnoutTestSchema = z.record(z.string().regex(/^[0-3]$/));

export async function analyzeBurnoutTest(
  formData: z.infer<typeof BurnoutTestSchema>
): Promise<{ success: boolean; error?: string }> {
  
  const validation = BurnoutTestSchema.safeParse(formData);
  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: 'Bu işlemi yapmak için giriş yapmalısınız.' };
  }

  if (!validation.success) {
    return { success: false, error: 'Geçersiz form verisi sağlandı.' };
  }
  
  const answers = validation.data;

  try {
    // 1. Calculate total score
    const totalScore = Object.values(answers).reduce((sum, value) => sum + parseInt(value, 10), 0);

    // 2. Prepare input for AI flow
    const testResults = {
      totalScore,
      answers,
    };
    
    const input = {
      testName: 'Tükenmişlik Envanteri',
      testResults: testResults,
      userInformation: 'Kullanıcı bu testi mevcut iş stresi ve tükenmişlik seviyesini anlamak için yapıyor.',
    };

    // 3. Call AI Flow
    const analysis = await analyzeTestResults(input);

    // 4. Get therapist ID
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const therapistId = userDocSnap.exists() ? userDocSnap.data().connectedTherapist : null;

    // 5. Save results to Firestore
    await addDoc(collection(db, 'testSubmissions'), {
        userId: user.uid,
        therapistId,
        testName: input.testName,
        analysis,
        createdAt: serverTimestamp(),
        answers,
        totalScore,
    });
    
    return { success: true };

  } catch (error) {
    console.error("AI analysis or DB operation failed:", error);
    return { success: false, error: 'Test sonuçları kaydedilemedi. Lütfen daha sonra tekrar deneyin.' };
  }
}
