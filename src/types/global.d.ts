// Declaração global de tipos para arquivos SCSS
// Permite importar arquivos .scss como módulos TypeScript
// Necessário para CSS Modules com Sass no Next.js
declare module "*.scss" {
  // O conteúdo pode ser um objeto com nomes de classes como chaves (CSS Modules)
  // ou uma string simples (importação direta do CSS)
  const content: { [className: string]: string } | string;
  export default content;
}
