import axios, { AxiosInstance } from "axios"

/**
 * RocketChat Service
 * Handles automatic user creation and authentication with RocketChat
 */
export class RocketChatService {
  private client: AxiosInstance
  private adminUserId: string | null = null
  private adminToken: string | null = null
  private baseUrl: string
  private adminUsername: string
  private adminPassword: string

  constructor() {
    const url = process.env.ROCKETCHAT_URL
    const username = process.env.ROCKETCHAT_ADMIN_USERNAME
    const password = process.env.ROCKETCHAT_ADMIN_PASSWORD

    if (!url) {
      throw new Error("ROCKETCHAT_URL environment variable is not set")
    }

    if (!username || !password) {
      throw new Error("ROCKETCHAT_ADMIN_USERNAME and ROCKETCHAT_ADMIN_PASSWORD must be set")
    }

    this.baseUrl = url.replace(/\/$/, "") // Remove trailing slash
    this.adminUsername = username
    this.adminPassword = password

    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  /**
   * Authenticate as admin user
   */
  private async authenticateAdmin(): Promise<void> {
    if (this.adminToken && this.adminUserId) {
      return // Already authenticated
    }

    try {
      const response = await this.client.post("/login", {
        user: this.adminUsername,
        password: this.adminPassword,
      })

      this.adminToken = response.data.data.authToken
      this.adminUserId = response.data.data.userId

      console.log("[RocketChat] Admin authenticated successfully")
    } catch (error: any) {
      console.error("[RocketChat] Admin authentication failed:", error.response?.data || error.message)
      throw new Error("Failed to authenticate with RocketChat")
    }
  }

  /**
   * Get authenticated headers for API requests
   */
  private getAuthHeaders() {
    if (!this.adminToken || !this.adminUserId) {
      throw new Error("Not authenticated")
    }

    return {
      "X-Auth-Token": this.adminToken,
      "X-User-Id": this.adminUserId,
    }
  }

  /**
   * Create a new RocketChat user
   * @param name - User's full name
   * @param email - User's email
   * @param username - Desired username (will be sanitized)
   * @param password - User's password
   * @returns The created user's ID and username
   */
  async createUser(
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<{ userId: string; username: string }> {
    await this.authenticateAdmin()

    // Sanitize username: lowercase, replace spaces/special chars with underscores
    const sanitizedUsername = username
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .substring(0, 30) // RocketChat username limit

    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email)
      if (existingUser) {
        console.log(`[RocketChat] User already exists: ${existingUser.username}`)
        return {
          userId: existingUser._id,
          username: existingUser.username,
        }
      }

      // Create new user
      const response = await this.client.post(
        "/users.create",
        {
          name,
          email,
          username: sanitizedUsername,
          password,
          verified: true,
          requirePasswordChange: false,
          sendWelcomeEmail: false,
          roles: ["user"],
        },
        {
          headers: this.getAuthHeaders(),
        }
      )

      const userId = response.data.user._id
      const createdUsername = response.data.user.username

      console.log(`[RocketChat] User created successfully: ${createdUsername} (${userId})`)

      return {
        userId,
        username: createdUsername,
      }
    } catch (error: any) {
      console.error("[RocketChat] User creation failed:", error.response?.data || error.message)
      throw new Error(`Failed to create RocketChat user: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get user by email
   */
  private async getUserByEmail(email: string): Promise<any | null> {
    try {
      const response = await this.client.get("/users.info", {
        params: { email },
        headers: this.getAuthHeaders(),
      })

      return response.data.user || null
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Create a personal access token for a user
   * This allows auto-login without exposing passwords
   */
  async createUserToken(username: string): Promise<string> {
    await this.authenticateAdmin()

    try {
      const response = await this.client.post(
        "/users.createToken",
        { username },
        {
          headers: this.getAuthHeaders(),
        }
      )

      return response.data.data.authToken
    } catch (error: any) {
      console.error("[RocketChat] Token creation failed:", error.response?.data || error.message)
      throw new Error("Failed to create RocketChat login token")
    }
  }

  /**
   * Create a channel for a seller
   */
  async createSellerChannel(sellerId: string, sellerName: string): Promise<string> {
    await this.authenticateAdmin()

    const channelName = `vendor-${sellerId}`.toLowerCase().replace(/[^a-z0-9-_]/g, "-")

    try {
      // Check if channel already exists
      const existing = await this.getChannelInfo(channelName)
      if (existing) {
        console.log(`[RocketChat] Channel already exists: ${channelName}`)
        return channelName
      }

      // Create channel
      await this.client.post(
        "/channels.create",
        {
          name: channelName,
          members: [],
          readOnly: false,
        },
        {
          headers: this.getAuthHeaders(),
        }
      )

      console.log(`[RocketChat] Channel created: ${channelName}`)
      return channelName
    } catch (error: any) {
      console.error("[RocketChat] Channel creation failed:", error.response?.data || error.message)
      // Don't fail if channel creation fails, just log it
      return channelName
    }
  }

  /**
   * Get channel info by name
   */
  private async getChannelInfo(channelName: string): Promise<any | null> {
    try {
      const response = await this.client.get("/channels.info", {
        params: { roomName: channelName },
        headers: this.getAuthHeaders(),
      })

      return response.data.channel || null
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      return null
    }
  }

  /**
   * Add user to a channel
   */
  async addUserToChannel(channelName: string, username: string): Promise<void> {
    await this.authenticateAdmin()

    try {
      await this.client.post(
        "/channels.invite",
        {
          roomName: channelName,
          username,
        },
        {
          headers: this.getAuthHeaders(),
        }
      )

      console.log(`[RocketChat] Added ${username} to ${channelName}`)
    } catch (error: any) {
      console.error("[RocketChat] Failed to add user to channel:", error.response?.data || error.message)
      // Don't fail if adding to channel fails
    }
  }
}

// Singleton instance
let rocketchatService: RocketChatService | null = null

/**
 * Get or create RocketChat service instance
 */
export function getRocketChatService(): RocketChatService | null {
  // Check if RocketChat is configured
  if (!process.env.ROCKETCHAT_URL || !process.env.ROCKETCHAT_ADMIN_USERNAME || !process.env.ROCKETCHAT_ADMIN_PASSWORD) {
    console.log("[RocketChat] Service not configured, skipping")
    return null
  }

  if (!rocketchatService) {
    try {
      rocketchatService = new RocketChatService()
    } catch (error: any) {
      console.error("[RocketChat] Failed to initialize service:", error.message)
      return null
    }
  }

  return rocketchatService
}
