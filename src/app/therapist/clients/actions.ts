'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, writeBatch, serverTimestamp, arrayUnion, query, where, getDocs } from 'firebase/firestore';
import { z } from 'zod';

const AddClientSchema = z.object({
  fullName: z.string().min(3, { message: 'Ad Soyad en az 3 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Geçersiz e-posta adresi.' }),
  phone: z.string().optional(),
  therapistId: z.string().min(1, { message: 'Terapist ID gereklidir.' }),
});

export type AddClientInput = z.infer<typeof AddClientSchema>;

export async function addClientAction(input: AddClientInput): Promise<{ success: boolean; message: string; }> {
  const validation = AddClientSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
  }

  const { fullName, email, phone, therapistId } = validation.data;

  try {
    // Check if a user with this email already exists
    const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));
    const existingUserSnapshot = await getDocs(existingUserQuery);
    if (!existingUserSnapshot.empty) {
        return { success: false, message: 'Bu e-posta adresine sahip bir kullanıcı zaten mevcut.' };
    }
    
    const batch = writeBatch(db);
    
    // 1. Create a new document reference for the client to get a UID
    const newClientRef = doc(collection(db, 'users'));
    
    // 2. Define the new client's data
    const newClientData = {
        uid: newClientRef.id,
        displayName: fullName,
        email,
        ...(phone && { phone }),
        role: 'danisan',
        status: 'invited', // New status for pending registrations
        createdAt: serverTimestamp(),
        connectedTherapist: therapistId,
        organizationId: null, // Assuming individual therapist for now
        subscription: { status: 'free', expires: null },
    };

    // 3. Add the new client document to the batch
    batch.set(newClientRef, newClientData);

    // 4. Update the therapist's document to include the new client
    const therapistRef = doc(db, 'users', therapistId);
    batch.update(therapistRef, {
        danisanlarim: arrayUnion(newClientRef.id)
    });

    // 5. Commit the batch
    await batch.commit();

    // In a real application, you would now trigger an email to the user
    // with a link to complete their registration and set a password.
    // e.g., using a Cloud Function and an email service like SendGrid.

    return { success: true, message: `${fullName} başarıyla davet edildi. Kaydı tamamlamaları için bilgilendirme yapabilirsiniz.` };

  } catch (error) {
    console.error('Error adding new client:', error);
    return { success: false, message: 'Danışan eklenirken bir hata oluştu. Lütfen tekrar deneyin.' };
  }
}
