
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, writeBatch, serverTimestamp, arrayUnion, query, where, getDocs, updateDoc } from 'firebase/firestore';
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
    const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));
    const existingUserSnapshot = await getDocs(existingUserQuery);
    if (!existingUserSnapshot.empty) {
        return { success: false, message: 'Bu e-posta adresine sahip bir kullanıcı zaten mevcut.' };
    }
    
    const batch = writeBatch(db);
    
    const newClientRef = doc(collection(db, 'users'));
    
    const newClientData = {
        uid: newClientRef.id,
        displayName: fullName,
        email,
        ...(phone && { phone }),
        role: 'danisan',
        status: 'Davet Edildi', 
        createdAt: serverTimestamp(),
        connectedTherapist: therapistId,
        organizationId: null, 
        subscription: { status: 'free', expires: null },
    };

    batch.set(newClientRef, newClientData);

    const therapistRef = doc(db, 'users', therapistId);
    batch.update(therapistRef, {
        danisanlarim: arrayUnion(newClientRef.id)
    });

    await batch.commit();

    return { success: true, message: `${fullName} başarıyla davet edildi. Kaydı tamamlamaları için bilgilendirme yapabilirsiniz.` };

  } catch (error) {
    console.error('Error adding new client:', error);
    return { success: false, message: 'Danışan eklenirken bir hata oluştu. Lütfen tekrar deneyin.' };
  }
}

const UpdateClientStatusSchema = z.object({
  clientId: z.string().min(1),
  status: z.enum(['Aktif', 'Pasif']),
});

export async function updateClientStatusAction(input: z.infer<typeof UpdateClientStatusSchema>): Promise<{ success: boolean; message: string }> {
    const validation = UpdateClientStatusSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, message: "Geçersiz veri." };
    }
    
    const { clientId, status } = validation.data;
    
    try {
        const clientRef = doc(db, 'users', clientId);
        await updateDoc(clientRef, { status: status });
        return { success: true, message: "Danışan durumu güncellendi." };
    } catch (error) {
        console.error('Error updating client status:', error);
        return { success: false, message: 'Durum güncellenirken bir hata oluştu.' };
    }
}

    