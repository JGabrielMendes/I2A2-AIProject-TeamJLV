"use client"

import { useState, useEffect } from "react"
import Head from "next/head"

export default function Home() {
  const [csvFiles, setCsvFiles] = useState([])
  const [selectedCsv, setSelectedCsv] = useState("")
  const [question, setQuestion] = useState("")
  const [status, setStatus] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Lista os arquivos CSV disponíveis
    const files = ["202401_NFs_Cabecalho.csv", "202401_NFs_Itens.csv"]
    setCsvFiles(files)
    if (files.length > 0) {
      setSelectedCsv(files[0])
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedCsv || !question.trim()) {
      setStatus("Erro: Selecione um arquivo CSV e digite uma pergunta")
      return
    }

    setIsLoading(true)
    setStatus("Enviando...")
    setAnswer("")

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: selectedCsv,
          question: question.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("Resposta recebida!")
        setAnswer(data.answer || "Nenhuma resposta foi retornada.")
      } else {
        setStatus(`Erro: ${data.error || "Erro desconhecido"}`)
      }
    } catch (error) {
      setStatus(`Erro: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>CSV Chatbot - Análise de Dados</title>
        <meta name="description" content="Chatbot para análise de arquivos CSV" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header>
          <h1>CSV Chatbot</h1>
          <p>Faça perguntas sobre seus dados CSV</p>
        </header>

        <main>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="csv-select">Selecione o arquivo CSV:</label>
              <select
                id="csv-select"
                value={selectedCsv}
                onChange={(e) => setSelectedCsv(e.target.value)}
                className="select"
              >
                <option value="">Escolha um arquivo...</option>
                {csvFiles.map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="question">Sua pergunta sobre os dados:</label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Qual é o valor total das notas fiscais? Quais são os principais produtos vendidos?"
                rows={4}
                className="textarea"
              />
            </div>

            <button type="submit" disabled={isLoading || !selectedCsv || !question.trim()} className="button">
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </form>

          {status && <div className={`status ${status.startsWith("Erro:") ? "error" : "success"}`}>{status}</div>}

          {answer && (
            <div className="answer">
              <h3>Resposta:</h3>
              <div className="answer-content">{answer}</div>
            </div>
          )}
        </main>

        <style jsx>{`
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          header {
            text-align: center;
            margin-bottom: 40px;
          }

          h1 {
            color: #333;
            margin-bottom: 10px;
          }

          p {
            color: #666;
            font-size: 16px;
          }

          .form {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
          }

          .select, .textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            transition: border-color 0.3s;
          }

          .select:focus, .textarea:focus {
            outline: none;
            border-color: #007bff;
          }

          .textarea {
            resize: vertical;
            min-height: 100px;
          }

          .button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          .button:hover:not(:disabled) {
            background: #0056b3;
          }

          .button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          .status {
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-weight: 500;
          }

          .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }

          .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }

          .answer {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
          }

          .answer h3 {
            margin-top: 0;
            color: #333;
          }

          .answer-content {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #007bff;
            white-space: pre-wrap;
            line-height: 1.6;
          }
        `}</style>
      </div>
    </>
  )
}
