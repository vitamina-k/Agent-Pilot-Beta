// Generated types for Supabase database
// Run: npx supabase gen types typescript --project-id your-project > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios_pro: {
        Row: {
          id: string
          telegram_user_id: number | null
          email: string | null
          bio_entrenamiento: BioEntrenamiento
          creditos_disponibles: number
          plan_actual: PlanType
          estado: EstadoUsuario
          codigo_vinculacion: string | null
          codigo_vinculacion_expira: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_user_id?: number | null
          email?: string | null
          bio_entrenamiento?: BioEntrenamiento
          creditos_disponibles?: number
          plan_actual?: PlanType
          estado?: EstadoUsuario
          codigo_vinculacion?: string | null
          codigo_vinculacion_expira?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_user_id?: number | null
          email?: string | null
          bio_entrenamiento?: BioEntrenamiento
          creditos_disponibles?: number
          plan_actual?: PlanType
          estado?: EstadoUsuario
          codigo_vinculacion?: string | null
          codigo_vinculacion_expira?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credenciales_api: {
        Row: {
          id: string
          usuario_id: string
          proveedor: ProveedorIA
          api_key_encrypted: string
          es_activa: boolean
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          proveedor: ProveedorIA
          api_key_encrypted: string
          es_activa?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          proveedor?: ProveedorIA
          api_key_encrypted?: string
          es_activa?: boolean
          created_at?: string
        }
      }
      transacciones: {
        Row: {
          id: string
          usuario_id: string
          tipo: TipoTransaccion
          creditos: number
          concepto: string
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          tipo: TipoTransaccion
          creditos: number
          concepto: string
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          tipo?: TipoTransaccion
          creditos?: number
          concepto?: string
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
      memoria_usuario: {
        Row: {
          id: string
          usuario_id: string
          tipo: TipoMemoria
          clave: string
          valor: string
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          tipo: TipoMemoria
          clave: string
          valor: string
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          tipo?: TipoMemoria
          clave?: string
          valor?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Custom types
export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise'
export type EstadoUsuario = 'activo' | 'suspendido' | 'pendiente'
export type ProveedorIA = 'openai' | 'anthropic' | 'deepseek' | 'perplexity'
export type TipoTransaccion = 'compra' | 'consumo' | 'bonus' | 'reembolso'
export type TipoMemoria = 'preferencia' | 'correccion' | 'feedback'

export interface BioEntrenamiento {
  descripcion_personal?: string
  tono_preferido?: string
  valores?: string[]
  temas_principales?: string[]
  hashtags_fijos?: string[]
  estilo_escritura?: 'casual' | 'formal' | 'agresivo' | 'neutral'
  audiencia_objetivo?: string
  idioma_principal?: string
  ejemplos_estilo?: string[]
}

// Convenience types
export type Usuario = Database['public']['Tables']['usuarios_pro']['Row']
export type UsuarioInsert = Database['public']['Tables']['usuarios_pro']['Insert']
export type UsuarioUpdate = Database['public']['Tables']['usuarios_pro']['Update']

export type CredencialAPI = Database['public']['Tables']['credenciales_api']['Row']
export type Transaccion = Database['public']['Tables']['transacciones']['Row']
export type MemoriaUsuario = Database['public']['Tables']['memoria_usuario']['Row']
