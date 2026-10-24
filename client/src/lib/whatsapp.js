import { formatPrice } from './money.js';

// Mensaje del pedido para WhatsApp. Recibe líneas con { name, quantity, subtotalCents }.
// No incluye ningún dato personal del cliente.
export function buildOrderMessage(lines) {
  const items = lines.map(
    (line, index) => `${index + 1}. ${line.name} x${line.quantity} = ${formatPrice(line.subtotalCents)}`,
  );
  const total = lines.reduce((sum, line) => sum + line.subtotalCents, 0);
  return ['Hola Chaski Store, quiero hacer este pedido:', '', ...items, '', `Total: ${formatPrice(total)}`].join('\n');
}

export function buildWhatsAppUrl(lines, whatsappNumber) {
  if (lines.length === 0) return null;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildOrderMessage(lines))}`;
}
