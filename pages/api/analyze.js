import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // espera receber { path: "nomeDoArquivo.csv", question: "..." } no body
    const { path: csvPath, question } = req.body;
    if (!csvPath || !question) {
      return res
        .status(400)
        .json({ error: "Path e question são obrigatórios" });
    }

    // monta o caminho real
    const fullPath = path.join(process.cwd(), "public", "csvs", csvPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Arquivo CSV não encontrado" });
    }

    // prepara o form-data
    const form = new FormData();
    form.append("file", fs.createReadStream(fullPath), {
      filename: csvPath,
      contentType: "text/csv",
    });
    form.append("question", question);

    // dispara pro n8n, esperando resposta em texto
    const webhookUrl =
      "https://n8n.elora.digital/webhook/upload-csv"; // use produção ou teste conforme desejado
    const n8nResponse = await axios.post(webhookUrl, form, {
      headers: form.getHeaders(),
      responseType: "text",      // <— lê tudo como string
    });

    // n8nResponse.data é uma string com a resposta do assistant
    const textAnswer = n8nResponse.data;

    return res.status(200).json({
      answer:
        typeof textAnswer === "string" && textAnswer.trim().length > 0
          ? textAnswer.trim()
          : "Nenhuma resposta foi retornada pelo webhook",
    });
  } catch (error) {
    console.error("Erro na análise:", error);
    return res
      .status(500)
      .json({ error: `Erro interno do servidor: ${error.message}` });
  }
}
