module.exports = {
  // Use a variável de ambiente SITE_URL em ambiente real
  siteUrl: process.env.SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  // Opções recomendadas mínimas
  changefreq: "weekly",
  priority: 0.7,
};
