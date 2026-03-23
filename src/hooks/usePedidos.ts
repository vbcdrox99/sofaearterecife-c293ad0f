import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Pedido {
  id: string;
  numero_pedido: number;
  loja: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  cliente_email?: string;
  descricao_sofa: string;
  observacoes?: string;
  valor_total?: number;
  status: string;
  data_previsao_entrega?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  tipo_sofa?: string;
  tipo_servico?: string;
  cor?: string;
  dimensoes?: string;
  espuma?: string;
  tecido?: string;
  tipo_pe?: string;
  braco?: string;
  forma_pagamento?: string;
  [key: string]: any;
}

export interface NovoPedidoData {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  descricao_sofa: string;
  observacoes?: string;
  valor_total?: number;
  data_previsao_entrega?: string;
}

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedStore } = useAuth();

  const fetchPedidos = async () => {
    try {
      let query = supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedStore && selectedStore !== 'todas') {
        query = query.eq('loja', selectedStore);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [selectedStore]);

  const criarPedido = async (dadosPedido: NovoPedidoData) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data: numData } = await supabase.rpc('get_next_order_number', { p_loja: selectedStore || 'loja_1' });
      
      const { data, error } = await supabase
        .from('pedidos')
        .insert([{
          ...dadosPedido,
          numero_pedido: numData || 1,
          created_by: userId!,
        }])
        .select()
        .single();

      if (error) throw error;

      setPedidos(prev => [data as any, ...prev]);
      
      // Criar etapas de produção para o novo pedido
      const etapas = ['marcenaria', 'corte_costura', 'espuma', 'bancada', 'tecido'];
      const { error: etapasError } = await supabase
        .from('producao_etapas' as any)
        .insert(
          etapas.map(etapa => ({
            pedido_id: data.id,
            etapa,
            concluida: false,
          }))
        );

      if (etapasError) {
        console.error('Erro ao criar etapas de produção:', etapasError);
      }

      toast({
        title: 'Sucesso!',
        description: 'Pedido criado com sucesso',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o pedido',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const atualizarStatusPedido = async (pedidoId: string, novoStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ status: novoStatus as any })
        .eq('id', pedidoId)
        .select()
        .single();

      if (error) throw error;

      setPedidos(prev => 
        prev.map(pedido => 
          pedido.id === pedidoId 
            ? { ...pedido, status: novoStatus }
            : pedido
        )
      );

      toast({
        title: 'Status atualizado',
        description: `Pedido #${data.numero_pedido} atualizado para ${getStatusLabel(novoStatus)}`,
      });

      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const getStatusLabel = (status: Pedido['status']) => {
    const labels = {
      aguardando_producao: 'Aguardando Produção',
      em_producao: 'Em Produção',
      finalizado: 'Finalizado',
      em_entrega: 'Em Entrega',
      entregue: 'Entregue',
    };
    return labels[status];
  };

  const getStatusColor = (status: Pedido['status']) => {
    const colors = {
      aguardando_producao: 'bg-yellow-500',
      em_producao: 'bg-blue-500',
      finalizado: 'bg-green-500',
      em_entrega: 'bg-purple-500',
      entregue: 'bg-gray-500',
    };
    return colors[status];
  };

  const contarPorStatus = () => {
    return pedidos.reduce((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return {
    pedidos,
    loading,
    criarPedido,
    atualizarStatusPedido,
    getStatusLabel,
    getStatusColor,
    contarPorStatus,
    refetch: fetchPedidos,
  };
};