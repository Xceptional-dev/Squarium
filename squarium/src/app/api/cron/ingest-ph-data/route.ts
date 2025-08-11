// Fixed version of src/app/api/cron/ingest-ph-data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ProductHuntAPI } from '@/lib/product-hunt'
import { GeminiClient } from '@/lib/gemini'
import { supabaseAdmin } from '@/lib/supabase'
import { Problem } from '@/lib/types'

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting Product Hunt data ingestion...')
    
    const phApi = new ProductHuntAPI()
    const gemini = new GeminiClient()
    
    // Fetch recent launches
    const products = await phApi.fetchRecentLaunches(1)
    console.log(`Fetched ${products.length} products`)

    for (const product of products) {
      // Store product (skip if exists)
      const { data: existingProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('ph_id', product.id)
        .single()

      let productId: string

      if (!existingProduct) {
        const { data: newProduct, error: productError } = await supabaseAdmin
          .from('products')
          .insert({
            ph_id: product.id,
            name: product.name,
            tagline: product.tagline,
            description: product.description,
            category: 'General', // Could extract from PH categories
            votes: product.votesCount,
            url: product.url,
            launch_date: new Date(product.createdAt).toISOString().split('T')[0]
          })
          .select('id')
          .single()

        if (productError) {
          console.error('Error inserting product:', productError)
          continue
        }
        productId = newProduct.id
      } else {
        productId = existingProduct.id
      }

      // Process product description for problems
      if (product.description) {
        await processTextForProblems(
          product.description,
          productId,
          null,
          gemini
        )
      }

      // Store and process comments
      for (const commentEdge of product.comments.edges) {
        const comment = commentEdge.node
        
        // Store comment (skip if exists)
        const { data: existingComment } = await supabaseAdmin
          .from('comments')
          .select('id')
          .eq('ph_comment_id', comment.id)
          .single()

        let commentId: string

        if (!existingComment) {
          const { data: newComment, error: commentError } = await supabaseAdmin
            .from('comments')
            .insert({
              ph_comment_id: comment.id,
              product_id: productId,
              author: comment.user.name,
              body: comment.body,
              upvotes: comment.votesCount,
              posted_at: comment.createdAt
            })
            .select('id')
            .single()

          if (commentError) {
            console.error('Error inserting comment:', commentError)
            continue
          }
          commentId = newComment.id
        } else {
          commentId = existingComment.id
          continue // Skip processing if comment already exists
        }

        // Process comment for problems
        await processTextForProblems(
          comment.body,
          productId,
          commentId,
          gemini
        )
      }
    }

    // After processing all new data, update problem clusters
    await updateProblemClusters(gemini)

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${products.length} products` 
    })
  } catch (error) {
    console.error('Ingestion error:', error)
    return NextResponse.json(
      { error: 'Ingestion failed' }, 
      { status: 500 }
    )
  }
}

async function processTextForProblems(
  text: string,
  productId: string,
  commentId: string | null,
  gemini: GeminiClient
) {
  const problems = await gemini.extractProblems(text)
  
  for (const problem of problems) {
    const embedding = await gemini.generateEmbedding(problem.problem)
    
    await supabaseAdmin
      .from('problems')
      .insert({
        product_id: productId,
        comment_id: commentId,
        problem_text: problem.problem,
        confidence_score: problem.confidence_score,
        category: problem.category,
        example_quote: problem.example_quote,
        embedding: embedding
      })
  }
}

async function updateProblemClusters(gemini: GeminiClient) {
  // Simple clustering: group by category and similar text
  // In production, you'd use more sophisticated vector similarity
  
  const { data: problems, error } = await supabaseAdmin
    .from('problems')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error || !problems) {
    console.error('Error fetching problems:', error)
    return
  }

  // Type assertion to ensure problems is treated as Problem array
  const typedProblems = problems as Problem[]

  // Group by category first
  const categorizedProblems = typedProblems.reduce((acc: Record<string, Problem[]>, problem: Problem) => {
    if (!acc[problem.category]) {
      acc[problem.category] = []
    }
    acc[problem.category].push(problem)
    return acc
  }, {})

  for (const [category, categoryProblems] of Object.entries(categorizedProblems)) {
    // Simple text similarity clustering (in production, use vector similarity)
    const clusters = await clusterProblemsByText(categoryProblems as Problem[], gemini)
    
    for (const cluster of clusters) {
      const avgConfidence = cluster.reduce((sum, p) => sum + p.confidence_score, 0) / cluster.length
      const recencyScore = calculateRecencyScore(cluster.map(p => p.created_at))
      const mentionCount = cluster.length
      const rankScore = (mentionCount * 0.5) + (avgConfidence * 0.3) + (recencyScore * 0.2)
      
      const summary = await gemini.generateClusterSummary(
        cluster.map(p => p.problem_text)
      )

      // Check if cluster already exists
      const { data: existingCluster } = await supabaseAdmin
        .from('problem_clusters')
        .select('id')
        .eq('cluster_title', summary.title)
        .single()

      if (existingCluster) {
        // Update existing cluster
        await supabaseAdmin
          .from('problem_clusters')
          .update({
            mention_count: mentionCount,
            avg_confidence: avgConfidence,
            recency_score: recencyScore,
            rank_score: rankScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCluster.id)
      } else {
        // Create new cluster
        await supabaseAdmin
          .from('problem_clusters')
          .insert({
            cluster_title: summary.title,
            cluster_summary: summary.summary,
            mention_count: mentionCount,
            avg_confidence: avgConfidence,
            recency_score: recencyScore,
            rank_score: rankScore,
            category: category
          })
      }
    }
  }
}

async function clusterProblemsByText(
  problems: Problem[],
  gemini: GeminiClient
): Promise<Problem[][]> {
  // Simplified clustering - group similar text lengths and first words
  // In production, use proper vector similarity clustering
  
  const clusters: Problem[][] = []
  const used = new Set<string>()
  
  for (const problem of problems) {
    if (used.has(problem.id)) continue
    
    const cluster = [problem]
    used.add(problem.id)
    
    // Find similar problems (basic text similarity)
    for (const other of problems) {
      if (used.has(other.id)) continue
      
      if (areSimilarProblems(problem.problem_text, other.problem_text)) {
        cluster.push(other)
        used.add(other.id)
      }
    }
    
    clusters.push(cluster)
  }
  
  return clusters
}

function areSimilarProblems(text1: string, text2: string): boolean {
  const words1 = text1.toLowerCase().split(' ')
  const words2 = text2.toLowerCase().split(' ')
  
  // Simple similarity: share 2+ meaningful words
  const commonWords = words1.filter(word => 
    words2.includes(word) && word.length > 3
  )
  
  return commonWords.length >= 2
}

function calculateRecencyScore(dates: string[]): number {
  const now = new Date()
  const avgDate = new Date(dates.reduce((sum, date) => {
    return sum + new Date(date).getTime()
  }, 0) / dates.length)
  
  const daysOld = (now.getTime() - avgDate.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysOld < 7) return 1.0
  if (daysOld < 14) return 0.7
  return 0.4
}