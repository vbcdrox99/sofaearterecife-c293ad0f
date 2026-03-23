import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Phone, MapPin, Package, Calendar, DollarSign, Mail, AlertCircle, Plus, X, Trash2, Camera, Store } from 'lucide-react';
import ImageUpload, { UploadedImage } from '@/components/ImageUpload';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProdutoCampos from '@/components/dashboard/ProdutoCampos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClienteSelector, Cliente } from '@/components/dashboard/ClienteSelector';
import { VendedorSelector, Vendedor } from '@/components/dashboard/VendedorSelector';
import DiscountInput from '@/components/dashboard/DiscountInput';

interface FormData {
  clienteId: string;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  clienteEndereco: string;
  clienteCep: string;
  clienteBairro: string;
  clienteCidade: string;
  clienteEstado: string;
  numeroPedido: string;
  dataEntrega: string;
  descricao: string;
  tipoSofa: string;
  cor: string;
  dimensoes: string;
  dimensaoLargura: string;
  dimensaoComprimento: string;
  tipoServico: string;
  observacoes: string;
  espuma: string;
  tecido: string;
  braco: string;
  tipoPe: string;
  frete: string;
  precoUnitario: string;
  descontoTipo: 'percentage' | 'fixed';
  descontoValor: string;
  valorTotal: string;
  valorPago: string;
  formaPagamento: string;
  prioridade: string;
  garantiaTipo: string;
  garantiaValor: string;
  garantiaTexto: string;
  termoEntregaAtivo: boolean;
  termoEntregaTexto: string;
  etapasNecessarias: string[];
  fotosPedido: UploadedImage[];
  fotosControle: UploadedImage[];
  visitaTecnicaAtiva: boolean;
  visitaTecnicaData: string;
  pedidoDescontoTipo: 'percentage' | 'fixed';
  pedidoDescontoValor: string;
  vendedorId?: string;
}

