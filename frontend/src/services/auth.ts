import { supabase } from '@/lib/supabase'
import type { AuthResult, User } from '@/types'
import type { Provider } from '@supabase/supabase-js'

export class AuthService {
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        const user = this.transformSupabaseUser(data.user)
        return { user, error: null }
      }

      return { user: null, error: 'Authentication failed' }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }
    }
  }

  static async signUp(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        const user = this.transformSupabaseUser(data.user)
        return { user, error: null }
      }

      return { user: null, error: 'Registration failed' }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Registration failed'
      }
    }
  }

  static async signInWithOAuth(provider: 'google' | 'apple' | 'github'): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      // OAuth redirects, so we don't get user data immediately
      return { user: null, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'OAuth authentication failed'
      }
    }
  }

  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user ? this.transformSupabaseUser(user) : null
  }

  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(error.message)
    }
    return session
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? this.transformSupabaseUser(session.user) : null
      callback(user)
    })
  }

  private static transformSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      profileImageUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
      createdAt: new Date(supabaseUser.created_at)
    }
  }
}