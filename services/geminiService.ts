import { GoogleGenAI } from "@google/genai";
import { DashboardMetrics, Patient, Appointment } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  getDashboardInsights: async (metrics: DashboardMetrics): Promise<string> => {
    const client = getAiClient();
    if (!client) return "Chave da API não configurada. Configure process.env.API_KEY para insights.";

    const prompt = `
      Atue como um consultor sênior de gestão de clínicas. Analise os seguintes dados da minha clínica e forneça 3 insights curtos e acionáveis (máximo 2 frases cada) em formato de lista Markdown. Foque em lucratividade e retenção.
      
      Dados:
      - Total Pacientes: ${metrics.totalPatients}
      - Pacientes Ativos (últimos 60 dias): ${metrics.activePatients}
      - Pacientes Perdidos (sem retorno > 60 dias): ${metrics.lostPatients}
      - Receita Total: R$ ${metrics.totalRevenue}
      - Lucro Líquido: R$ ${metrics.netProfit}
      - Distribuição de consultas: ${JSON.stringify(metrics.appointmentsByType)}
    `;

    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Não foi possível gerar insights no momento.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Erro ao conectar com a IA para análise.";
    }
  },

  getPatientSummary: async (patient: Patient, appointments: Appointment[]): Promise<string> => {
    const client = getAiClient();
    if (!client) return "Chave da API não configurada.";

    // Sort appointments by date desc
    const sortedApps = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const historyText = sortedApps.map(app => 
      `- ${app.date} (${app.type}): Notas: "${app.notes}"`
    ).join('\n');

    const prompt = `
      Analise o histórico clínico deste paciente e forneça um resumo de 1 parágrafo sobre a evolução do tratamento e frequência. Fale em português.
      
      Paciente: ${patient.name}, Idade: ${new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} anos.
      Histórico:
      ${historyText}
    `;

    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Sem dados suficientes para análise.";
    } catch (error) {
      console.error(error);
      return "Erro ao analisar histórico.";
    }
  }
};