interface ProductHuntProduct {
  id: string
  name: string
  tagline: string
  description: string
  votesCount: number
  url: string
  createdAt: string
  comments: {
    edges: Array<{
      node: {
        id: string
        body: string
        user: { name: string }
        votesCount: number
        createdAt: string
      }
    }>
  }
}

interface ProductHuntResponse {
  data: {
    posts: {
      edges: Array<{
        node: ProductHuntProduct
      }>
    }
  }
}

export class ProductHuntAPI {
  private apiKey: string
  private baseUrl = 'https://api.producthunt.com/v2/api/graphql'

  constructor() {
    this.apiKey = process.env.PRODUCT_HUNT_API_KEY!
  }

  async fetchRecentLaunches(daysBack = 1): Promise<ProductHuntProduct[]> {
    const query = `
      query GetRecentPosts($postedAfter: DateTime!) {
        posts(postedAfter: $postedAfter, first: 50) {
          edges {
            node {
              id
              name
              tagline
              description
              votesCount
              url
              createdAt
              comments(first: 100) {
                edges {
                  node {
                    id
                    body
                    user {
                      name
                    }
                    votesCount
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    `

    const postedAfter = new Date()
    postedAfter.setDate(postedAfter.getDate() - daysBack)

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { postedAfter: postedAfter.toISOString() }
        })
      })

      if (!response.ok) {
        throw new Error(`Product Hunt API error: ${response.status}`)
      }

      const data: ProductHuntResponse = await response.json()
      return data.data.posts.edges.map(edge => edge.node)
    } catch (error) {
      console.error('Error fetching Product Hunt data:', error)
      throw error
    }
  }
}