import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://qdyrzxhsecirhnubfdqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeXJ6eGhzZWNpcmhudWJmZHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzMwOTIsImV4cCI6MjA3MjA0OTA5Mn0.UiX85UIuZxoj1_UaE0ia7rgUcK9mlL4mgjn3sqZFiQw';

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export type StatusProducao = 'pendente' | 'iniciado' | 'supervisao' | 'finalizado';

export interface Pedido {
  id?: string;
  numero_pedido: string;
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  cliente_endereco?: string;
  descricao_sofa?: string;
  tipo_sofa?: string;
  cor?: string;
  tecido?: string;
  dimensoes?: string;
  valor_total?: number;
  valor_orcamento?: number;
  valor_pago?: number;
  status: 'pendente' | 'em_producao' | 'concluido' | 'entregue';
  prioridade: 'baixa' | 'media' | 'alta';
  data_previsao_entrega?: string;
  observacoes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemProducao {
  id?: string;
  pedido_id: string;
  pedido_item_id?: string | null;
  etapa: 'marcenaria' | 'corte_costura' | 'espuma' | 'bancada' | 'tecido';
  concluida: boolean;
  status?: StatusProducao;
  data_inicio?: string;
  data_conclusao?: string;
  responsavel_id?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  // Dados do pedido relacionado (quando carregado com join)
  pedidos?: {
    numero_pedido: string | number;
    cliente_nome: string;
    tipo_sofa?: string;
    tipo_servico?: string;
    data_previsao_entrega?: string;
    observacoes?: string;
    cor?: string;
    espuma?: string;
    tecido?: string;
    tipo_pe?: string;
    braco?: string;
    etapas_necessarias?: string[];
    [key: string]: any;
  };
}

// Funções auxiliares para interação com o banco
export const pedidosService = {
  // Buscar todos os pedidos
  async getAll(store?: string) {
    let query = supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (store && store !== 'todas') {
      query = query.eq('loja', store);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  // Criar novo pedido
  async create(pedido: Omit<Pedido, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedido])
      .select()
      .single();
    
    if (error) throw error;
    
    // Criar itens de produção para todas as etapas
    const etapas: ItemProducao['etapa'][] = ['marcenaria', 'corte_costura', 'espuma', 'bancada', 'tecido'];
    const itensProducao = etapas.map(etapa => ({
      pedido_id: data.id,
      etapa,
      concluida: false
    }));
    
    const { error: errorItens } = await supabase
      .from('itens_producao')
      .insert(itensProducao);
    
    if (errorItens) {
      console.error('Erro ao criar itens de produção:', errorItens);
      // Não falha o pedido se houver erro nos itens de produção
    }
    
    return data;
  },

  // Atualizar pedido
  async update(id: string, updates: Partial<Pedido>) {
    const { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar pedido
  async delete(id: string) {
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const producaoService = {
  // Buscar itens de produção por pedido
  async getByPedido(pedidoId: string): Promise<ItemProducao[]> {
    const { data, error } = await supabase
      .from('itens_producao')
      .select(`
        *,
        pedidos (
          numero_pedido,
          cliente_nome,
          tipo_sofa,
          tipo_servico,
          data_previsao_entrega
        )
      `)
      .eq('pedido_id', pedidoId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Buscar todos os itens de produção
  async getAll(store?: string): Promise<ItemProducao[]> {
    let query = supabase
      .from('itens_producao')
      .select(`
        *,
        pedidos!inner (
          numero_pedido,
          cliente_nome,
          tipo_sofa,
          tipo_servico,
          data_previsao_entrega,
          loja
        )
      `)
      .order('created_at', { ascending: false });

    if (store && store !== 'todas') {
      query = query.eq('pedidos.loja', store);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Buscar itens por etapa
  async getByEtapa(etapa: ItemProducao['etapa'], store?: string): Promise<ItemProducao[]> {
    let query = supabase
      .from('itens_producao')
      .select(`
        *,
        pedidos!inner (
          numero_pedido,
          cliente_nome,
          tipo_sofa,
          tipo_servico,
          data_previsao_entrega,
          observacoes,
          cor,
          espuma,
          tecido,
          tipo_pe,
          braco,
          loja
        )
      `)
      .eq('etapa', etapa)
      .order('created_at', { ascending: false });

    if (store && store !== 'todas') {
      query = query.eq('pedidos.loja', store);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  },

  // Criar novo item de produção
  async create(item: Omit<ItemProducao, 'id' | 'created_at' | 'updated_at'>): Promise<ItemProducao> {
    const { data, error } = await supabase
      .from('itens_producao')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Criar etapas específicas para um pedido
  async criarEtapasPedido(pedidoId: string, etapasNecessarias?: string[]): Promise<ItemProducao[]> {
    // Se não especificado, criar todas as etapas (comportamento padrão)
    const etapasParaCriar = etapasNecessarias && etapasNecessarias.length > 0 
      ? etapasNecessarias as ItemProducao['etapa'][]
      : ['marcenaria', 'corte_costura', 'espuma', 'bancada', 'tecido'];
    
    const itens = etapasParaCriar.map(etapa => ({
      pedido_id: pedidoId,
      etapa,
      concluida: false
    }));

    const { data, error } = await supabase
      .from('itens_producao')
      .insert(itens)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Atualizar item de produção
  async update(id: string, updates: Partial<ItemProducao>): Promise<ItemProducao> {
    const { data, error } = await supabase
      .from('itens_producao')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marcar etapa como concluída
  async marcarConcluida(id: string): Promise<ItemProducao> {
    const { data, error } = await supabase
      .from('itens_producao')
      .update({ 
        concluida: true,
        data_conclusao: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marcar etapa como não concluída
  async marcarPendente(id: string): Promise<ItemProducao> {
    const { data, error } = await supabase
      .from('itens_producao')
      .update({ 
        concluida: false,
        data_conclusao: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar status do item de produção
  async updateStatus(id: string, status: StatusProducao): Promise<ItemProducao> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Atualizar campos relacionados baseado no status
    if (status === 'iniciado') {
      // Sempre definir data_inicio quando status for 'iniciado', mas só se não existir ainda
      const { data: currentItem } = await supabase
        .from('itens_producao')
        .select('data_inicio')
        .eq('id', id)
        .single();
      
      if (!currentItem?.data_inicio) {
        updates.data_inicio = new Date().toISOString();
      }
    }
    
    if (status === 'finalizado') {
      updates.concluida = true;
      updates.data_conclusao = new Date().toISOString();
    } else {
      updates.concluida = false;
      if (status === 'pendente') {
        updates.data_conclusao = null;
      }
    }

    const { data, error } = await supabase
      .from('itens_producao')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar item de produção
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('itens_producao')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};