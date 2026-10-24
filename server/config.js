import { z } from 'zod';

const missingPassword = 'Falta la variable ADMIN_PASSWORD (la clave del administrador). Defínela en el archivo .env.';
const badNumber =
  'La variable WHATSAPP_NUMBER es obligatoria y debe tener solo dígitos con código de país, de 8 a 15, sin "+" ni espacios.';
const badPort = 'La variable PORT debe ser un número de puerto entre 1 y 65535.';

const isValidPort = (value) =>
  value === undefined || value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 65535);

const schema = z.object({
  ADMIN_PASSWORD: z.string({ error: missingPassword }).min(1, missingPassword),
  WHATSAPP_NUMBER: z.string({ error: badNumber }).regex(/^\d{8,15}$/, badNumber),
  PORT: z.string().optional().refine(isValidPort, badPort),
});

export function readConfig(env) {
  const result = schema.safeParse(env);
  if (!result.success) {
    throw new Error(result.error.issues.map((issue) => issue.message).join(' '));
  }
  const { ADMIN_PASSWORD, WHATSAPP_NUMBER, PORT } = result.data;
  return {
    adminPassword: ADMIN_PASSWORD,
    whatsappNumber: WHATSAPP_NUMBER,
    port: PORT ? Number(PORT) : 3000,
  };
}
