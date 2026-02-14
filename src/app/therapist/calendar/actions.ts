import { apiCreateAppointment, apiGetClients } from '@/lib/api-client';
import { z } from 'zod';

const AddAppointmentSchema = z.object({
  therapistId: z.string(),
  therapistName: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  appointmentDate: z.date(),
  type: z.enum(['Online', 'Yüz Yüze']),
  description: z
    .string()
    .min(3, 'Açıklama en az 3 karakter olmalıdır.')
    .max(200, 'Açıklama en fazla 200 karakter olabilir.'),
});

export type AddAppointmentInput = z.infer<typeof AddAppointmentSchema>;

export async function addAppointmentAction(
  input: AddAppointmentInput
): Promise<{ success: boolean; message: string }> {
  const validation = AddAppointmentSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors.map(e => e.message).join(', '),
    };
  }

  try {
    const response = await apiCreateAppointment({
      ...validation.data,
      appointmentDate: validation.data.appointmentDate.toISOString(),
    });

    if (response.success) {
      return { success: true, message: 'Randevu başarıyla oluşturuldu.' };
    }

    return {
      success: false,
      message: response.error || 'Randevu oluşturulurken bir hata oluştu.',
    };
  } catch (error) {
    console.error('Error adding new appointment:', error);
    return {
      success: false,
      message: 'Randevu oluşturulurken bir hata oluştu.',
    };
  }
}

export async function getClientsForTherapistAction(
  therapistId: string
): Promise<{ id: string; displayName: string }[]> {
  if (!therapistId) return [];

  try {
    const response = await apiGetClients();
    if (response.success && response.data) {
      return response.data.map((client: any) => ({
        id: client.userId || client.id,
        displayName: client.displayName,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching clients for therapist:', error);
    return [];
  }
}
