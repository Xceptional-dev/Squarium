import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIExtractionResult } from './types'

export class GeminiClient {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })
  }

  async extractProblems(text: string): Promise<AIExtractionResult[]> {
    const prompt = `You are an AI that identifies problems and pain points mentioned in startup-related discussions.
    
Input text will be a single comment or product description.

Return JSON in this format:
[
  {
    "problem": "short, clear problem statement",
    "confidence_score": 0.0 to 1.0,
    "category": "broad domain category like SaaS, AI, HealthTech, FinTech, E-commerce, Developer Tools",
    "example_quote": "verbatim excerpt from the text that shows the problem"
  }
]

Only include items that express a clear, specific problem or pain point.
If no problems are found, return an empty array.

Text to analyze:
${text}`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const content = response.text()
      
      // Parse JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) return []
      
      const problems: AIExtractionResult[] = JSON.parse(jsonMatch[0])
      return problems.filter(p => p.confidence_score >= 0.3) // Filter low confidence
    } catch (error) {
      console.error('Gemini extraction error:', error)
      return []
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Note: Using text-embedding-3-small equivalent for Gemini
      const embeddingModel = this.genAI.getGenerativeModel({ 
        model: 'embedding-001' 
      })
      
      const result = await embeddingModel.embedContent(text)
      return result.embedding.values
    } catch (error) {
      console.error('Embedding generation error:', error)
      // Return zero vector as fallback
      return new Array(768).fill(0)
    }
  }

  async generateClusterSummary(problems: string[]): Promise<{
    title: string
    summary: string
  }> {
    const prompt = `Given these similar startup problems, generate:
1. A concise title (max 60 chars)
2. A brief summary (max 200 chars)

Problems:
${problems.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Return JSON:
{
  "title": "concise problem title",
  "summary": "brief summary of the problem space"
}`

    try {
      const result = await this.model.generateContent(prompt)
      const content = result.response.text()
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback
      return {
        title: problems[0].substring(0, 60),
        summary: `Common problem in startup discussions (${problems.length} mentions)`
      }
    } catch (error) {
      console.error('Cluster summary error:', error)
      return {
        title: problems[0].substring(0, 60),
        summary: `Startup problem cluster (${problems.length} mentions)`
      }
    }
  }
}