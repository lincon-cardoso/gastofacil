// Declaração de tipos para o módulo "disposable-email-domains"
// Este módulo contém uma lista de domínios de email descartáveis/temporários
// É usado para validar se um email não é de um provedor temporário
declare module "disposable-email-domains" {
  const domains: string[]; // Array de strings contendo domínios como "10minutemail.com", "tempmail.org", etc.
  export default domains;
}
