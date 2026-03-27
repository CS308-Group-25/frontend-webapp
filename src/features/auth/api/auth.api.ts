import apiClient from '@/lib/api-client';
import { RegistrationFormValues } from '../schemas/registration.schema';

export const registerUser = async (data: RegistrationFormValues) => {
  const payload = {
    name: `${data.firstName} ${data.lastName}`.trim(),
    email: data.email,
    password: data.password,
    address: data.address,
    tax_id: data.taxId,
  };
  return apiClient.post('/v1/auth/register', payload);
};
