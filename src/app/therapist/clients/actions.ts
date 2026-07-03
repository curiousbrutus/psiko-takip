import { apiFetch } from '@/lib/api-client';
import { z } from 'zod';

const AddClientSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: 'Ad Soyad en az 3 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Geçersiz e-posta adresi.' }),
  phone: z.string().optional(),
  therapistId: z.string().min(1, { message: 'Terapist ID gereklidir.' }),
});

export type AddClientInput = z.infer<typeof AddClientSchema>;

export async function addClientAction(
  input: AddClientInput
): Promise<{ success: boolean; message: string }> {
  const validation = AddClientSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors.map(e => e.message).join(', '),
    };
  }

  const { fullName, email, phone, therapistId } = validation.data;

  // Handle Demo User Case
  if (therapistId === 'demo-therapist') {
    console.log('Demo therapist is adding a client. Simulating success.');
    return {
      success: true,
      message: `${fullName} başarıyla davet edildi. (Demo)`,
    };
  }

  try {
    const response = await apiFetch('/users/clients', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        ...(phone && { phone }),
      }),
    });

    if (response.success) {
      const linked = response.data?.type === 'linked';
      return {
        success: true,
        message: linked
          ? `${fullName} hesabınıza bağlandı.`
          : `${fullName} davet edildi. Bu e-posta ile kayıt olduğunda hesabınıza otomatik bağlanacak.`,
      };
    }

    return {
      success: false,
      message: response.error || 'Danışan eklenirken bir hata oluştu.',
    };
  } catch (error) {
    console.error('Error adding new client:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Danışan eklenirken bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
}

const UpdateClientStatusSchema = z.object({
  clientId: z.string().min(1),
  status: z.enum(['Aktif', 'Pasif']),
});

export async function updateClientStatusAction(
  input: z.infer<typeof UpdateClientStatusSchema>
): Promise<{ success: boolean; message: string }> {
  const validation = UpdateClientStatusSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Geçersiz veri.' };
  }

  const { clientId, status } = validation.data;

  // Backend uses an English enum for the therapist-facing client status.
  const apiStatus = status === 'Aktif' ? 'active' : 'passive';

  try {
    const response = await apiFetch(`/users/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: apiStatus }),
    });

    if (response.success) {
      return { success: true, message: 'Danışan durumu güncellendi.' };
    }

    return {
      success: false,
      message: response.error || 'Durum güncellenirken bir hata oluştu.',
    };
  } catch (error) {
    console.error('Error updating client status:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Durum güncellenirken bir hata oluştu.',
    };
  }
}
