export const EMAILJS_CONFIG = {
  serviceId: '',
  templateId: '',
  publicKey: '',
};

export function isEmailjsConfigured() {
  return Boolean(EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.publicKey);
}
