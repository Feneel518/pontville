export function createWhatsAppLink(opts: {
  phoneE164: string; // e.g. "+919876543210" or "+614xxxxxxxx"
  message: string;
}) {
  const phone = opts.phoneE164.replaceAll("+", "").replaceAll(" ", "");
  const text = encodeURIComponent(opts.message);
  return `https://wa.me/${phone}?text=${text}`;
}
