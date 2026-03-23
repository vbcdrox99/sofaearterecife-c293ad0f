export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          created_at: string | null
          id: number
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco_completo: string | null
          estado: string | null
          id: string
          nome: string
          telefone: string
          telefone2: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco_completo?: string | null
          estado?: string | null
          id?: string
          nome: string
          telefone: string
          telefone2?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco_completo?: string | null
          estado?: string | null
          id?: string
          nome?: string
          telefone?: string
          telefone2?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      itens_producao: {
        Row: {
          concluida: boolean | null
          created_at: string | null
          data_conclusao: string | null
          data_inicio: string | null
          etapa: string
          id: string
          observacoes: string | null
          pedido_id: string
          pedido_item_id: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_producao"]
          status_etapa: string | null
          supervisao_ativa: boolean | null
          updated_at: string | null
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa: string
          id?: string
          observacoes?: string | null
          pedido_id: string
          pedido_item_id?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_producao"]
          status_etapa?: string | null
          supervisao_ativa?: boolean | null
          updated_at?: string | null
        }
        Update: {
          concluida?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa?: string
          id?: string
          observacoes?: string | null
          pedido_id?: string
          pedido_item_id?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_producao"]
          status_etapa?: string | null
          supervisao_ativa?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_producao_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_producao_pedido_item_id_fkey"
            columns: ["pedido_item_id"]
            isOneToOne: false
            referencedRelation: "pedido_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preco_unitario: number | null
          quantidade_atual: number
          quantidade_minima: number
          unidade_medida: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preco_unitario?: number | null
          quantidade_atual?: number
          quantidade_minima?: number
          unidade_medida?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preco_unitario?: number | null
          quantidade_atual?: number
          quantidade_minima?: number
          unidade_medida?: string
          updated_at?: string
        }
        Relationships: []
      }
      pedido_anexos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome_arquivo: string
          pedido_id: string
          pedido_item_id: string | null
          tamanho_arquivo: number | null
          tipo_arquivo: string
          uploaded_by: string
          url_arquivo: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome_arquivo: string
          pedido_id: string
          pedido_item_id?: string | null
          tamanho_arquivo?: number | null
          tipo_arquivo: string
          uploaded_by: string
          url_arquivo: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome_arquivo?: string
          pedido_id?: string
          pedido_item_id?: string | null
          tamanho_arquivo?: number | null
          tipo_arquivo?: string
          uploaded_by?: string
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_anexos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_anexos_pedido_item_id_fkey"
            columns: ["pedido_item_id"]
            isOneToOne: false
            referencedRelation: "pedido_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          braco: string
          cor: string
          created_at: string
          created_by: string | null
          data_visita_tecnica: string | null
          desconto_tipo: string | null
          desconto_valor: number | null
          descricao: string | null
          dimensoes: string | null
          espuma: string
          id: string
          observacoes: string | null
          pedido_id: string
          preco_unitario: number | null
          sequencia: number
          tecido: string
          tipo_pe: string
          tipo_servico: string
          tipo_sofa: string
          visita_tecnica: boolean | null
        }
        Insert: {
          braco: string
          cor: string
          created_at?: string
          created_by?: string | null
          data_visita_tecnica?: string | null
          desconto_tipo?: string | null
          desconto_valor?: number | null
          descricao?: string | null
          dimensoes?: string | null
          espuma: string
          id?: string
          observacoes?: string | null
          pedido_id: string
          preco_unitario?: number | null
          sequencia?: number
          tecido: string
          tipo_pe: string
          tipo_servico: string
          tipo_sofa: string
          visita_tecnica?: boolean | null
        }
        Update: {
          braco?: string
          cor?: string
          created_at?: string
          created_by?: string | null
          data_visita_tecnica?: string | null
          desconto_tipo?: string | null
          desconto_valor?: number | null
          descricao?: string | null
          dimensoes?: string | null
          espuma?: string
          id?: string
          observacoes?: string | null
          pedido_id?: string
          preco_unitario?: number | null
          sequencia?: number
          tecido?: string
          tipo_pe?: string
          tipo_servico?: string
          tipo_sofa?: string
          visita_tecnica?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_materiais: {
        Row: {
          created_at: string
          id: string
          material_id: string
          pedido_id: string
          quantidade_necessaria: number
          quantidade_reservada: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          pedido_id: string
          quantidade_necessaria: number
          quantidade_reservada?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          pedido_id?: string
          quantidade_necessaria?: number
          quantidade_reservada?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_materiais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_materiais_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          braco: string | null
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_id: string | null
          cliente_nome: string
          cliente_telefone: string
          condicao_pagamento: string | null
          cor: string | null
          created_at: string
          created_by: string
          data_previsao_entrega: string | null
          desconto_tipo: string | null
          desconto_valor: number | null
          descricao_sofa: string
          dimensoes: string | null
          espuma: string | null
          etapas_necessarias: string[] | null
          forma_pagamento: string | null
          frete: number | null
          garantia_texto: string | null
          garantia_tipo: string | null
          garantia_valor: number | null
          id: string
          loja: Database["public"]["Enums"]["app_store"]
          meios_pagamento: string[] | null
          numero_pedido: number
          observacoes: string | null
          preco_unitario: number | null
          prioridade: string | null
          status: Database["public"]["Enums"]["status_pedido"]
          tecido: string | null
          termo_entrega_ativo: boolean | null
          termo_entrega_texto: string | null
          tipo_pe: string | null
          tipo_servico: string | null
          tipo_sofa: string | null
          updated_at: string
          valor_orcamento: number | null
          valor_pago: number | null
          valor_total: number | null
          vendedor_id: string | null
        }
        Insert: {
          braco?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: string | null
          cliente_nome: string
          cliente_telefone: string
          condicao_pagamento?: string | null
          cor?: string | null
          created_at?: string
          created_by: string
          data_previsao_entrega?: string | null
          desconto_tipo?: string | null
          desconto_valor?: number | null
          descricao_sofa: string
          dimensoes?: string | null
          espuma?: string | null
          etapas_necessarias?: string[] | null
          forma_pagamento?: string | null
          frete?: number | null
          garantia_texto?: string | null
          garantia_tipo?: string | null
          garantia_valor?: number | null
          id?: string
          loja?: Database["public"]["Enums"]["app_store"]
          meios_pagamento?: string[] | null
          numero_pedido: number
          observacoes?: string | null
          preco_unitario?: number | null
          prioridade?: string | null
          status?: Database["public"]["Enums"]["status_pedido"]
          tecido?: string | null
          termo_entrega_ativo?: boolean | null
          termo_entrega_texto?: string | null
          tipo_pe?: string | null
          tipo_servico?: string | null
          tipo_sofa?: string | null
          updated_at?: string
          valor_orcamento?: number | null
          valor_pago?: number | null
          valor_total?: number | null
          vendedor_id?: string | null
        }
        Update: {
          braco?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: string | null
          cliente_nome?: string
          cliente_telefone?: string
          condicao_pagamento?: string | null
          cor?: string | null
          created_at?: string
          created_by?: string
          data_previsao_entrega?: string | null
          desconto_tipo?: string | null
          desconto_valor?: number | null
          descricao_sofa?: string
          dimensoes?: string | null
          espuma?: string | null
          etapas_necessarias?: string[] | null
          forma_pagamento?: string | null
          frete?: number | null
          garantia_texto?: string | null
          garantia_tipo?: string | null
          garantia_valor?: number | null
          id?: string
          loja?: Database["public"]["Enums"]["app_store"]
          meios_pagamento?: string[] | null
          numero_pedido?: number
          observacoes?: string | null
          preco_unitario?: number | null
          prioridade?: string | null
          status?: Database["public"]["Enums"]["status_pedido"]
          tecido?: string | null
          termo_entrega_ativo?: boolean | null
          termo_entrega_texto?: string | null
          tipo_pe?: string | null
          tipo_servico?: string | null
          tipo_sofa?: string | null
          updated_at?: string
          valor_orcamento?: number | null
          valor_pago?: number | null
          valor_total?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      producao_etapas: {
        Row: {
          concluida: boolean
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          etapa: Database["public"]["Enums"]["etapa_producao"]
          id: string
          observacoes: string | null
          pedido_id: string
          responsavel_id: string | null
          updated_at: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa: Database["public"]["Enums"]["etapa_producao"]
          id?: string
          observacoes?: string | null
          pedido_id: string
          responsavel_id?: string | null
          updated_at?: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa?: Database["public"]["Enums"]["etapa_producao"]
          id?: string
          observacoes?: string | null
          pedido_id?: string
          responsavel_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "producao_etapas_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome_completo: string
          role: Database["public"]["Enums"]["app_role"]
          sector: Database["public"]["Enums"]["app_sector"]
          store: Database["public"]["Enums"]["app_store"]
          tipo: Database["public"]["Enums"]["tipo_usuario"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome_completo: string
          role?: Database["public"]["Enums"]["app_role"]
          sector?: Database["public"]["Enums"]["app_sector"]
          store?: Database["public"]["Enums"]["app_store"]
          tipo?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome_completo?: string
          role?: Database["public"]["Enums"]["app_role"]
          sector?: Database["public"]["Enums"]["app_sector"]
          store?: Database["public"]["Enums"]["app_store"]
          tipo?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendedores: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_order_number: { Args: { p_loja: string }; Returns: number }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "gerente" | "funcionario"
      app_sector:
        | "geral"
        | "marcenaria"
        | "corte_costura"
        | "espuma"
        | "bancada"
        | "tecido"
      app_store: "loja_1" | "loja_2" | "todas"
      etapa_producao:
        | "marcenaria"
        | "corte_costura"
        | "espuma"
        | "bancada"
        | "tecido"
      status_pedido: "pendente" | "em_producao" | "concluido" | "entregue"
      status_producao: "pendente" | "iniciado" | "supervisao" | "finalizado"
      tipo_usuario: "admin" | "funcionario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gerente", "funcionario"],
      app_sector: [
        "geral",
        "marcenaria",
        "corte_costura",
        "espuma",
        "bancada",
        "tecido",
      ],
      app_store: ["loja_1", "loja_2", "todas"],
      etapa_producao: [
        "marcenaria",
        "corte_costura",
        "espuma",
        "bancada",
        "tecido",
      ],
      status_pedido: ["pendente", "em_producao", "concluido", "entregue"],
      status_producao: ["pendente", "iniciado", "supervisao", "finalizado"],
      tipo_usuario: ["admin", "funcionario"],
    },
  },
} as const