const NovoPedido = () => {
  const { id: pedidoIdParam } = useParams();
  const isEditMode = !!pedidoIdParam;
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, selectedStore } = useAuth();
  const [lojaSelecionadaForm, setLojaSelecionadaForm] = useState<string>('');

  useEffect(() => {
    if (selectedStore && selectedStore !== 'todas') {
      setLojaSelecionadaForm(selectedStore);
    } else {
      setLojaSelecionadaForm('loja_1');
    }
  }, [selectedStore]);

  const [isLoading, setIsLoading] = useState(false);
  const [coresDisponiveis, setCoresDisponiveis] = useState<string[]>([
    'Preto', 'Branco', 'Cinza', 'Marrom', 'Bege', 'Azul', 'Verde', 'Vermelho', 'Rosa', 'Amarelo'
  ]);
  const [novaCor, setNovaCor] = useState('');
  const [modalNovaCorAberto, setModalNovaCorAberto] = useState(false);
  const [corParaExcluir, setCorParaExcluir] = useState<string | null>(null);

  // Estados para Tipo de Sofá
  const [tiposSofaDisponiveis, setTiposSofaDisponiveis] = useState<string[]>([
    '2 Lugares', '3 Lugares', 'Chaise', 'Canto', 'Reclinável'
  ]);
  const [novoTipoSofa, setNovoTipoSofa] = useState('');
  const [modalNovoTipoSofaAberto, setModalNovoTipoSofaAberto] = useState(false);
  const [tipoSofaParaExcluir, setTipoSofaParaExcluir] = useState<string | null>(null);

  // Estados para Espuma
  const [espumasDisponiveis, setEspumasDisponiveis] = useState<string[]>([
    'D33', 'D30', 'Reforço', 'Troca'
  ]);
  const [novaEspuma, setNovaEspuma] = useState('');
  const [modalNovaEspumaAberto, setModalNovaEspumaAberto] = useState(false);
  const [espumaParaExcluir, setEspumaParaExcluir] = useState<string | null>(null);

  // Estados para Braço
  const [bracosDisponiveis, setBracosDisponiveis] = useState<string[]>([
    'Padrão', 'BR Slim'
  ]);
  const [novoBraco, setNovoBraco] = useState('');
  const [modalNovoBracoAberto, setModalNovoBracoAberto] = useState(false);
  const [bracoParaExcluir, setBracoParaExcluir] = useState<string | null>(null);

  // Estados para Tipo de Pé
  const [tiposPeDisponiveis, setTiposPeDisponiveis] = useState<string[]>([
    'Padrão', 'Metalon', 'Pé Gaspar'
  ]);
  const [novoTipoPe, setNovoTipoPe] = useState('');
  const [modalNovoTipoPeAberto, setModalNovoTipoPeAberto] = useState(false);
  const [tipoPeParaExcluir, setTipoPeParaExcluir] = useState<string | null>(null);

  // Estados para Tipo de Serviço
  const [tiposServicoDisponiveis, setTiposServicoDisponiveis] = useState<string[]>([
    'REFORMA', 'FABRICAÇÃO', 'MÓVEIS PLANEJADOS'
  ]);
  const [novoTipoServico, setNovoTipoServico] = useState('');
  const [modalNovoTipoServicoAberto, setModalNovoTipoServicoAberto] = useState(false);
  const [tipoServicoParaExcluir, setTipoServicoParaExcluir] = useState<string | null>(null);

  // Estado para cliente selecionado
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  // Estado para vendedor selecionado
  const [vendedorSelecionado, setVendedorSelecionado] = useState<Vendedor | null>(null);

  // Estados para etapas necessárias
  const etapasDisponiveis = ['marcenaria', 'corte_costura', 'espuma', 'bancada', 'tecido'];
  const [etapasSelecionadas, setEtapasSelecionadas] = useState<string[]>([]);
  // Estado do wizard de etapas (1: Cliente, 2: Produto, 3: Detalhes)
  const [wizardStep, setWizardStep] = useState(1);

  const toggleEtapa = (etapa: string) => {
    setEtapasSelecionadas(prev => {
      if (prev.includes(etapa)) {
        return prev.filter(e => e !== etapa);
      } else {
        return [...prev, etapa];
      }
    });
  };

  // Avançar no wizard (fase 1 - sem validações bloqueantes)
  const handleAvancarWizard = () => {
    setWizardStep((prev) => Math.min(3, prev + 1));
  };
  const [formData, setFormData] = useState<FormData>({
    clienteId: '',
    clienteNome: '',
    clienteEmail: '',
    clienteTelefone: '',
    clienteEndereco: '',
    clienteCep: '',
    clienteBairro: '',
    clienteCidade: '',
    clienteEstado: '',
    numeroPedido: '',
    dataEntrega: '',
    descricao: '',
    tipoSofa: '',
    cor: '',
    dimensoes: '',
    dimensaoLargura: '',
    dimensaoComprimento: '',
    tipoServico: '',
    observacoes: '',
    espuma: '',
    tecido: '',
    braco: '',
    tipoPe: '',
    frete: '',
    precoUnitario: '',
    descontoTipo: 'percentage',
    descontoValor: '',
    valorTotal: '',
    valorPago: '',
    formaPagamento: '',
    prioridade: 'media',
    garantiaTipo: 'dias',
    garantiaValor: '',
    garantiaTexto: '',
    termoEntregaAtivo: false,
    termoEntregaTexto: '',
    etapasNecessarias: [],
    fotosPedido: [],
    fotosControle: [],
    visitaTecnicaAtiva: false,
    visitaTecnicaData: '',
    pedidoDescontoTipo: 'percentage',
    pedidoDescontoValor: '',
    vendedorId: ''
  });

  // Guardar anexos originais para comparação em edição
  const [anexosOriginaisPedido, setAnexosOriginaisPedido] = useState<UploadedImage[]>([]);
  const [anexosOriginaisControle, setAnexosOriginaisControle] = useState<UploadedImage[]>([]);

  // Itens adicionais do pedido (suporte a múltiplos produtos)
  type PedidoItemForm = {
    descricao: string;
    fotosPedido: UploadedImage[];
    tipoSofa: string;
    cor: string;
    dimensoes: string;
    dimensaoLargura?: string;
    dimensaoComprimento?: string;
    tipoServico: string;
    precoUnitario: string;
    descontoTipo: 'percentage' | 'fixed';
    descontoValor: number;
    observacoes: string;
    espuma: string;
    tecido: string;
    braco: string;
    tipoPe: string;
    etapasNecessarias: string[];
    visitaTecnicaAtiva?: boolean;
    visitaTecnicaData?: string;
  };

  const defaultItem: PedidoItemForm = {
    descricao: '',
    fotosPedido: [],
    tipoSofa: '',
    cor: '',
    dimensoes: '',
    dimensaoLargura: '',
    dimensaoComprimento: '',
    tipoServico: '',
    precoUnitario: '',
    descontoTipo: 'percentage',
    descontoValor: 0,
    observacoes: '',
    espuma: '',
    tecido: '',
    braco: '',
    tipoPe: '',
    etapasNecessarias: [],
    visitaTecnicaAtiva: false,
    visitaTecnicaData: ''
  };

  const [itensAdicionais, setItensAdicionais] = useState<PedidoItemForm[]>([]);

  const addItem = () => {
    setItensAdicionais((prev) => [...prev, { ...defaultItem }]);
  };

  const removeItem = (index: number) => {
    setItensAdicionais((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = <K extends keyof PedidoItemForm>(index: number, key: K, value: PedidoItemForm[K]) => {
    setItensAdicionais((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const handleItemDimensaoChange = (index: number, field: 'dimensaoLargura' | 'dimensaoComprimento', value: string) => {
    const valorFormatado = formatarDimensao(value);
    setItensAdicionais(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const largura = field === 'dimensaoLargura' ? valorFormatado : (item.dimensaoLargura || '');
      const comprimento = field === 'dimensaoComprimento' ? valorFormatado : (item.dimensaoComprimento || '');
      return {
        ...item,
        [field]: valorFormatado,
        dimensoes: `${largura} x ${comprimento}`.trim()
      };
    }));
  };

  const handleItemFotosChange = (index: number, images: UploadedImage[]) => {
    setItensAdicionais((prev) => prev.map((item, i) => (i === index ? { ...item, fotosPedido: images } : item)));
  };

  const toggleEtapaItem = (index: number, etapa: string) => {
    setItensAdicionais(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const selecionadas = item.etapasNecessarias || [];
      const novas = selecionadas.includes(etapa)
        ? selecionadas.filter(e => e !== etapa)
        : [...selecionadas, etapa];
      return { ...item, etapasNecessarias: novas };
    }));
  };

  // Texto padrão do Termo de entrega e recebimento
  const TERMO_ENTREGA_PADRAO = `Recebi o produto em perfeito estado, sem defeito ou avaria.

Nome:_______________________________________________CPF_________________________ DATA: _____._____._______

O serviço de FRETE E MONTAGEM é realizado por empresa terceirizada, indicada pela loja, caso o cliente opte por retirar por meios próprios, fica a empresa isenta de responsabilidade sobre possíveis danos ao produto.

O cliente deve informar durante o atendimento às condições do local de entrega do produto.
Ex: Quantos andares de escada, tamanho de elevador, porta e corredores…

Caso o produto precise ser entregue por escadas, será cobrado além da taxa de montagem (caso haja necessidade), 10,00 por andar.

Você deve recusar a entrega e descrever o motivo no verso do pedido nos seguintes casos:

* produto quebrado, amassado, riscado ou danificado;
* produto completamente diferente do que você comprou;
  * faltam peças ou acessórios.

  Após assinatura de recebimento de mercadoria em perfeito estado, não serão aceitas quaisquer devoluções ou reposições posteriores.`;

  // Cálculo do valor total do pedido somando os preços dos produtos (etapa 2/3)
  const parseValor = (v: string) => {
    if (!v) return 0;
    const n = parseFloat(v.replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const calculateFinalPrice = (price: number, type: 'percentage' | 'fixed', value: number) => {
    if (!price) return 0;
    if (type === 'percentage') {
      return price * (1 - value / 100);
    } else {
      return Math.max(0, price - value);
    }
  };

  const totalProdutos = useMemo(() => {
    const principalPreco = parseValor(formData.precoUnitario);
    const principalDescontoValor = parseFloat(formData.descontoValor) || 0;
    const principalFinal = calculateFinalPrice(principalPreco, formData.descontoTipo, principalDescontoValor);

    const adicionais = itensAdicionais.reduce((acc, it) => {
      const preco = parseValor(it.precoUnitario || '');
      const descontoValor = it.descontoValor || 0;
      const final = calculateFinalPrice(preco, it.descontoTipo, descontoValor);
      return acc + final;
    }, 0);

    return principalFinal + adicionais;
  }, [formData.precoUnitario, formData.descontoTipo, formData.descontoValor, itensAdicionais]);

  const totalComFrete = useMemo(() => {
    const frete = parseValor(formData.frete || '');
    return totalProdutos + frete;
  }, [totalProdutos, formData.frete]);

  const totalFinalPedido = useMemo(() => {
    const descontoPedidoValor = parseFloat(formData.pedidoDescontoValor) || 0;
    return calculateFinalPrice(totalComFrete, formData.pedidoDescontoTipo, descontoPedidoValor);
  }, [totalComFrete, formData.pedidoDescontoTipo, formData.pedidoDescontoValor]);

  const converterDataISOParaBR = (dataISO?: string) => {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    if (!ano || !mes || !dia) return '';
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  };

  useEffect(() => {
    const carregarPedido = async () => {
      if (!isEditMode || !pedidoIdParam) return;
      try {
        const { data: pedido, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('id', pedidoIdParam)
          .single();
        if (error) throw error;

        setClienteSelecionado({
          id: pedido.cliente_id || '',
          nome: pedido.cliente_nome || '',
          email: pedido.cliente_email || '',
          telefone: pedido.cliente_telefone || ''
        });

        if (pedido.etapas_necessarias && Array.isArray(pedido.etapas_necessarias)) {
          setEtapasSelecionadas(pedido.etapas_necessarias);
        }

        // Parse robusto de dimensões salvas, aceitando 'x', 'X', '×', espaços e ponto/vírgula
        const dimensoesStr: string = pedido.dimensoes || '';
        const matches = dimensoesStr.match(/\d+[.,]?\d*/g) || [];
        const largura = matches[0] ? matches[0].replace('.', ',') : '';
        const comprimento = matches[1] ? matches[1].replace('.', ',') : '';
        const dimensoesNormalizadas = largura && comprimento
          ? `${largura} x ${comprimento}`
          : pedido.dimensoes || '';

        setFormData(prev => ({
          ...prev,
          clienteId: pedido.cliente_id || '',
          clienteNome: pedido.cliente_nome || '',
          clienteEmail: pedido.cliente_email || '',
          clienteTelefone: pedido.cliente_telefone || '',
          clienteEndereco: pedido.cliente_endereco || '',
          numeroPedido: pedido.numero_pedido ? String(pedido.numero_pedido) : '',
          dataEntrega: converterDataISOParaBR(pedido.data_previsao_entrega),
          descricao: pedido.descricao_sofa || '',
          tipoSofa: pedido.tipo_sofa || '',
          cor: pedido.cor || '',
          dimensoes: dimensoesNormalizadas,
          dimensaoLargura: largura,
          dimensaoComprimento: comprimento,
          tipoServico: pedido.tipo_servico || '',
          observacoes: pedido.observacoes || '',
          espuma: pedido.espuma || '',
          tecido: pedido.tecido || '',
          braco: pedido.braco || '',
          tipoPe: pedido.tipo_pe || '',
          frete: pedido.frete ? String(pedido.frete) : '',
          precoUnitario: pedido.preco_unitario ? String(pedido.preco_unitario) : '',
          valorTotal: pedido.valor_total ? String(pedido.valor_total) : '',
          valorPago: pedido.valor_pago ? String(pedido.valor_pago) : '',
          condicaoPagamento: pedido.condicao_pagamento || '',
          meioPagamento: Array.isArray(pedido.meios_pagamento) ? (pedido.meios_pagamento[0] || '') : '',
          prioridade: pedido.prioridade || 'media',
          garantiaTipo: pedido.garantia_tipo || 'dias',
          garantiaValor: pedido.garantia_valor != null ? String(pedido.garantia_valor) : '',
          garantiaTexto: pedido.garantia_texto || '',
          termoEntregaAtivo: !!pedido.termo_entrega_ativo,
          termoEntregaTexto: pedido.termo_entrega_texto || '',
          etapasNecessarias: pedido.etapas_necessarias || [],
          fotosPedido: [],
          fotosControle: []
        }));

        // Garantir que os selects exibam o valor salvo mesmo que não esteja nas listas
        if (pedido.tipo_sofa) {
          setTiposSofaDisponiveis(prev => prev.includes(pedido.tipo_sofa) ? prev : [...prev, pedido.tipo_sofa]);
        }
        if (pedido.cor) {
          setCoresDisponiveis(prev => prev.includes(pedido.cor) ? prev : [...prev, pedido.cor]);
        }
        if (pedido.espuma) {
          setEspumasDisponiveis(prev => prev.includes(pedido.espuma) ? prev : [...prev, pedido.espuma]);
        }
        if (pedido.braco) {
          setBracosDisponiveis(prev => prev.includes(pedido.braco) ? prev : [...prev, pedido.braco]);
        }
        if (pedido.tipo_pe) {
          setTiposPeDisponiveis(prev => prev.includes(pedido.tipo_pe) ? prev : [...prev, pedido.tipo_pe]);
        }
        if (pedido.tipo_servico) {
          setTiposServicoDisponiveis(prev => prev.includes(pedido.tipo_servico) ? prev : [...prev, pedido.tipo_servico]);
        }

        // Carregar itens do pedido (produtos) e popular itens adicionais (exclui o primeiro)
        try {
          const { data: itensDb, error: itensErr } = await supabase
            .from('pedido_itens')
            .select('*')
            .eq('pedido_id', pedidoIdParam)
            .order('created_at', { ascending: true });

          if (!itensErr && Array.isArray(itensDb)) {
            // Preencher campos do Produto 1 relacionados à visita técnica, se existirem
            if (itensDb.length >= 1) {
              const primeiro = itensDb[0];
              setFormData(prev => ({
                ...prev,
                visitaTecnicaAtiva: !!primeiro.visita_tecnica,
                visitaTecnicaData: converterDataISOParaBR(primeiro.data_visita_tecnica)
              }));
            }
            if (itensDb.length > 1) {
              const adicionais = itensDb.slice(1).map((it: any) => ({
                descricao: it.descricao || '',
                tipoSofa: it.tipo_sofa || '',
                cor: it.cor || '',
                dimensoes: it.dimensoes || '',
                dimensaoLargura: (() => {
                  const d = (it.dimensoes || '').replace('×', 'x');
                  const parts = d.split('x').map((p: string) => p.trim());
                  return parts[0] || '';
                })(),
                dimensaoComprimento: (() => {
                  const d = (it.dimensoes || '').replace('×', 'x');
                  const parts = d.split('x').map((p: string) => p.trim());
                  return parts[1] || '';
                })(),
                tipoServico: it.tipo_servico || '',
                observacoes: it.observacoes || '',
                espuma: it.espuma || '',
                tecido: it.tecido || '',
                braco: it.braco || '',
                tipoPe: it.tipo_pe || '',
                precoUnitario: it.preco_unitario != null ? String(it.preco_unitario) : '',
                descontoTipo: 'percentage' as const,
                descontoValor: 0,
                fotosPedido: [],
                etapasNecessarias: []
              }));
              setItensAdicionais(adicionais);
            } else {
              setItensAdicionais([]);
            }
          }
        } catch (e) {
          console.error('Erro ao carregar itens do pedido:', e);
        }

        // Carregar dados completos do cliente (endereço detalhado) se existir cliente_id
        if (pedido.cliente_id) {
          const { data: clienteData, error: clienteError } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', pedido.cliente_id)
            .single();

          if (!clienteError && clienteData) {
            // Atualizar seleção de cliente com dados completos
            setClienteSelecionado({
              id: clienteData.id,
              nome: clienteData.nome,
              email: clienteData.email || '',
              telefone: clienteData.telefone || '',
              endereco_completo: clienteData.endereco_completo || '',
              cep: clienteData.cep || '',
              bairro: clienteData.bairro || '',
              cidade: clienteData.cidade || '',
              estado: clienteData.estado || '',
            });

            // Preencher campos de endereço detalhado no formulário
            setFormData(prev => ({
              ...prev,
              clienteEndereco: clienteData.endereco_completo || prev.clienteEndereco || '',
              clienteCep: clienteData.cep || prev.clienteCep || '',
              clienteBairro: clienteData.bairro || prev.clienteBairro || '',
              clienteCidade: clienteData.cidade || prev.clienteCidade || '',
              clienteEstado: clienteData.estado || prev.clienteEstado || '',
            }));
          }
        }

        // Carregar dados do vendedor se existir
        if (pedido.vendedor_id) {
          const { data: vendedorData, error: vendedorError } = await supabase
            .from('vendedores')
            .select('*')
            .eq('id', pedido.vendedor_id)
            .single();

          if (!vendedorError && vendedorData) {
            setVendedorSelecionado({
              id: vendedorData.id,
              nome: vendedorData.nome
            });
            setFormData(prev => ({ ...prev, vendedorId: vendedorData.id }));
          }
        }

        // Buscar anexos existentes para pré-carregar no formulário
        const { data: anexosData, error: anexosError } = await supabase
          .from('pedido_anexos')
          .select('*')
          .eq('pedido_id', pedidoIdParam)
          .order('created_at', { ascending: true });

        if (anexosError) {
          console.error('Erro ao carregar anexos do pedido:', anexosError);
        } else {
          const fotosPedidoExistentes: UploadedImage[] = (anexosData || [])
            .filter(a => a.descricao === 'foto_pedido')
            .map(a => ({
              id: a.id,
              file: new File([new Blob()], a.nome_arquivo, { type: a.tipo_arquivo || 'image/jpeg' }),
              preview: a.url_arquivo,
              uploaded: true,
              url: a.url_arquivo,
              name: a.nome_arquivo,
              size: 0,
              type: a.tipo_arquivo || 'image/jpeg',
              existing: true,
            }));

          const fotosControleExistentes: UploadedImage[] = (anexosData || [])
            .filter(a => a.descricao === 'foto_controle')
            .map(a => ({
              id: a.id,
              file: new File([new Blob()], a.nome_arquivo, { type: a.tipo_arquivo || 'image/jpeg' }),
              preview: a.url_arquivo,
              uploaded: true,
              url: a.url_arquivo,
              name: a.nome_arquivo,
              size: 0,
              type: a.tipo_arquivo || 'image/jpeg',
              existing: true,
            }));

          setFormData(prev => ({
            ...prev,
            fotosPedido: fotosPedidoExistentes,
            fotosControle: fotosControleExistentes,
          }));
          setAnexosOriginaisPedido(fotosPedidoExistentes);
          setAnexosOriginaisControle(fotosControleExistentes);
        }
      } catch (err) {
        console.error('Erro ao carregar pedido para edição:', err);
      }
    };
    carregarPedido();
  }, [isEditMode, pedidoIdParam]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para formatar data no formato DD/MM/AAAA
  const formatarData = (value: string) => {
    // Remove tudo que não é número
    const apenasNumeros = value.replace(/\D/g, '');

    // Aplica a máscara DD/MM/AAAA
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 4) {
      return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    } else {
      return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
    }
  };

  const handleDataChange = (value: string) => {
    const dataFormatada = formatarData(value);
    setFormData(prev => ({ ...prev, dataEntrega: dataFormatada }));
  };

  // Função para converter data DD/MM/AAAA para formato ISO AAAA-MM-DD
  const converterDataParaISO = (dataBR: string) => {
    if (!dataBR || dataBR.length !== 10) return '';

    const [dia, mes, ano] = dataBR.split('/');
    if (!dia || !mes || !ano || ano.length !== 4) return '';

    // Validar se é uma data válida
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    if (data.getDate() !== parseInt(dia) ||
      data.getMonth() !== parseInt(mes) - 1 ||
      data.getFullYear() !== parseInt(ano)) {
      return '';
    }

    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  };

  // Função para formatar dimensões com vírgula automática
  const formatarDimensao = (value: string) => {
    // Remove tudo que não é número
    const apenasNumeros = value.replace(/\D/g, '');

    // Se não há números, retorna vazio
    if (!apenasNumeros) return '';

    // Se tem apenas 1 dígito, retorna como está
    if (apenasNumeros.length === 1) return apenasNumeros;

    // Se tem 2 ou mais dígitos, adiciona vírgula após o primeiro
    return `${apenasNumeros.slice(0, 1)},${apenasNumeros.slice(1, 3)}`;
  };

  const handleDimensaoChange = (field: 'dimensaoLargura' | 'dimensaoComprimento', value: string) => {
    const valorFormatado = formatarDimensao(value);
    setFormData(prev => ({
      ...prev,
      [field]: valorFormatado,
      // Atualizar o campo dimensoes combinado para compatibilidade
      dimensoes: field === 'dimensaoLargura'
        ? `${valorFormatado} x ${prev.dimensaoComprimento}`
        : `${prev.dimensaoLargura} x ${valorFormatado}`
    }));
  };

  // Funções para manipular imagens
  const handleFotosPedidoChange = (images: UploadedImage[]) => {
    setFormData(prev => ({ ...prev, fotosPedido: images }));
  };

  const handleFotosControleChange = (images: UploadedImage[]) => {
    setFormData(prev => ({ ...prev, fotosControle: images }));
  };

  // Seleção única de meio de pagamento controlada por Select

  // Função para lidar com a seleção de cliente
  const handleClienteSelect = (cliente: Cliente | null) => {
    setClienteSelecionado(cliente);

    if (cliente) {
      setFormData(prev => ({
        ...prev,
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        clienteEmail: cliente.email || '',
        clienteTelefone: cliente.telefone,
        clienteEndereco: cliente.endereco_completo || '',
        clienteCep: cliente.cep || '',
        clienteBairro: cliente.bairro || '',
        clienteCidade: cliente.cidade || '',
        clienteEstado: cliente.estado || '',
      }));
    } else {
      // Limpar dados do cliente se nenhum cliente for selecionado
      setFormData(prev => ({
        ...prev,
        clienteId: '',
        clienteNome: '',
        clienteEmail: '',
        clienteTelefone: '',
        clienteEndereco: '',
        clienteCep: '',
        clienteBairro: '',
        clienteCidade: '',
        clienteEstado: '',
      }));
    }
  };

  // Função para buscar endereço pelo CEP
  const buscarEnderecoPorCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');

    // Verifica se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto.",
          variant: "destructive"
        });
        return;
      }

      // Atualiza os campos de endereço
      setFormData(prev => ({
        ...prev,
        clienteBairro: data.bairro || '',
        clienteCidade: data.localidade || '',
        clienteEstado: data.uf || '',
        clienteEndereco: `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`
      }));

      toast({
        title: "Endereço encontrado!",
        description: "Os dados do endereço foram preenchidos automaticamente."
      });

    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar o endereço. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Função para lidar com mudança no CEP
  const handleCepChange = (value: string) => {
    setFormData(prev => ({ ...prev, clienteCep: value }));

    // Busca automaticamente quando o CEP tiver 8 dígitos
    const cepLimpo = value.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarEnderecoPorCep(value);
    }
  };

  // Gerar número do pedido automaticamente apenas em modo de criação
  useEffect(() => {
    if (!isEditMode) {
      const numeroPedido = generatePedidoNumber();
      setFormData(prev => ({ ...prev, numeroPedido }));
    }
  }, [isEditMode]);

  // Carregar categorias do banco de dados
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const { data: categorias, error } = await supabase
          .from('categorias')
          .select('tipo, nome');

        if (error) {
          console.error('Erro ao carregar categorias:', error);
          return;
        }

        if (categorias) {
          // Separar categorias por tipo
          const cores = categorias.filter(cat => cat.tipo === 'cor').map(cat => cat.nome);
          const tiposSofa = categorias.filter(cat => cat.tipo === 'tipo_sofa').map(cat => cat.nome);
          const espumas = categorias.filter(cat => cat.tipo === 'espuma').map(cat => cat.nome);
          const bracos = categorias.filter(cat => cat.tipo === 'braco').map(cat => cat.nome);
          const tiposPe = categorias.filter(cat => cat.tipo === 'tipo_pe').map(cat => cat.nome);

          // Atualizar estados apenas se houver dados no banco
          if (cores.length > 0) setCoresDisponiveis(cores);
          if (tiposSofa.length > 0) setTiposSofaDisponiveis(tiposSofa);
          if (espumas.length > 0) setEspumasDisponiveis(espumas);
          if (bracos.length > 0) setBracosDisponiveis(bracos);
          if (tiposPe.length > 0) setTiposPeDisponiveis(tiposPe);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    carregarCategorias();
  }, []);

  // Garantir que os selects sempre incluam o valor atual do formulário
  useEffect(() => {
    const { tipoSofa, cor, espuma, braco, tipoPe, tipoServico } = formData;
    if (tipoSofa) setTiposSofaDisponiveis(prev => prev.includes(tipoSofa) ? prev : [...prev, tipoSofa]);
    if (cor) setCoresDisponiveis(prev => prev.includes(cor) ? prev : [...prev, cor]);
    if (espuma) setEspumasDisponiveis(prev => prev.includes(espuma) ? prev : [...prev, espuma]);
    if (braco) setBracosDisponiveis(prev => prev.includes(braco) ? prev : [...prev, braco]);
    if (tipoPe) setTiposPeDisponiveis(prev => prev.includes(tipoPe) ? prev : [...prev, tipoPe]);
    if (tipoServico) setTiposServicoDisponiveis(prev => prev.includes(tipoServico) ? prev : [...prev, tipoServico]);
  }, [formData.tipoSofa, formData.cor, formData.espuma, formData.braco, formData.tipoPe, formData.tipoServico]);

  // Reforçar que os valores atuais permaneçam visíveis quando listas são recarregadas
  useEffect(() => {
    const { tipoSofa, cor, espuma, braco, tipoPe, tipoServico } = formData;
    if (tipoSofa && !tiposSofaDisponiveis.includes(tipoSofa)) {
      setTiposSofaDisponiveis(prev => [...prev, tipoSofa]);
    }
    if (cor && !coresDisponiveis.includes(cor)) {
      setCoresDisponiveis(prev => [...prev, cor]);
    }
    if (espuma && !espumasDisponiveis.includes(espuma)) {
      setEspumasDisponiveis(prev => [...prev, espuma]);
    }
    if (braco && !bracosDisponiveis.includes(braco)) {
      setBracosDisponiveis(prev => [...prev, braco]);
    }
    if (tipoPe && !tiposPeDisponiveis.includes(tipoPe)) {
      setTiposPeDisponiveis(prev => [...prev, tipoPe]);
    }
    if (tipoServico && !tiposServicoDisponiveis.includes(tipoServico)) {
      setTiposServicoDisponiveis(prev => [...prev, tipoServico]);
    }
  }, [tiposSofaDisponiveis, coresDisponiveis, espumasDisponiveis, bracosDisponiveis, tiposPeDisponiveis, tiposServicoDisponiveis]);

  const generatePedidoNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PED${year}${month}${day}${random}`;
  };

  const adicionarNovaCor = async () => {
    if (novaCor.trim() && !coresDisponiveis.includes(novaCor.trim())) {
      try {
        const novaCorFormatada = novaCor.trim();

        // Salvar no banco de dados
        const { error } = await supabase
          .from('categorias')
          .insert({
            tipo: 'cor',
            nome: novaCorFormatada
          });

        if (error) throw error;

        setCoresDisponiveis(prev => [...prev, novaCorFormatada]);
        setFormData(prev => ({ ...prev, cor: novaCorFormatada }));
        setNovaCor('');
        setModalNovaCorAberto(false);
        toast({
          title: "Cor adicionada!",
          description: `A cor "${novaCorFormatada}" foi adicionada com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao adicionar cor:', error);
        toast({
          title: "Erro ao adicionar cor",
          description: "Não foi possível adicionar a cor. Tente novamente.",
          variant: "destructive",
        });
      }
    } else if (coresDisponiveis.includes(novaCor.trim())) {
      toast({
        title: "Cor já existe",
        description: "Esta cor já está na lista de cores disponíveis.",
        variant: "destructive",
      });
    }
  };

  const excluirCor = async (corParaRemover: string) => {
    try {
      // Remover do banco de dados
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('tipo', 'cor')
        .eq('nome', corParaRemover);

      if (error) throw error;

      setCoresDisponiveis(prev => prev.filter(cor => cor !== corParaRemover));
      if (formData.cor === corParaRemover) {
        setFormData(prev => ({ ...prev, cor: '' }));
      }
      setCorParaExcluir(null);
      toast({
        title: "Cor removida!",
        description: `A cor "${corParaRemover}" foi removida da lista.`,
      });
    } catch (error) {
      console.error('Erro ao excluir cor:', error);
      toast({
        title: "Erro ao excluir cor",
        description: "Não foi possível excluir a cor. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Funções para Tipo de Sofá
  const adicionarNovoTipoSofa = async () => {
    if (novoTipoSofa.trim() && !tiposSofaDisponiveis.includes(novoTipoSofa.trim())) {
      try {
        const novoTipoFormatado = novoTipoSofa.trim();

        // Salvar no banco de dados
        const { error } = await supabase
          .from('categorias')
          .insert({
            tipo: 'tipo_sofa',
            nome: novoTipoFormatado
          });

        if (error) throw error;

        setTiposSofaDisponiveis(prev => [...prev, novoTipoFormatado]);
        setFormData(prev => ({ ...prev, tipoSofa: novoTipoFormatado }));
        setNovoTipoSofa('');
        setModalNovoTipoSofaAberto(false);
        toast({
          title: "Tipo de sofá adicionado!",
          description: `O tipo "${novoTipoFormatado}" foi adicionado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao adicionar tipo de sofá:', error);
        toast({
          title: "Erro ao adicionar tipo",
          description: "Não foi possível adicionar o tipo de sofá. Tente novamente.",
          variant: "destructive",
        });
      }
    } else if (tiposSofaDisponiveis.includes(novoTipoSofa.trim())) {
      toast({
        title: "Tipo já existe",
        description: "Este tipo de sofá já está na lista.",
        variant: "destructive",
      });
    }
  };

  const excluirTipoSofa = async (tipoParaRemover: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('tipo', 'tipo_sofa')
        .eq('nome', tipoParaRemover);

      if (error) throw error;

      setTiposSofaDisponiveis(prev => prev.filter(tipo => tipo !== tipoParaRemover));
      if (formData.tipoSofa === tipoParaRemover) {
        setFormData(prev => ({ ...prev, tipoSofa: '' }));
      }
      setTipoSofaParaExcluir(null);
      toast({
        title: "Tipo removido!",
        description: `O tipo "${tipoParaRemover}" foi removido da lista.`,
      });
    } catch (error) {
      console.error('Erro ao excluir tipo de sofá:', error);
      toast({
        title: "Erro ao excluir tipo",
        description: "Não foi possível excluir o tipo de sofá. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Funções para Espuma
  const adicionarNovaEspuma = async () => {
    if (novaEspuma.trim() && !espumasDisponiveis.includes(novaEspuma.trim())) {
      try {
        const novaEspumaFormatada = novaEspuma.trim();

        const { error } = await supabase
          .from('categorias')
          .insert({
            tipo: 'espuma',
            nome: novaEspumaFormatada
          });

        if (error) throw error;

        setEspumasDisponiveis(prev => [...prev, novaEspumaFormatada]);
        setFormData(prev => ({ ...prev, espuma: novaEspumaFormatada }));
        setNovaEspuma('');
        setModalNovaEspumaAberto(false);
        toast({
          title: "Espuma adicionada!",
          description: `A espuma "${novaEspumaFormatada}" foi adicionada com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao adicionar espuma:', error);
        toast({
          title: "Erro ao adicionar espuma",
          description: "Não foi possível adicionar a espuma. Tente novamente.",
          variant: "destructive",
        });
      }
    } else if (espumasDisponiveis.includes(novaEspuma.trim())) {
      toast({
        title: "Espuma já existe",
        description: "Esta espuma já está na lista.",
        variant: "destructive",
      });
    }
  };

  const excluirEspuma = async (espumaParaRemover: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('tipo', 'espuma')
        .eq('nome', espumaParaRemover);

      if (error) throw error;

      setEspumasDisponiveis(prev => prev.filter(espuma => espuma !== espumaParaRemover));
      if (formData.espuma === espumaParaRemover) {
        setFormData(prev => ({ ...prev, espuma: '' }));
      }
      setEspumaParaExcluir(null);
      toast({
        title: "Espuma removida!",
        description: `A espuma "${espumaParaRemover}" foi removida da lista.`,
      });
    } catch (error) {
      console.error('Erro ao excluir espuma:', error);
      toast({
        title: "Erro ao excluir espuma",
        description: "Não foi possível excluir a espuma. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Funções para Braço
  const adicionarNovoBraco = async () => {
    if (novoBraco.trim() && !bracosDisponiveis.includes(novoBraco.trim())) {
      try {
        const novoBracoFormatado = novoBraco.trim();

        const { error } = await supabase
          .from('categorias')
          .insert({
            tipo: 'braco',
            nome: novoBracoFormatado
          });

        if (error) throw error;

        setBracosDisponiveis(prev => [...prev, novoBracoFormatado]);
        setFormData(prev => ({ ...prev, braco: novoBracoFormatado }));
        setNovoBraco('');
        setModalNovoBracoAberto(false);
        toast({
          title: "Braço adicionado!",
          description: `O braço "${novoBracoFormatado}" foi adicionado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao adicionar braço:', error);
        toast({
          title: "Erro ao adicionar braço",
          description: "Não foi possível adicionar o braço. Tente novamente.",
          variant: "destructive",
        });
      }
    } else if (bracosDisponiveis.includes(novoBraco.trim())) {
      toast({
        title: "Braço já existe",
        description: "Este braço já está na lista.",
        variant: "destructive",
      });
    }
  };

  const excluirBraco = async (bracoParaRemover: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('tipo', 'braco')
        .eq('nome', bracoParaRemover);

      if (error) throw error;

      setBracosDisponiveis(prev => prev.filter(braco => braco !== bracoParaRemover));
      if (formData.braco === bracoParaRemover) {
        setFormData(prev => ({ ...prev, braco: '' }));
      }
      setBracoParaExcluir(null);
      toast({
        title: "Braço removido!",
        description: `O braço "${bracoParaRemover}" foi removido da lista.`,
      });
    } catch (error) {
      console.error('Erro ao excluir braço:', error);
      toast({
        title: "Erro ao excluir braço",
        description: "Não foi possível excluir o braço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Funções para Tipo de Pé
  const adicionarNovoTipoPe = async () => {
    if (novoTipoPe.trim() && !tiposPeDisponiveis.includes(novoTipoPe.trim())) {
      try {
        const novoTipoPeFormatado = novoTipoPe.trim();

        const { error } = await supabase
          .from('categorias')
          .insert({
            tipo: 'tipo_pe',
            nome: novoTipoPeFormatado
          });

        if (error) throw error;

        setTiposPeDisponiveis(prev => [...prev, novoTipoPeFormatado]);
        setFormData(prev => ({ ...prev, tipoPe: novoTipoPeFormatado }));
        setNovoTipoPe('');
        setModalNovoTipoPeAberto(false);
        toast({
          title: "Tipo de pé adicionado!",
          description: `O tipo "${novoTipoPeFormatado}" foi adicionado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao adicionar tipo de pé:', error);
        toast({
          title: "Erro ao adicionar tipo de pé",
          description: "Não foi possível adicionar o tipo de pé. Tente novamente.",
          variant: "destructive",
        });
      }
    } else if (tiposPeDisponiveis.includes(novoTipoPe.trim())) {
      toast({
        title: "Tipo já existe",
        description: "Este tipo de pé já está na lista.",
        variant: "destructive",
      });
    }
  };

  const excluirTipoPe = async (tipoPeParaRemover: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('tipo', 'tipo_pe')
        .eq('nome', tipoPeParaRemover);

      if (error) throw error;

      setTiposPeDisponiveis(prev => prev.filter(tipo => tipo !== tipoPeParaRemover));
      if (formData.tipoPe === tipoPeParaRemover) {
        setFormData(prev => ({ ...prev, tipoPe: '' }));
      }
      setTipoPeParaExcluir(null);
      toast({
        title: "Tipo de pé removido!",
        description: `O tipo "${tipoPeParaRemover}" foi removido da lista.`,
      });
    } catch (error) {
      console.error('Erro ao excluir tipo de pé:', error);
      toast({
        title: "Erro ao excluir tipo de pé",
        description: "Não foi possível excluir o tipo de pé. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Funções para Tipo de Serviço
  const adicionarNovoTipoServico = async () => {
    if (novoTipoServico.trim() && !tiposServicoDisponiveis.includes(novoTipoServico.trim())) {
      try {
        const novoTipoFormatado = novoTipoServico.trim();

        // Salvar no banco de dados
        const { error } = await supabase
          .from('categorias')
          .insert({
            tipo: 'tipo_servico',
            nome: novoTipoFormatado
          });

        if (error) throw error;

        setTiposServicoDisponiveis(prev => [...prev, novoTipoFormatado]);
        setFormData(prev => ({ ...prev, tipoServico: novoTipoFormatado }));
        setNovoTipoServico('');
        setModalNovoTipoServicoAberto(false);
        toast({
          title: "Tipo de serviço adicionado!",
          description: `O tipo "${novoTipoFormatado}" foi adicionado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao adicionar tipo de serviço:', error);
        toast({
          title: "Erro ao adicionar tipo",
          description: "Não foi possível adicionar o tipo de serviço. Tente novamente.",
          variant: "destructive",
        });
      }
    } else if (tiposServicoDisponiveis.includes(novoTipoServico.trim())) {
      toast({
        title: "Tipo já existe",
        description: "Este tipo de serviço já está na lista.",
        variant: "destructive",
      });
    }
  };

  const excluirTipoServico = async (tipoServicoParaRemover: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('tipo', 'tipo_servico')
        .eq('nome', tipoServicoParaRemover);

      if (error) throw error;

      setTiposServicoDisponiveis(prev => prev.filter(tipo => tipo !== tipoServicoParaRemover));
      if (formData.tipoServico === tipoServicoParaRemover) {
        setFormData(prev => ({ ...prev, tipoServico: '' }));
      }
      setTipoServicoParaExcluir(null);
      toast({
        title: "Tipo de serviço removido!",
        description: `O tipo "${tipoServicoParaRemover}" foi removido da lista.`,
      });
    } catch (error) {
      console.error('Erro ao excluir tipo de serviço:', error);
      toast({
        title: "Erro ao excluir tipo de serviço",
        description: "Não foi possível excluir o tipo de serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Evitar salvar antes da etapa final do wizard
    if (wizardStep < 3) {
      handleAvancarWizard();
      return;
    }
    setIsLoading(true);

    try {
      // Validações básicas
      if (!clienteSelecionado) {
        throw new Error('Selecione um cliente para o pedido');
      }

      if (!formData.dataEntrega || !formData.descricao) {
        throw new Error('Preencha todos os dados do pedido');
      }

      // Validar formato da data
      const dataISO = converterDataParaISO(formData.dataEntrega);
      if (!dataISO) {
        throw new Error('Por favor, informe uma data válida no formato DD/MM/AAAA');
      }

      // Garantir dimensões combinadas mesmo se o usuário não tocar nos inputs
      // Extrai dois números (com vírgula ou ponto) dos campos existentes e salva no formato "Largura Comprimento"
      const extrairDimensoes = (entrada: string) => {
        const nums = (entrada || '').match(/\d+[.,]?\d*/g) || [];
        const [l, c] = [nums[0] || '', nums[1] || ''];
        return { l: l.replace('.', ','), c: c.replace('.', ',') };
      };
      const { l: l1, c: c1 } = extrairDimensoes(formData.dimensoes);
      const { l: l2, c: c2 } = extrairDimensoes(`${formData.dimensaoLargura} ${formData.dimensaoComprimento}`);
      const larguraFinal = l1 || l2;
      const comprimentoFinal = c1 || c2;
      const dimensoesCombinadas = [larguraFinal, comprimentoFinal].filter(Boolean).join(' x ');

      if (!formData.tipoSofa || !formData.cor) {
        throw new Error('Preencha o tipo e cor do sofá');
      }

      if (!formData.tipoServico) {
        throw new Error('Selecione o tipo de serviço');
      }

      if (!formData.espuma || !formData.tecido || !formData.braco || !formData.tipoPe) {
        throw new Error('Preencha todas as especificações do produto');
      }

      if (etapasSelecionadas.length === 0) {
        throw new Error('Selecione pelo menos uma etapa necessária para o pedido');
      }

      // Calcular valor_total a partir dos preços dos produtos com descontos e frete
      const valorTotal = totalFinalPedido;
      const valorPago = 0;

      // Verificar se o usuário está autenticado
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados do pedido
      const pedidoData: any = {
        cliente_id: clienteSelecionado.id,
        cliente_nome: clienteSelecionado.nome,
        cliente_email: clienteSelecionado.email,
        cliente_telefone: clienteSelecionado.telefone,
        cliente_endereco: formData.clienteEndereco,
        loja: lojaSelecionadaForm,
        vendedor_id: vendedorSelecionado?.id,
        data_previsao_entrega: dataISO,
        descricao_sofa: formData.descricao,
        tipo_sofa: formData.tipoSofa,
        tipo_servico: formData.tipoServico,
        cor: formData.cor,
        dimensoes: dimensoesCombinadas,
        observacoes: formData.observacoes,
        espuma: formData.espuma,
        tecido: formData.tecido,
        braco: formData.braco,
        tipo_pe: formData.tipoPe,
        valor_total: valorTotal,
        valor_pago: valorPago,
        prioridade: formData.prioridade,
        status: 'pendente',
        created_by: user.id,
        etapas_necessarias: etapasSelecionadas,
        desconto_tipo: formData.pedidoDescontoTipo,
        desconto_valor: parseFloat(formData.pedidoDescontoValor) || 0
      };

      // Incluir numero_pedido apenas se fornecido pelo usuário
      if (formData.numeroPedido.trim()) {
        // Extrair apenas os números do campo numero_pedido
        const numeroLimpo = formData.numeroPedido.replace(/\D/g, '');
        if (numeroLimpo) {
          pedidoData.numero_pedido = parseInt(numeroLimpo);
        }
      }

      // Incluir preco_unitario se informado e válido
      if (formData.precoUnitario.trim()) {
        const valor = parseFloat(formData.precoUnitario.replace(',', '.'));
        if (!isNaN(valor)) {
          pedidoData.preco_unitario = valor;
        }
      }

      // Incluir frete se informado e válido
      if (formData.frete.trim()) {
        const valorFrete = parseFloat(formData.frete.replace(',', '.'));
        if (!isNaN(valorFrete)) {
          pedidoData.frete = valorFrete;
        }
      }

      // Incluir forma_pagamento
      if (formData.formaPagamento.trim()) {
        pedidoData.forma_pagamento = formData.formaPagamento.trim();
      }

      // Incluir garantia
      if (formData.garantiaTipo) {
        pedidoData.garantia_tipo = formData.garantiaTipo;
      }
      if (formData.garantiaValor.trim()) {
        const gVal = parseInt(formData.garantiaValor.replace(/\D/g, ''), 10);
        if (!isNaN(gVal)) {
          pedidoData.garantia_valor = gVal;
        }
      }
      if (formData.garantiaTexto.trim()) {
        pedidoData.garantia_texto = formData.garantiaTexto.trim();
      }

      // Incluir termo de entrega e recebimento
      pedidoData.termo_entrega_ativo = !!formData.termoEntregaAtivo;
      if (formData.termoEntregaAtivo && formData.termoEntregaTexto.trim()) {
        pedidoData.termo_entrega_texto = formData.termoEntregaTexto.trim();
      } else if (!formData.termoEntregaAtivo) {
        pedidoData.termo_entrega_texto = null;
      }

      let pedidoAtualId = pedidoIdParam || '';
      let pedidoCriado = null as any;
      if (!isEditMode) {
        const { data, error } = await supabase
          .from('pedidos')
          .insert([pedidoData])
          .select();
        if (error) throw error;
        pedidoCriado = data[0];
        pedidoAtualId = pedidoCriado.id;
      } else {
        const { data, error } = await supabase
          .from('pedidos')
          .update(pedidoData)
          .eq('id', pedidoAtualId)
          .select();
        if (error) throw error;
        pedidoCriado = data[0];
      }

      // Preparar lista total de imagens para processamento posterior (após salvar itens)
      const todasImagens = [
        ...formData.fotosPedido.map(img => ({ ...img, tipo: 'foto_pedido' })),
        // Fotos dos produtos adicionais (associadas ao pedido)
        ...itensAdicionais.flatMap(it => it.fotosPedido.map(img => ({ ...img, tipo: 'foto_pedido' }))),
        ...formData.fotosControle.map(img => ({ ...img, tipo: 'foto_controle' }))
      ];

      // Em modo edição, remover anexos que foram excluídos pelo usuário
      if (isEditMode) {
        const atuaisExistentes = todasImagens.filter(img => img.existing).map(img => img.id);
        const origPedidoIds = anexosOriginaisPedido.map(a => a.id);
        const origControleIds = anexosOriginaisControle.map(a => a.id);

        const removidosPedido = anexosOriginaisPedido.filter(a => !atuaisExistentes.includes(a.id));
        const removidosControle = anexosOriginaisControle.filter(a => !atuaisExistentes.includes(a.id));
        const removidos = [...removidosPedido, ...removidosControle];

        for (const rem of removidos) {
          try {
            // Remover registro do banco
            const { error: delError } = await supabase
              .from('pedido_anexos')
              .delete()
              .eq('id', rem.id);
            if (delError) {
              console.error('Erro ao remover registro de anexo:', delError);
            }

            // Remover arquivo do storage
            if (rem.url) {
              const marker = '/pedido-imagens/';
              const idx = rem.url.indexOf(marker);
              if (idx !== -1) {
                const path = rem.url.substring(idx + marker.length);
                const { error: storageErr } = await supabase.storage
                  .from('pedido-imagens')
                  .remove([path]);
                if (storageErr) {
                  console.error('Erro ao remover arquivo do storage:', storageErr);
                }
              }
            }
          } catch (e) {
            console.error('Erro ao remover anexo:', e);
          }
        }
      }

      // Persistir itens do pedido (múltiplos produtos)
      const primeiroItem = {
        descricao: formData.descricao,
        tipoSofa: formData.tipoSofa,
        cor: formData.cor,
        dimensoes: dimensoesCombinadas,
        tipoServico: formData.tipoServico,
        espuma: formData.espuma,
        tecido: formData.tecido,
        braco: formData.braco,
        tipoPe: formData.tipoPe,
        precoUnitario: formData.precoUnitario,
        observacoes: formData.observacoes,
        descontoTipo: formData.descontoTipo,
        descontoValor: parseFloat(formData.descontoValor) || 0,
      } as PedidoItemForm;

      const todosItens = [primeiroItem, ...itensAdicionais];

      // Em modo edição, remover itens antigos para recriar do zero
      if (isEditMode) {
        const { error: delItensError } = await supabase
          .from('pedido_itens')
          .delete()
          .eq('pedido_id', pedidoAtualId);
        if (delItensError) {
          console.error('Erro ao remover itens antigos do pedido:', delItensError);
        }

        // Remover etapas de produção antigas para recriar conforme seleção atual
        const { error: delEtapasError } = await supabase
          .from('itens_producao')
          .delete()
          .eq('pedido_id', pedidoAtualId);
        if (delEtapasError) {
          console.error('Erro ao remover etapas antigas de produção:', delEtapasError);
        }
      }

      let itensInseridos: any[] = [];
      if (todosItens.length > 0) {
        const itensData = todosItens.map((it, idx) => ({
          pedido_id: pedidoAtualId,
          descricao: it.descricao || null,
          tipo_sofa: it.tipoSofa || null,
          cor: it.cor || null,
          dimensoes: it.dimensoes || null,
          tipo_servico: it.tipoServico || null,
          espuma: it.espuma || null,
          tecido: it.tecido || null,
          braco: it.braco || null,
          tipo_pe: it.tipoPe || null,
          created_by: user.id,
          observacoes: it.observacoes || null,
          sequencia: (idx + 1),
          visita_tecnica: idx === 0 ? !!formData.visitaTecnicaAtiva : !!it.visitaTecnicaAtiva,
          data_visita_tecnica: (() => {
            const dataBR = idx === 0 ? (formData.visitaTecnicaData || '') : (it.visitaTecnicaData || '');
            const dataISO = converterDataParaISO(dataBR);
            return dataISO || null;
          })(),
          preco_unitario: (() => {
            const v = (it.precoUnitario || '').toString().replace(',', '.');
            const n = parseFloat(v);
            return isNaN(n) ? null : n;
          })(),
          desconto_tipo: it.descontoTipo,
          desconto_valor: it.descontoValor
        }));

        const { data: itensSalvos, error: itensError } = await supabase
          .from('pedido_itens')
          .insert(itensData)
          .select();

        if (itensError) {
          console.error('Erro ao salvar itens do pedido:', itensError);
          throw new Error('Falha ao salvar itens do pedido. Tente novamente.');
        } else {
          itensInseridos = itensSalvos || [];
          if (!Array.isArray(itensInseridos) || itensInseridos.length === 0) {
            console.error('Nenhum item foi inserido em pedido_itens. Resposta:', itensSalvos);
            throw new Error('Nenhum item do pedido foi salvo. Verifique os dados e tente novamente.');
          }
        }
      }

      // Inserir anexos novos (após termos os IDs dos itens) e linkar fotos de produto ao item correspondente
      const novasImagens = todasImagens.filter(img => !img.existing && img.uploaded && !!img.url);
      if (novasImagens.length > 0) {
        // Mapear fotos de produto por índice de item: primeiro conjunto é do item 1 (formData), demais seguem a ordem de itensAdicionais
        // Construção de anexos com vinculação ao item (apenas para tipo 'foto_pedido')
        let itemIndex = 0;
        const anexosData = novasImagens.map(img => {
          let pedido_item_id: string | null = null;
          if (img.tipo === 'foto_pedido' && itensInseridos[itemIndex]) {
            pedido_item_id = itensInseridos[itemIndex].id;
          }
          // Avançar o índice quando estivermos processando a última foto de um grupo? Simples: assumir fotos agrupadas por item em ordem.
          // Como não temos marcador de agrupamento aqui, avançaremos manualmente na criação abaixo quando forem usados por item.
          return {
            pedido_id: pedidoAtualId,
            pedido_item_id,
            nome_arquivo: img.name,
            url_arquivo: img.url,
            tipo_arquivo: img.type,
            tamanho_arquivo: img.size,
            descricao: img.tipo,
            uploaded_by: user.id
          };
        });

        // Ajuste de pedido_item_id por agrupamento: redistribuir corretamente fotos por item usando contagem baseada nas fontes
        // Reconstituir grupos: primeiro as fotos do primeiro item, depois de cada item adicional, por fim fotos de controle
        const gruposFotosItens: UploadedImage[][] = [
          formData.fotosPedido.filter(img => !img.existing && img.uploaded && !!img.url),
          ...itensAdicionais.map(it => it.fotosPedido.filter(img => !img.existing && img.uploaded && !!img.url))
        ];
        const fotosControleNovas = formData.fotosControle.filter(img => !img.existing && img.uploaded && !!img.url);

        const anexosPorItens: any[] = [];
        gruposFotosItens.forEach((grupo, idx) => {
          const itemRow = itensInseridos[idx];
          const itemId = itemRow ? itemRow.id : null;
          grupo.forEach(img => {
            anexosPorItens.push({
              pedido_id: pedidoAtualId,
              pedido_item_id: itemId,
              nome_arquivo: img.name,
              url_arquivo: img.url,
              tipo_arquivo: img.type,
              tamanho_arquivo: img.size,
              descricao: 'foto_pedido',
              uploaded_by: user.id
            });
          });
        });

        const anexosControle: any[] = fotosControleNovas.map(img => ({
          pedido_id: pedidoAtualId,
          pedido_item_id: null,
          nome_arquivo: img.name,
          url_arquivo: img.url,
          tipo_arquivo: img.type,
          tamanho_arquivo: img.size,
          descricao: 'foto_controle',
          uploaded_by: user.id
        }));

        const anexosFinal = [...anexosPorItens, ...anexosControle];

        if (anexosFinal.length > 0) {
          const { error: anexosError } = await supabase
            .from('pedido_anexos')
            .insert(anexosFinal);

          if (anexosError) {
            console.error('Erro ao salvar anexos:', anexosError);
          }
        }
      }

      // Criar etapas de produção por produto (inclui Produto 1 e adicionais)
      try {
        const etapasPorItem: { pedido_item_id: string; etapas: string[] }[] = itensInseridos.map((it, idx) => {
          const etapas = idx === 0 ? (etapasSelecionadas || []) : (itensAdicionais[idx - 1]?.etapasNecessarias || []);
          return { pedido_item_id: it.id, etapas };
        });

        const itensProducaoData = etapasPorItem.flatMap(({ pedido_item_id, etapas }) => {
          if (!etapas || etapas.length === 0) return [] as any[];
          return etapas.map((etapa) => ({
            pedido_id: pedidoAtualId,
            pedido_item_id,
            etapa,
            concluida: false
          }));
        });

        if (itensProducaoData.length > 0) {
          const { error: etapasInsertError } = await supabase
            .from('itens_producao')
            .insert(itensProducaoData);
          if (etapasInsertError) {
            console.error('Erro ao criar etapas de produção por produto:', etapasInsertError);
          }
        }

        // Atualizar status do pedido para em_producao como antes
        await supabase
          .from('pedidos')
          .update({ status: 'em_producao' })
          .eq('id', pedidoAtualId);
      } catch (producaoError) {
        console.error('Erro ao criar etapas de produção por produto:', producaoError);
      }

      if (!isEditMode) {
        toast({
          title: "Pedido Criado com Sucesso!",
          description: `Pedido #${pedidoCriado.numero_pedido} foi cadastrado e enviado para produção.`,
        });
      } else {
        toast({
          title: "Pedido Atualizado",
          description: `Pedido #${pedidoCriado.numero_pedido} foi atualizado com sucesso.`,
        });
      }

      // Reset e redirecionamento
      if (!isEditMode) {
        setFormData({
          clienteId: '',
          clienteNome: '',
          clienteEmail: '',
          clienteTelefone: '',
          clienteEndereco: '',
          clienteCep: '',
          clienteBairro: '',
          clienteCidade: '',
          clienteEstado: '',
          numeroPedido: '',
          dataEntrega: '',
          descricao: '',
          tipoSofa: '',
          cor: '',
          dimensoes: '',
          dimensaoLargura: '',
          dimensaoComprimento: '',
          tipoServico: '',
          observacoes: '',
          espuma: '',
          tecido: '',
          braco: '',
          tipoPe: '',
          frete: '',
          precoUnitario: '',
          valorTotal: '',
          valorPago: '',
          formaPagamento: '',
          prioridade: 'media',
          garantiaTipo: 'dias',
          garantiaValor: '',
          garantiaTexto: '',
          termoEntregaAtivo: false,
          termoEntregaTexto: '',
          etapasNecessarias: [],
          fotosPedido: [],
          fotosControle: [],
          visitaTecnicaAtiva: false,
          descontoTipo: 'percentage',
          descontoValor: '',
          pedidoDescontoTipo: 'percentage',
          pedidoDescontoValor: '',
          visitaTecnicaData: ''
        });
        setClienteSelecionado(null);
        setEtapasSelecionadas([]);
        setItensAdicionais([]);
        setTimeout(() => {
          navigate('/dashboard/pedidos');
        }, 2000);
      } else {
        navigate('/dashboard/pedidos');
      }

    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: isEditMode ? "Erro ao Atualizar Pedido" : "Erro ao Criar Pedido",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Bloquear Enter nas etapas 1 e 2 para evitar submit prematuro
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && wizardStep < 3) {
      e.preventDefault();
      handleAvancarWizard();
    }
  };

  return (
    <DashboardLayout
      title={isEditMode ? "Editar Pedido" : "Novo Pedido"}
      description={isEditMode ? "Atualize os dados do pedido" : "Cadastrar novo pedido de sofá personalizado"}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
          {/* Navegação do Wizard */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 text-sm">
              <span className="font-medium">Passo {wizardStep} de 3</span>
              <span className="text-muted-foreground">{wizardStep === 1 ? 'Entrega e Dados do Cliente' : wizardStep === 2 ? 'Dados do Produto' : 'Detalhes'}</span>
            </div>
            <div className="flex gap-2">
              {wizardStep > 1 && (
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); setWizardStep(prev => Math.max(1, prev - 1)); }}>
                  Voltar
                </Button>
              )}
            </div>
          </div>
          {/* Dados do Cliente */}
          {wizardStep === 1 && (
            <>
              {selectedStore === 'todas' && (
                <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-300">
                      <Store className="w-5 h-5" />
                      Selecione a Loja para este Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={lojaSelecionadaForm} onValueChange={setLojaSelecionadaForm}>
                      <SelectTrigger className="w-full md:w-[300px] bg-white dark:bg-card">
                        <SelectValue placeholder="Selecione a loja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loja_1">Aragão</SelectItem>
                        <SelectItem value="loja_2">Boa Viagem</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Como administrador, você deve especificar para qual loja este pedido está sendo criado.
                    </p>
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Dados do Cliente & Vendedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cliente</Label>
                        <ClienteSelector
                          onClienteSelect={(cliente) => {
                            setClienteSelecionado(cliente);
                            if (cliente) {
                              setFormData(prev => ({
                                ...prev,
                                clienteId: cliente.id,
                                clienteNome: cliente.nome,
                                clienteEmail: cliente.email || '',
                                clienteTelefone: cliente.telefone,
                                clienteEndereco: cliente.endereco_completo || '',
                                clienteCep: cliente.cep || '',
                                clienteBairro: cliente.bairro || '',
                                clienteCidade: cliente.cidade || '',
                                clienteEstado: cliente.estado || '',
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                clienteId: '',
                                clienteNome: '',
                                clienteEmail: '',
                                clienteTelefone: '',
                                clienteEndereco: '',
                                clienteCep: '',
                                clienteBairro: '',
                                clienteCidade: '',
                                clienteEstado: '',
                              }));
                            }
                          }}
                          selectedCliente={clienteSelecionado}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vendedor</Label>
                        <VendedorSelector
                          onVendedorSelect={(vendedor) => {
                            setVendedorSelecionado(vendedor);
                            setFormData(prev => ({ ...prev, vendedorId: vendedor?.id || '' }));
                          }}
                          selectedVendedor={vendedorSelecionado}
                        />
                      </div>
                    </div>

                    {clienteSelecionado && (
                      <div className="grid md:grid-cols-2 gap-4 pt-2 border-t mt-2">
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input value={clienteSelecionado.telefone} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input value={clienteSelecionado.email || '-'} disabled />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-2 border-t">
                      <Label htmlFor="clienteEndereco">Endereço de Entrega</Label>
                      <Input
                        id="clienteEndereco"
                        value={formData.clienteEndereco}
                        onChange={(e) => handleInputChange('clienteEndereco', e.target.value)}
                        placeholder="Endereço completo para entrega"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clienteBairro">Bairro</Label>
                        <Input
                          id="clienteBairro"
                          value={formData.clienteBairro}
                          onChange={(e) => handleInputChange('clienteBairro', e.target.value)}
                          placeholder="Bairro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clienteCidade">Cidade</Label>
                        <Input
                          id="clienteCidade"
                          value={formData.clienteCidade}
                          onChange={(e) => handleInputChange('clienteCidade', e.target.value)}
                          placeholder="Cidade"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          {/* Número do Pedido e Data de Entrega (bloco separado entre Cliente e Pedido) */}
          {
            wizardStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Número e Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroPedido">Número do Pedido</Label>
                    <Input
                      id="numeroPedido"
                      value={formData.numeroPedido}
                      onChange={(e) => handleInputChange('numeroPedido', e.target.value)}
                      placeholder="Ex: PED250909164 (deixe vazio para gerar automaticamente)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataEntrega">Data de Entrega</Label>
                    <Input
                      id="dataEntrega"
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={formData.dataEntrega}
                      onChange={(e) => handleDataChange(e.target.value)}
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frete">Frete</Label>
                    <Input
                      id="frete"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      placeholder="Valor do frete (se houver)"
                      value={formData.frete}
                      onChange={(e) => handleInputChange('frete', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          }

          {/* Dados do Pedido */}
          {
            wizardStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Dados do Produto
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cabeçalho para o Produto 1 */}
                  <div className="md:col-span-2">
                    <Label className="text-base font-medium">Produto 1</Label>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => handleInputChange('descricao', e.target.value)}
                      placeholder="Descrição detalhada do pedido"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Visita técnica (Produto 1) */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Visita técnica</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{formData.visitaTecnicaAtiva ? 'Sim' : 'Não'}</span>
                        <Switch
                          checked={formData.visitaTecnicaAtiva}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visitaTecnicaAtiva: checked }))}
                        />
                      </div>
                    </div>
                    {formData.visitaTecnicaAtiva && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="dataVisitaTecnica">Data da visita técnica</Label>
                          <Input
                            id="dataVisitaTecnica"
                            type="text"
                            placeholder="DD/MM/AAAA"
                            maxLength={10}
                            value={formData.visitaTecnicaData}
                            onChange={(e) => setFormData(prev => ({ ...prev, visitaTecnicaData: formatarData(e.target.value) }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Foto do Produto (principal) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Foto do Produto
                    </Label>
                    <ImageUpload
                      images={formData.fotosPedido}
                      onImagesChange={handleFotosPedidoChange}
                      maxImages={1}
                      bucketName="pedido-imagens"
                      folder="fotos-pedido"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoSofa">Tipo de Sofá</Label>
                    <div className="flex gap-2">
                      <Select value={formData.tipoSofa} onValueChange={(value) => handleInputChange('tipoSofa', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione o tipo de sofá" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposSofaDisponiveis.map((tipo) => (
                            <div key={tipo} className="flex items-center justify-between group hover:bg-accent hover:text-accent-foreground px-2 py-1.5 text-sm cursor-pointer">
                              <SelectItem value={tipo} className="flex-1 border-0 p-0 focus:bg-transparent">
                                {tipo}
                              </SelectItem>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setTipoSofaParaExcluir(tipo);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={modalNovoTipoSofaAberto} onOpenChange={setModalNovoTipoSofaAberto}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Tipo de Sofá</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="novo-tipo-sofa">Nome do Tipo</Label>
                              <Input
                                id="novo-tipo-sofa"
                                value={novoTipoSofa}
                                onChange={(e) => setNovoTipoSofa(e.target.value)}
                                placeholder="Digite o nome do novo tipo"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    adicionarNovoTipoSofa();
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setModalNovoTipoSofaAberto(false);
                                  setNovoTipoSofa('');
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                onClick={adicionarNovoTipoSofa}
                                disabled={!novoTipoSofa.trim()}
                              >
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Modal de Confirmação para Excluir Tipo de Sofá */}
                      <Dialog open={!!tipoSofaParaExcluir} onOpenChange={() => setTipoSofaParaExcluir(null)}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Excluir Tipo de Sofá</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Tem certeza que deseja excluir o tipo <strong>"{tipoSofaParaExcluir}"</strong>?
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTipoSofaParaExcluir(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => tipoSofaParaExcluir && excluirTipoSofa(tipoSofaParaExcluir)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor">Cor</Label>
                    <div className="flex gap-2">
                      <Select value={formData.cor} onValueChange={(value) => handleInputChange('cor', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                        <SelectContent>
                          {coresDisponiveis.map((cor) => (
                            <div key={cor} className="flex items-center justify-between group hover:bg-accent hover:text-accent-foreground px-2 py-1.5 text-sm cursor-pointer">
                              <SelectItem value={cor} className="flex-1 border-0 p-0 focus:bg-transparent">
                                {cor}
                              </SelectItem>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCorParaExcluir(cor);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={modalNovaCorAberto} onOpenChange={setModalNovaCorAberto}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Adicionar Nova Cor</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="nova-cor">Nome da Cor</Label>
                              <Input
                                id="nova-cor"
                                value={novaCor}
                                onChange={(e) => setNovaCor(e.target.value)}
                                placeholder="Digite o nome da nova cor"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    adicionarNovaCor();
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setModalNovaCorAberto(false);
                                  setNovaCor('');
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                onClick={adicionarNovaCor}
                                disabled={!novaCor.trim()}
                              >
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Modal de Confirmação para Excluir Cor */}
                      <Dialog open={!!corParaExcluir} onOpenChange={() => setCorParaExcluir(null)}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Excluir Cor</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Tem certeza que deseja excluir a cor <strong>"{corParaExcluir}"</strong>?
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCorParaExcluir(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => corParaExcluir && excluirCor(corParaExcluir)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensoes">Dimensões (metros)</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          id="dimensaoLargura"
                          value={formData.dimensaoLargura}
                          onChange={(e) => handleDimensaoChange('dimensaoLargura', e.target.value)}
                          placeholder="2,20"
                          maxLength={4}
                          className="text-center"
                        />
                      </div>
                      <span className="text-lg font-bold text-muted-foreground px-2">×</span>
                      <div className="flex-1">
                        <Input
                          id="dimensaoComprimento"
                          value={formData.dimensaoComprimento}
                          onChange={(e) => handleDimensaoChange('dimensaoComprimento', e.target.value)}
                          placeholder="1,10"
                          maxLength={4}
                          className="text-center"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                    <div className="flex gap-2">
                      <Select value={formData.tipoServico} onValueChange={(value) => handleInputChange('tipoServico', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione o tipo de serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposServicoDisponiveis.map((tipoServico) => (
                            <div key={tipoServico} className="flex items-center justify-between group hover:bg-accent hover:text-accent-foreground px-2 py-1.5 text-sm cursor-pointer">
                              <SelectItem value={tipoServico} className="flex-1 border-0 p-0 focus:bg-transparent">
                                {tipoServico}
                              </SelectItem>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setTipoServicoParaExcluir(tipoServico);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={modalNovoTipoServicoAberto} onOpenChange={setModalNovoTipoServicoAberto}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Tipo de Serviço</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="novoTipoServico">Nome do Tipo de Serviço</Label>
                              <Input
                                id="novoTipoServico"
                                value={novoTipoServico}
                                onChange={(e) => setNovoTipoServico(e.target.value)}
                                placeholder="Ex: MANUTENÇÃO"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setModalNovoTipoServicoAberto(false);
                                  setNovoTipoServico('');
                                }}
                                className="flex-1"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                onClick={adicionarNovoTipoServico}
                                className="flex-1"
                              >
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precoUnitario" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Preço Unitário
                    </Label>
                    <Input
                      id="precoUnitario"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 199.90"
                      value={formData.precoUnitario}
                      onChange={(e) => handleInputChange('precoUnitario', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <DiscountInput
                    price={parseFloat(formData.precoUnitario) || 0}
                    discountType={formData.descontoTipo}
                    discountValue={parseFloat(formData.descontoValor) || 0}
                    onDiscountTypeChange={(type) => setFormData(prev => ({ ...prev, descontoTipo: type }))}
                    onDiscountValueChange={(value) => setFormData(prev => ({ ...prev, descontoValor: value.toString() }))}
                  />

                  {/* Etapas Necessárias (Produto 1) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Etapas Necessárias</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Selecione as etapas de produção onde este pedido deve aparecer. Clique para selecionar/deselecionar.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {etapasDisponiveis.map((etapa) => {
                        const isSelected = etapasSelecionadas.includes(etapa);
                        const etapaLabel = {
                          'marcenaria': 'Marcenaria',
                          'corte_costura': 'Corte Costura',
                          'espuma': 'Espuma',
                          'bancada': 'Bancada',
                          'tecido': 'Tecido'
                        }[etapa] || etapa;

                        return (
                          <Button
                            key={etapa}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={`h-12 text-sm font-medium transition-all ${isSelected
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'hover:bg-muted'
                              }`}
                            onClick={() => toggleEtapa(etapa)}
                          >
                            {etapaLabel}
                          </Button>
                        );
                      })}
                    </div>
                    {etapasSelecionadas.length === 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Atenção:</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Nenhuma etapa selecionada. O pedido não aparecerá em nenhuma etapa de produção.
                        </p>
                      </div>
                    )}
                    {etapasSelecionadas.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <Package className="h-4 w-4" />
                          <span className="text-sm font-medium">Etapas selecionadas:</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          {etapasSelecionadas.map(etapa => {
                            const etapaLabel = {
                              'marcenaria': 'Marcenaria',
                              'corte_costura': 'Corte Costura',
                              'espuma': 'Espuma',
                              'bancada': 'Bancada',
                              'tecido': 'Tecido'
                            }[etapa] || etapa;
                            return etapaLabel;
                          }).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Observações (Produto 1) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Observações adicionais sobre o pedido"
                      rows={2}
                    />
                  </div>

                  {/* Espuma (Produto 1) */}
                  <div className="space-y-2">
                    <Label htmlFor="espuma">Espuma</Label>
                    <div className="flex gap-2">
                      <Select value={formData.espuma} onValueChange={(value) => handleInputChange('espuma', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione o tipo de espuma" />
                        </SelectTrigger>
                        <SelectContent>
                          {espumasDisponiveis.map((espuma) => (
                            <div key={espuma} className="flex items-center justify-between group hover:bg-accent hover:text-accent-foreground px-2 py-1.5 text-sm cursor-pointer">
                              <SelectItem value={espuma} className="flex-1 border-0 p-0 focus:bg-transparent">
                                {espuma}
                              </SelectItem>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEspumaParaExcluir(espuma);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={modalNovaEspumaAberto} onOpenChange={setModalNovaEspumaAberto}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Adicionar Nova Espuma</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="nova-espuma">Nome da Espuma</Label>
                              <Input
                                id="nova-espuma"
                                value={novaEspuma}
                                onChange={(e) => setNovaEspuma(e.target.value)}
                                placeholder="Digite o nome da nova espuma"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    adicionarNovaEspuma();
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setModalNovaEspumaAberto(false);
                                  setNovaEspuma('');
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                onClick={adicionarNovaEspuma}
                                disabled={!novaEspuma.trim()}
                              >
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* Modal de Confirmação para Excluir Espuma */}
                      <Dialog open={!!espumaParaExcluir} onOpenChange={() => setEspumaParaExcluir(null)}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Excluir Espuma</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Tem certeza que deseja excluir a espuma <strong>"{espumaParaExcluir}"</strong>?
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEspumaParaExcluir(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => espumaParaExcluir && excluirEspuma(espumaParaExcluir)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Tecido (Produto 1) */}
                  <div className="space-y-2">
                    <Label htmlFor="tecido">Tecido</Label>
                    <Input
                      id="tecido"
                      value={formData.tecido}
                      onChange={(e) => handleInputChange('tecido', e.target.value)}
                      placeholder="Especificação do tecido"
                      required
                    />
                  </div>

                  {/* Braço (Produto 1) */}
                  <div className="space-y-2">
                    <Label htmlFor="braco">Braço</Label>
                    <div className="flex gap-2">
                      <Select value={formData.braco} onValueChange={(value) => handleInputChange('braco', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione o tipo de braço" />
                        </SelectTrigger>
                        <SelectContent>
                          {bracosDisponiveis.map((braco) => (
                            <div key={braco} className="flex items-center justify-between group hover:bg-accent hover:text-accent-foreground px-2 py-1.5 text-sm cursor-pointer">
                              <SelectItem value={braco} className="flex-1 border-0 p-0 focus:bg-transparent">
                                {braco}
                              </SelectItem>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setBracoParaExcluir(braco);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={modalNovoBracoAberto} onOpenChange={setModalNovoBracoAberto}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Braço</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="novo-braco">Nome do Braço</Label>
                              <Input
                                id="novo-braco"
                                value={novoBraco}
                                onChange={(e) => setNovoBraco(e.target.value)}
                                placeholder="Digite o nome do novo braço"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    adicionarNovoBraco();
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setModalNovoBracoAberto(false);
                                  setNovoBraco('');
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                onClick={adicionarNovoBraco}
                                disabled={!novoBraco.trim()}
                              >
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* Modal de Confirmação para Excluir Braço */}
                      <Dialog open={!!bracoParaExcluir} onOpenChange={() => setBracoParaExcluir(null)}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Excluir Braço</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Tem certeza que deseja excluir o braço <strong>"{bracoParaExcluir}"</strong>?
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setBracoParaExcluir(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => bracoParaExcluir && excluirBraco(bracoParaExcluir)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Tipo de Pé (Produto 1) */}
                  <div className="space-y-2">
                    <Label htmlFor="tipoPe">Tipo de Pé</Label>
                    <div className="flex gap-2">
                      <Select value={formData.tipoPe} onValueChange={(value) => handleInputChange('tipoPe', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione o tipo de pé" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposPeDisponiveis.map((tipoPe) => (
                            <div key={tipoPe} className="flex items-center justify-between group hover:bg-accent hover:text-accent-foreground px-2 py-1.5 text-sm cursor-pointer">
                              <SelectItem value={tipoPe} className="flex-1 border-0 p-0 focus:bg-transparent">
                                {tipoPe}
                              </SelectItem>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setTipoPeParaExcluir(tipoPe);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={modalNovoTipoPeAberto} onOpenChange={setModalNovoTipoPeAberto}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Tipo de Pé</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="novo-tipo-pe">Nome do Tipo de Pé</Label>
                              <Input
                                id="novo-tipo-pe"
                                value={novoTipoPe}
                                onChange={(e) => setNovoTipoPe(e.target.value)}
                                placeholder="Digite o nome do novo tipo de pé"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    adicionarNovoTipoPe();
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setModalNovoTipoPeAberto(false);
                                  setNovoTipoPe('');
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                onClick={adicionarNovoTipoPe}
                                disabled={!novoTipoPe.trim()}
                              >
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* Modal de Confirmação para Excluir Tipo de Pé */}
                      <Dialog open={!!tipoPeParaExcluir} onOpenChange={() => setTipoPeParaExcluir(null)}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Excluir Tipo de Pé</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Tem certeza que deseja excluir o tipo de pé <strong>"{tipoPeParaExcluir}"</strong>?
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTipoPeParaExcluir(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => tipoPeParaExcluir && excluirTipoPe(tipoPeParaExcluir)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Botão para adicionar novo produto (movido para baixo) */}
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <Button type="button" variant="outline" onClick={addItem}>
                      Adicionar novo produto
                    </Button>
                  </div>

                  {/* Produtos adicionais */}
                  {itensAdicionais.length > 0 && (
                    <div className="md:col-span-2 space-y-4">
                      <Label>Produtos adicionais</Label>
                      {itensAdicionais.map((item, index) => (
                        <div key={index} className="border rounded-md p-4 space-y-4 bg-muted/30">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Produto {index + 2}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>

                          {/* Campo de descrição removido aqui; ProdutoCampos renderiza a descrição do produto */}

                          {/* Upload de foto removido aqui para evitar duplicação; o ProdutoCampos gerencia a foto do produto */}

                          <ProdutoCampos
                            values={{
                              descricao: item.descricao,
                              fotosPedido: item.fotosPedido || [],
                              tipoSofa: item.tipoSofa,
                              cor: item.cor,
                              dimensaoLargura: item.dimensaoLargura || '',
                              dimensaoComprimento: item.dimensaoComprimento || '',
                              tipoServico: item.tipoServico,
                              precoUnitario: item.precoUnitario,
                              observacoes: item.observacoes,
                              espuma: item.espuma,
                              tecido: item.tecido,
                              braco: item.braco,
                              tipoPe: item.tipoPe,
                              descontoTipo: item.descontoTipo,
                              descontoValor: item.descontoValor,
                            }}
                            onChange={(field, value) => handleItemChange(index, field as any, value)}
                            onFotosChange={(imgs) => handleItemFotosChange(index, imgs)}
                            onDimensaoChange={(field, value) => handleItemDimensaoChange(index, field, value)}
                            imageFolder={`fotos-pedido/item-${index + 2}`}
                            tiposSofaDisponiveis={tiposSofaDisponiveis}
                            coresDisponiveis={coresDisponiveis}
                            tiposServicoDisponiveis={tiposServicoDisponiveis}
                            espumasDisponiveis={espumasDisponiveis}
                            bracosDisponiveis={bracosDisponiveis}
                            tiposPeDisponiveis={tiposPeDisponiveis}
                            setModalNovoTipoSofaAberto={setModalNovoTipoSofaAberto}
                            setModalNovaCorAberto={setModalNovaCorAberto}
                            setModalNovoTipoServicoAberto={setModalNovoTipoServicoAberto}
                            setModalNovaEspumaAberto={setModalNovaEspumaAberto}
                            setModalNovoBracoAberto={setModalNovoBracoAberto}
                            setModalNovoTipoPeAberto={setModalNovoTipoPeAberto}
                            setTipoSofaParaExcluir={setTipoSofaParaExcluir}
                            setCorParaExcluir={setCorParaExcluir}
                            setTipoServicoParaExcluir={setTipoServicoParaExcluir}
                            setEspumaParaExcluir={setEspumaParaExcluir}
                            setBracoParaExcluir={setBracoParaExcluir}
                            setTipoPeParaExcluir={setTipoPeParaExcluir}
                            etapasDisponiveis={etapasDisponiveis}
                            etapasSelecionadas={item.etapasNecessarias || []}
                            onToggleEtapa={(etapa) => toggleEtapaItem(index, etapa)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <Dialog open={tipoServicoParaExcluir !== null} onOpenChange={() => setTipoServicoParaExcluir(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>Tem certeza que deseja excluir o tipo de serviço "{tipoServicoParaExcluir}"?</p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setTipoServicoParaExcluir(null)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => tipoServicoParaExcluir && excluirTipoServico(tipoServicoParaExcluir)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Blocos do Produto 1 movidos para cima para separação por produto */}
                </CardContent>
              </Card>
            )
          }

          {/* Detalhes */}
          {
            wizardStep === 3 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Detalhes
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resumo: Total e Total+frete */}
                  <div className="md:col-span-2">
                    <div className="rounded-md border p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total dos produtos (com descontos nos itens)</span>
                        <span className="text-lg font-semibold">{totalProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Frete</span>
                        <span className="text-lg font-medium">{(parseValor(formData.frete || '')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>

                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm text-muted-foreground font-medium">Subtotal</span>
                        <span className="text-lg font-semibold">{totalComFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex flex-col gap-2 mb-2">
                          <Label>Desconto no Total do Pedido</Label>
                          <div className="w-full">
                            <DiscountInput
                              price={totalComFrete}
                              discountType={formData.pedidoDescontoTipo}
                              discountValue={parseFloat(formData.pedidoDescontoValor) || 0}
                              onDiscountTypeChange={(type) => setFormData(prev => ({ ...prev, pedidoDescontoTipo: type }))}
                              onDiscountValueChange={(value) => setFormData(prev => ({ ...prev, pedidoDescontoValor: value.toString() }))}
                              label=""
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t bg-muted/20 -mx-4 px-4 -mb-4 py-4 rounded-b-md">
                        <span className="text-lg font-bold">Total Final</span>
                        <span className="text-2xl font-bold text-green-600">{totalFinalPedido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    </div>
                  </div>
                  {/* Garantia (Pedido Geral) */}
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-base font-medium">Garantia</Label>
                    <Tabs value={formData.garantiaTipo} onValueChange={(v) => setFormData(prev => ({ ...prev, garantiaTipo: v, garantiaValor: '' }))}>
                      <TabsList className="mb-2">
                        <TabsTrigger value="dias">dias</TabsTrigger>
                        <TabsTrigger value="meses">meses</TabsTrigger>
                        <TabsTrigger value="anos">anos</TabsTrigger>
                      </TabsList>
                      <TabsContent value="dias">
                        <div className="grid grid-cols-3 gap-3">
                          <Button type="button" variant={formData.garantiaValor === '30' && formData.garantiaTipo === 'dias' ? 'default' : 'outline'} onClick={() => setFormData(prev => ({ ...prev, garantiaTipo: 'dias', garantiaValor: '30' }))}>30 dias</Button>
                          <Button type="button" variant={formData.garantiaValor === '90' && formData.garantiaTipo === 'dias' ? 'default' : 'outline'} onClick={() => setFormData(prev => ({ ...prev, garantiaTipo: 'dias', garantiaValor: '90' }))}>90 dias</Button>
                          <Input placeholder="Outros (dias)" value={formData.garantiaTipo === 'dias' && !['30', '90'].includes(formData.garantiaValor) ? formData.garantiaValor : ''} onChange={(e) => setFormData(prev => ({ ...prev, garantiaTipo: 'dias', garantiaValor: e.target.value }))} />
                        </div>
                      </TabsContent>
                      <TabsContent value="meses">
                        <div className="grid grid-cols-3 gap-3">
                          <Button type="button" variant={formData.garantiaValor === '3' && formData.garantiaTipo === 'meses' ? 'default' : 'outline'} onClick={() => setFormData(prev => ({ ...prev, garantiaTipo: 'meses', garantiaValor: '3' }))}>3 meses</Button>
                          <Button type="button" variant={formData.garantiaValor === '12' && formData.garantiaTipo === 'meses' ? 'default' : 'outline'} onClick={() => setFormData(prev => ({ ...prev, garantiaTipo: 'meses', garantiaValor: '12' }))}>12 meses</Button>
                          <Input placeholder="Outros (meses)" value={formData.garantiaTipo === 'meses' && !['3', '12'].includes(formData.garantiaValor) ? formData.garantiaValor : ''} onChange={(e) => setFormData(prev => ({ ...prev, garantiaTipo: 'meses', garantiaValor: e.target.value }))} />
                        </div>
                      </TabsContent>
                      <TabsContent value="anos">
                        <div className="grid grid-cols-3 gap-3">
                          <Button type="button" variant={formData.garantiaValor === '1' && formData.garantiaTipo === 'anos' ? 'default' : 'outline'} onClick={() => setFormData(prev => ({ ...prev, garantiaTipo: 'anos', garantiaValor: '1' }))}>1 ano</Button>
                          <Button type="button" variant={formData.garantiaValor === '3' && formData.garantiaTipo === 'anos' ? 'default' : 'outline'} onClick={() => setFormData(prev => ({ ...prev, garantiaTipo: 'anos', garantiaValor: '3' }))}>3 anos</Button>
                          <Input placeholder="Outros (anos)" value={formData.garantiaTipo === 'anos' && !['1', '3'].includes(formData.garantiaValor) ? formData.garantiaValor : ''} onChange={(e) => setFormData(prev => ({ ...prev, garantiaTipo: 'anos', garantiaValor: e.target.value }))} />
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="space-y-3">
                      <Button type="button" variant="secondary" onClick={() => setFormData(prev => ({ ...prev, garantiaTexto: `Este produto está efetivamente garantido contra eventuais defeitos de fabricação conforme prazos indicados abaixo, a partir da data de compra, sem prorrogação.\nReforma: Prazo TOTAL de 3 (três) meses.\nFabricação: Revestimentos: prazo total de 3 (três) meses, desde que o revestimento seja do mostruário Válleri. Não será concedida qualquer garantia ao revestimento quando o tecido for fornecido pelo próprio cliente ou tenha sido adquirido de empresa terceira por solicitação do mesmo.\nEstrutura (madeiras, espumas, percintas, mecanismos, pés, fibras naturais): prazo total de 12 (doze) meses.\n\nA garantia perderá a sua validade:\n• Em caso de mau uso, considerando a finalidade a que se destina o móvel e as orientações constantes neste termo:\n• Em caso de limpeza incorreta, falta de manutenção básica ao uso, aplicação de produtos químicos, tratamentos de proteção aplicados pelo comprador, detergentes, condicionadores, fluidos corporais ou danos devidos à exposição direta ou indireta à luz solar, umidade excessiva, calor excessivo, luminosidade intensa, ou condições semelhantes, bem como avaria de transporte, quando o mesmo for realizado pelo próprio consumidor;\n• Em caso de danos causados pela ação de cupins, insetos, broca ou outras pragas;\n• Se forem realizados, sem prévia autorização da fábrica, alterações, reparos ou substituições de partes do móvel, ou por qualquer meio danificar o produto por ato que praticar.\n\nSolicitação de Assistência Técnica:\n• O consumidor deverá entrar em contato através do canal de atendimento (81) 98771-4814 munido do pedido de compra, a fim de formalizar a solicitação de assistência técnica;\n• A Válleri se reserva o direito de efetuar avaliação técnica da solicitação;\n• Caso seja constatado uso inadequado ou a presença de quaisquer condições que excluem ou não compreendam a garantia do produto, as despesas decorrentes do transporte e da reforma serão por conta do cliente ou consumidor final.` }))}>
                        Gerar automaticamente
                      </Button>
                      <Textarea
                        value={formData.garantiaTexto}
                        onChange={(e) => handleInputChange('garantiaTexto', e.target.value)}
                        rows={8}
                        placeholder="Condições da garantia"
                      />
                      <div className="flex justify-end">
                        <Button type="button" onClick={() => toast({ title: 'Garantia salva', description: 'Campo de garantia atualizado no pedido.' })}>salvar garantia</Button>
                      </div>
                    </div>
                  </div>

                  {/* Termo de entrega e recebimento */}
                  <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Termo de entrega e recebimento</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Habilitar termo</span>
                        <Switch
                          checked={formData.termoEntregaAtivo}
                          onCheckedChange={(checked) =>
                            setFormData(prev => ({
                              ...prev,
                              termoEntregaAtivo: checked,
                              termoEntregaTexto: checked ? TERMO_ENTREGA_PADRAO : prev.termoEntregaTexto,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setFormData(prev => ({ ...prev, termoEntregaTexto: TERMO_ENTREGA_PADRAO, termoEntregaAtivo: true }))}
                      >
                        Gerar automaticamente
                      </Button>
                      <Textarea
                        value={formData.termoEntregaTexto}
                        onChange={(e) => handleInputChange('termoEntregaTexto', e.target.value)}
                        rows={10}
                        placeholder="Termo de entrega e recebimento"
                        disabled={!formData.termoEntregaAtivo}
                      />
                      <div className="flex justify-end">
                        <Button type="button" onClick={() => toast({ title: 'Termo salvo', description: 'Termo de entrega atualizado no pedido.' })}>salvar termo</Button>
                      </div>
                    </div>
                  </div>
                  {/* Forma de Pagamento */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Forma de Pagamento</Label>
                    <Input
                      value={formData.formaPagamento}
                      onChange={(e) => setFormData(prev => ({ ...prev, formaPagamento: e.target.value }))}
                      placeholder="Descreva a forma de pagamento (Ex: À vista, 50% entrada + 2x, etc)"
                    />
                  </div>

                  {/* Fotos de Controle */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Fotos de Controle
                    </Label>
                    <ImageUpload
                      images={formData.fotosControle}
                      onImagesChange={handleFotosControleChange}
                      maxImages={3}
                      bucketName="pedido-imagens"
                      folder="fotos-controle"
                    />
                  </div>
                </CardContent>
              </Card>
            )
          }

          {/* Botões de Ação por etapa */}
          {
            wizardStep < 3 ? (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/pedidos')}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleAvancarWizard(); }}
                  disabled={isLoading}
                >
                  Avançar
                </Button>
              </div>
            ) : (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/pedidos')}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditMode ? 'Atualizando...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEditMode ? 'Atualizar Pedido' : 'Salvar Pedido'}
                    </>
                  )}
                </Button>
              </div>
            )
          }
        </form >
      </motion.div >
    </DashboardLayout >
  );
};

export default NovoPedido;