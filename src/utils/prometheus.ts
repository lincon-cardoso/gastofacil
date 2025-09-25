import client from "prom-client";

const register = new client.Registry();

register.setDefaultLabels({
  app: "gastofacil",
});

client.collectDefaultMetrics({ register });

export const prometheusClient = client;
export const prometheusRegister = register;
