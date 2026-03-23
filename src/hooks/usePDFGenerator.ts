import { useCallback, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '@/integrations/supabase/client';

interface Pedido {
  id: string;
  numero_pedido: string;
  tipo: string;
  data_entrega: string;
  espuma: string;
  tecido: string;
  tipo_pe: string;
  braco: string;
  status_producao: string;
  cliente_nome: string;
}

export const usePDFGenerator = () => {
  // Helper: formata número de telefone no padrão brasileiro
  const formatPhoneBR = (raw?: string) => {
    const onlyDigits = (raw || '').replace(/\D/g, '');
    if (!onlyDigits) return raw || '';
    let d = onlyDigits;
    // Remove código do país (55) se presente
    if (d.length >= 12 && d.startsWith('55')) {
      d = d.slice(2);
    }
    // Celular com 11 dígitos: (AA) N NNNN-NNNN
    if (d.length === 11) {
      return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7, 11)}`;
    }
    // Fixo com 10 dígitos: (AA) NNNN-NNNN
    if (d.length === 10) {
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6, 10)}`;
    }
    // Caso não bata, retorna como informado
    return raw || '';
  };
  // Modo captura por imagem (html2canvas + jsPDF) — permanece disponível como fallback
  const generatePDF = useCallback(async (pedidos: Pedido[], titulo: string) => {
    try {
      // Encontrar a tabela atual na tela
      const tableElement = document.querySelector('[data-table="pedidos-table"]') as HTMLElement;

      if (!tableElement) {
        throw new Error('Tabela não encontrada na tela');
      }

      // Criar um elemento temporário para captura otimizada
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = 'auto';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';

      // Ícone por área com fallback por label no título (— Área: ...)
      const getAreaEmojiFromTitle = (t: string) => {
        const match = t.match(/Área:\s(.+)$/);
        const label = match?.[1]?.toLowerCase() || '';
        if (label.includes('geral/todos')) return '📋';
        if (label.includes('marcenaria')) return '🔨';
        if (label.includes('corte') && label.includes('costura')) return '✂️';
        if (label.includes('espuma')) return '📦';
        if (label.includes('bancada')) return '🔧';
        if (label.includes('tecido')) return '👕';
        return '📋';
      };

      const getAreaInfoFromTitle = (t: string) => {
        const match = t.match(/Área:\s(.+)$/);
        const label = (match?.[1] || 'GERAL/TODOS').toLowerCase();
        if (label.includes('marcenaria')) return { label: 'Marcenaria', emoji: '🔨', color: '#8B4513' };
        if (label.includes('corte') && label.includes('costura')) return { label: 'Corte Costura', emoji: '✂️', color: '#D94646' };
        if (label.includes('espuma')) return { label: 'Espuma', emoji: '📦', color: '#14B8A6' };
        if (label.includes('bancada')) return { label: 'Bancada', emoji: '🔧', color: '#6B7280' };
        if (label.includes('tecido')) return { label: 'Tecido', emoji: '👕', color: '#8B5CF6' };
        return { label: 'GERAL/TODOS', emoji: '📋', color: '#334155' };
      };

      const areaInfo = getAreaInfoFromTitle(titulo);

      // Cabeçalho com ícone por área e fontes em dobro (título/subtítulo/data)
      const header = `
        <div style="margin-bottom: 24px;">
          <div style="display:flex; align-items:center; justify-content:center; gap:12px; background-color:${areaInfo.color}; color:#fff; padding:14px 16px; border-radius:10px;">
            <span style="font-size: 56px; line-height: 1;">${areaInfo.emoji}</span>
            <div style="text-align:center;">
              <div style="font-size: 36px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase;">Área de Produção: ${areaInfo.label}</div>
              <div style="font-size: 20px; opacity: .95;">${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 14px; border-bottom: 2px solid #333; padding-bottom: 12px;">
            <h1 style="color: #64748b; margin: 0; font-size: 56px; font-weight: bold;">Válleri</h1>
            <h2 style="color: #333; margin: 8px 0; font-size: 40px;">${titulo}</h2>
          </div>
        </div>
      `;

      // Clonar a tabela atual e otimizar para impressão
      const clonedTable = tableElement.cloneNode(true) as HTMLElement;

      // Aplicar estilos para impressão horizontal
      clonedTable.style.width = '100%';
      clonedTable.style.fontSize = '10px';
      clonedTable.style.borderCollapse = 'collapse';

      // Otimizar células da tabela
      const cells = clonedTable.querySelectorAll('td, th');
      cells.forEach((cell: any, index: number) => {
        cell.style.padding = '8px 6px';
        cell.style.border = '1px solid #ddd';
        cell.style.fontSize = '9px';
        cell.style.lineHeight = '1.3';
        cell.style.verticalAlign = 'top';
        cell.style.wordWrap = 'break-word';
        cell.style.whiteSpace = 'normal';
        cell.style.overflow = 'visible';

        // Definir larguras específicas para cada coluna
        const columnIndex = index % 12; // Assumindo 12 colunas
        switch (columnIndex) {
          case 0: // Nº Pedido
            cell.style.minWidth = '60px';
            cell.style.maxWidth = '80px';
            break;
          case 1: // Tipo
            cell.style.minWidth = '80px';
            cell.style.maxWidth = '120px';
            break;
          case 2: // Entrega
            cell.style.minWidth = '70px';
            cell.style.maxWidth = '90px';
            break;
          case 3: // Espuma
            cell.style.minWidth = '50px';
            cell.style.maxWidth = '70px';
            break;
          case 4: // Tecido
            cell.style.minWidth = '100px';
            cell.style.maxWidth = '150px';
            break;
          case 5: // Tipo Pé
            cell.style.minWidth = '80px';
            cell.style.maxWidth = '120px';
            break;
          case 6: // Braço
            cell.style.minWidth = '60px';
            cell.style.maxWidth = '100px';
            break;
          case 7: // Status
            cell.style.minWidth = '80px';
            cell.style.maxWidth = '120px';
            break;
          case 8: // Cliente
            cell.style.minWidth = '100px';
            cell.style.maxWidth = '150px';
            break;
          default:
            cell.style.minWidth = '60px';
            cell.style.maxWidth = '100px';
        }
      });

      // Remover elementos desnecessários (botões de ação, etc.)
      const actionButtons = clonedTable.querySelectorAll('button, .action-buttons, [data-action]');
      actionButtons.forEach(button => button.remove());

      // Rodapé compacto
      const footer = `
        <div style="margin-top: 15px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px;">
          <p style="color: #666; margin: 0; font-size: 10px;">
            Total de pedidos: ${pedidos.length} | Sistema Válleri
          </p>
        </div>
      `;

      tempDiv.innerHTML = header + clonedTable.outerHTML + footer;
      document.body.appendChild(tempDiv);

      // Capturar como imagem com alta qualidade
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        logging: false,
        imageTimeout: 0
      });

      document.body.removeChild(tempDiv);

      // Criar PDF em formato A4 HORIZONTAL (paisagem)
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' = landscape (horizontal)
      const pageWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm

      const imgWidth = pageWidth - 20; // Margem de 10mm de cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // Margem superior

      // Adicionar primeira página
      if (imgHeight <= pageHeight - 20) {
        // Se couber em uma página, centralizar verticalmente
        const yPosition = (pageHeight - imgHeight) / 2;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, yPosition, imgWidth, imgHeight);
      } else {
        // Se não couber, usar paginação
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);

        // Adicionar páginas adicionais se necessário
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - 20);
        }
      }

      // Salvar o PDF
      const fileName = `relatorio-pedidos-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar o PDF. Tente novamente.');
    }
  }, []);

  // PDF "Pedido do Cliente" alinhado ao layout da OS, adicionando apenas a seção Pagamento
  const generatePedidoClientePDF = useCallback(async (pedidoId: string) => {
    try {
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();
      if (pedidoError) throw pedidoError;

      // Buscar dados completos do cliente (se houver cliente_id)
      let clienteDetalhes: any | null = null;
      if (pedido.cliente_id) {
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', pedido.cliente_id)
          .single();
        if (!clienteError && clienteData) {
          clienteDetalhes = clienteData;
        }
      }

      // Buscar dados do vendedor
      let vendedorNome = 'Vinicius Bruno Costa Dantas';
      if (pedido.vendedor_id) {
        const { data: vendedorData } = await supabase
          .from('vendedores')
          .select('nome')
          .eq('id', pedido.vendedor_id)
          .single();
        if (vendedorData?.nome) {
          vendedorNome = vendedorData.nome;
        }
      }

      const { data: itens, error: itensError } = await supabase
        .from('pedido_itens')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('sequencia', { ascending: true });
      if (itensError) throw itensError;

      const { data: anexos, error: anexosError } = await supabase
        .from('pedido_anexos')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('created_at', { ascending: true });
      if (anexosError) throw anexosError;

      const numero = pedido.numero_pedido || '—';
      const anoAtual = new Date().getFullYear();

      // Mapear fotos por item como na OS
      const fotosPedido = (anexos || []).filter((a: any) => a.descricao === 'foto_pedido');
      const fotosPorItem: Record<string, any[]> = {};
      (fotosPedido || []).forEach((f: any) => {
        const chave = f.pedido_item_id ? String(f.pedido_item_id) : 'sem_item';
        (fotosPorItem[chave] ||= []).push(f);
      });
      const usedPhotoIds: string[] = [];

      const currency = (v?: number | null) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const safe = (s?: string | null) => s || '—';

      // Função auxiliar de desconto
      const calculateFinalPrice = (price: number, type: string, value: number) => {
        if (!price) return 0;
        if (type === 'percentage') {
          return price * (1 - value / 100);
        } else {
          return Math.max(0, price - value);
        }
      };

      let totalProdutosCalculado = 0;
      let totalGross = 0;

      const produtosHTML = (Array.isArray(itens) && itens.length > 0 ? itens : [{
        descricao: pedido.descricao_sofa,
        tipo_sofa: pedido.tipo_sofa,
        tipo_servico: pedido.tipo_servico,
        cor: pedido.cor,
        dimensoes: pedido.dimensoes,
        espuma: pedido.espuma,
        tecido: pedido.tecido,
        braco: pedido.braco,
        tipo_pe: pedido.tipo_pe,
        preco_unitario: pedido.preco_unitario || pedido.valor_total || 0,
        observacoes: pedido.observacoes,
      }]).map((it: any, idx: number) => {
        const descricao = [safe(it.tipo_sofa), safe(it.tipo_servico)].filter(Boolean).join(' - ');
        const detalhes = [
          it.cor ? `Cor: ${it.cor}` : '',
          it.tecido ? `Tecido: ${it.tecido}` : '',
          it.espuma ? `Espuma: ${it.espuma}` : '',
          it.braco ? `Braço: ${it.braco}` : '',
          it.tipo_pe ? `Tipo Pé: ${it.tipo_pe}` : '',
          it.dimensoes ? `Dimensões: ${it.dimensoes}` : ''
        ].filter(Boolean).join(' • ');

        // Cálculos de preço item a item
        const precoUnitario = it.preco_unitario || 0;
        const descontoTipo = it.desconto_tipo || 'fixed';
        const descontoValor = it.desconto_valor || 0;
        const precoFinal = calculateFinalPrice(precoUnitario, descontoTipo, descontoValor);

        totalProdutosCalculado += precoFinal;
        totalGross += precoUnitario;

        // Visualização LIMPA (apenas preço original)
        const priceDisplay = currency(precoUnitario);
        const totalDisplay = currency(precoUnitario);

        const fotosItem = it.id ? (fotosPorItem[it.id] || []) : (idx === 0 ? (fotosPorItem['sem_item'] || []) : []);
        const primeiraFoto = fotosItem && fotosItem.length > 0 ? fotosItem[0] : null;
        if (primeiraFoto?.id) usedPhotoIds.push(primeiraFoto.id);
        const imagemItemHTML = primeiraFoto ? `
              <div style="width:120px; min-width:120px;">
                <img src="${primeiraFoto.url_arquivo}" style="width:120px; height:90px; object-fit:cover; border-radius:6px;" crossorigin="anonymous" />
              </div>
            ` : '';

        return `
          <tr>
            <td style="padding:10px; border-bottom:1px solid #eee;">
              <div style="display:flex; gap:12px; align-items:flex-start;">
                ${imagemItemHTML}
                <div style="flex:1;">
                  <div style="font-weight:600;">${descricao || safe(it.descricao)}</div>
                  ${detalhes ? `<div style="color:#555; font-size:12px; margin-top:4px;">${detalhes}</div>` : ''}
                </div>
              </div>
            </td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${priceDisplay}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">1</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${totalDisplay}</td>
          </tr>
        `;
      }).join('');

      // Cálculos finais do pedido (Frete + Desconto Global)
      // Cálculos finais do pedido
      const frete = pedido.frete || 0;
      const subtotalBaseCalculo = totalProdutosCalculado + frete;

      const pedidoDescontoTipo = pedido.desconto_tipo || 'fixed';
      const pedidoDescontoValor = pedido.desconto_valor || 0;
      const totalFinal = calculateFinalPrice(subtotalBaseCalculo, pedidoDescontoTipo, pedidoDescontoValor);

      const totalDescontos = (totalGross + frete) - totalFinal;

      const garantiasTexto = pedido.garantia_texto || `
        • Garantia contra defeitos de fabricação nas condições indicadas acima.
        • A garantia não cobre danos causados por mau uso, acidentes ou exposição indevida.
        • Em caso de necessidade, acione nossa assistência técnica pelos canais informados.
      `;

      const termoEntregaAtivo = pedido.termo_entrega_ativo ?? true;
      const termoEntregaTexto = pedido.termo_entrega_texto || `
        Recebi o produto em perfeito estado, sem defeitos de montagem ou avaria.
        Declaro que o ITEM É FUNCIONAL e não apresenta vício aparente.
      `;

      // Preparar logo oficial com fallback igual ao da OS
      const envLogo = (import.meta as any).env?.VITE_BRANDING_LOGO_URL as string | undefined;
      const lsLogo = typeof window !== 'undefined' ? window.localStorage.getItem('brandingLogoUrl') : null;
      const candidateLogos = ['/logo-sofaearte-oficial.png', '/logo-sofaearte-oficial.svg', lsLogo, envLogo].filter(Boolean) as string[];
      const resolveLogoSrc = async (): Promise<string> => {
        for (const url of candidateLogos) {
          const ok = await new Promise<boolean>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
          });
          if (ok) return url;
        }
        return '/placeholder.svg';
      };
      const logoSrc = await resolveLogoSrc();
      const logoImgTag = `<img src="${logoSrc}" crossorigin="anonymous" referrerpolicy="no-referrer" style="height:84px; width:auto;" />`;

      const brandMetallic = '#64748b';
      const headerHTML = `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:20px;">
          <div style="display:flex; align-items:center; gap:24px;">
            ${logoImgTag}
            <div>
              <div style="color:${brandMetallic}; font-size:18px; font-weight:700; margin-bottom:2px;">Válleri</div>
              <div style="display:flex; flex-direction:column; gap:0; color:#222; font-size:12px;">
                <div style="padding:2px 6px; line-height:14px;">VÁLLERI</div>
                <div style="padding:2px 6px; line-height:14px;">CNPJ: 38.827.698/0001-96</div>
                <div style="padding:2px 6px; line-height:14px;">Rua do Aragão, 70</div>
                <div style="padding:2px 6px; line-height:14px;">Boa Vista, Recife-PE</div>
                <div style="padding:2px 6px; line-height:14px;">CEP 50060-150</div>
              </div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px; min-width:220px;">
            <div style="background:#f5f5f5; color:#111; border-radius:8px; padding:6px 10px; font-size:12px; display:flex; align-items:center; gap:6px;">
              <!-- calendar icon -->
              <svg style="display:block; overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div style="display:flex; flex-direction:column; gap:0; font-size:12px; color:#333; overflow:visible; min-width:260px;">
              <div style="display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; min-height:16px; line-height:16px; padding:2px 6px;">
                <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${brandMetallic}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>
                <span style="display:flex; align-items:center; height:16px; line-height:16px;">sofaearterecife@gmail.com</span>
              </div>
              <div style="display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; min-height:16px; line-height:16px; padding:2px 6px;">
                <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${brandMetallic}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72 12.54 12.54 0 0 0 .65 2.73 2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l1.44-1.2a2 2 0 0 1 2.11-.45 12.54 12.54 0 0 0 2.73.65A2 2 0 0 1 22 16.92Z"/></svg>
                <span style="display:flex; align-items:center; height:16px; line-height:16px;">+55 (81) 97910-6729</span>
              </div>
              <div style="display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; min-height:16px; line-height:16px; padding:2px 6px;">
                <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${brandMetallic}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72 12.54 12.54 0 0 0 .65 2.73 2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l1.44-1.2a2 2 0 0 1 2.11-.45 12.54 12.54 0 0 0 2.73.65A2 2 0 0 1 22 16.92Z"/></svg>
                <span style="display:flex; align-items:center; height:16px; line-height:16px;">+55 (81) 98222-6725</span>
              </div>
              <div style="display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; min-height:16px; line-height:16px; padding:2px 6px;">
                <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${brandMetallic}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4"/></svg>
                <span style="display:flex; align-items:center; height:16px; line-height:16px;">(81) 98222-6725</span>
              </div>
            </div>
          </div>
        </div>
      `;

      const followWhatsHTML = `
        <div style="margin-top:10px; color:#333; font-size:12px;">Acompanhe o status do seu pedido no WhatsApp (81) 98222-6725 ou (81) 97910-6729</div>
      `;

      const instagramHTML = `
        <div style="margin-top:2px; margin-bottom:2px; color:#444; font-size:12px; display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; width:fit-content; line-height:16px;">
          <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
          <span style="display:flex; align-items:center; height:16px; line-height:16px;">@sofaearterecife</span>
        </div>
      `;

      const pedidoHeaderHTML = `
        <div style="margin-top:12px; background:${brandMetallic}; color:#fff; border-radius:4px; padding:8px 12px; width:100%; text-align:left;">
          <div style="font-size:16px; font-weight:700; letter-spacing:.3px; text-transform:uppercase;">Pedido do cliente ${numero}-${anoAtual}</div>
          <div style="font-size:12px; font-weight:400; opacity:0.9; margin-top:2px;">Vendedor: ${vendedorNome}</div>
        </div>
      `;

      const osHeaderHTML = `
        <div style="margin-top:12px; background:${brandMetallic}; color:#fff; border-radius:4px; padding:8px 12px; width:100%; text-align:left;">
          <div style="font-size:16px; font-weight:700; letter-spacing:.3px; text-transform:uppercase;">Ordem de serviço ${numero}-${anoAtual}</div>
           <div style="font-size:12px; font-weight:400; opacity:0.9; margin-top:2px;">Vendedor: ${vendedorNome}</div>
        </div>
      `;

      const cli = clienteDetalhes || {};
      const cpfCnpj = cli.cpf_cnpj || '';
      const telefone1 = pedido.cliente_telefone || cli.telefone || '';
      const telefone2 = cli.telefone2 || '';
      const emailCliente = pedido.cliente_email || cli.email || '';
      const enderecoCompleto = cli.endereco_completo || pedido.cliente_endereco || '';
      const bairro = cli.bairro || '';
      const cidadeEstado = [cli.cidade, cli.estado].filter(Boolean).join('-');
      const cep = cli.cep || '';

      const clienteHTML = `
        <div style="margin-top:16px; border:1px solid #eee; border-radius:8px; padding:12px; background:#fafafa;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <div style="color:#111; font-size:13px; font-weight:600;">Cliente: ${pedido.cliente_nome}</div>
              ${cpfCnpj ? `<div style="color:#111; font-size:12px;">CPF: ${cpfCnpj}</div>` : ''}
              ${enderecoCompleto ? `<div style="color:#111; font-size:12px;">${enderecoCompleto}</div>` : ''}
              ${bairro || cidadeEstado ? `<div style="color:#111; font-size:12px;">${[bairro, cidadeEstado].filter(Boolean).join(', ')}</div>` : ''}
              ${cep ? `<div style="color:#111; font-size:12px;">CEP ${cep}</div>` : ''}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end; text-align:right; color:#444; font-size:12px;">
              ${telefone1 ? `<div style="min-height:16px; line-height:16px;">${formatPhoneBR(telefone1)}</div>` : ''}
              ${telefone2 ? `<div style="min-height:16px; line-height:16px;">${formatPhoneBR(telefone2)}</div>` : ''}
              ${emailCliente ? `<div style="color:#555; font-size:12px;">${emailCliente}</div>` : ''}
            </div>
          </div>
        </div>
      `;

      const infosBasicasHTML = `
        <div style="margin-top:18px;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Informações básicas</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="background:#F9FAFB; border:1px solid #eee; border-radius:8px; padding:10px;">
              <div style="font-size:12px; color:#555;">Previsão de entrega</div>
              <div style="font-size:13px; font-weight:600;">${pedido.data_previsao_entrega ? format(new Date(pedido.data_previsao_entrega), 'dd/MM/yyyy', { locale: ptBR }) : 'A definir'}</div>
            </div>
            <div style="background:#F9FAFB; border:1px solid #eee; border-radius:8px; padding:10px;">
              <div style="font-size:12px; color:#555;">Observações</div>
              <div style="font-size:13px;">${safe(pedido.observacoes)}</div>
            </div>
          </div>
        </div>
      `;

      const pagamentoHTML = `
        <div style="margin-top:18px;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Pagamento</div>
          <div style="background:#F9FAFB; border:1px solid #eee; border-radius:8px; padding:10px;">
            <div style="font-size:12px; color:#555;">Forma de pagamento</div>
            <div style="font-size:13px; font-weight:600;">${safe(pedido.forma_pagamento)}</div>
          </div>
        </div>
      `;

      const produtosTabelaHTML = `
        <div style="margin-top:20px;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Produtos</div>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#F3F4F6;">
                <th style="text-align:left; padding:10px; font-size:12px;">Descrição</th>
                <th style="text-align:right; padding:10px; font-size:12px;">Preço unitário</th>
                <th style="text-align:center; padding:10px; font-size:12px;">Qtde</th>
                <th style="text-align:right; padding:10px; font-size:12px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${produtosHTML}
              <tr>
                <td colspan="3" style="padding:10px; text-align:right; font-weight:600; font-size: 12px;">Subtotal</td>
                <td style="padding:10px; text-align:right; font-weight:600; font-size: 12px;">${currency(totalGross)}</td>
              </tr>
              ${frete > 0 ? `
              <tr>
                <td colspan="3" style="padding:10px; text-align:right; color: #666; font-size: 12px;">Frete</td>
                <td style="padding:10px; text-align:right; color: #666; font-size: 12px;">${currency(frete)}</td>
              </tr>
              ` : ''}
              ${totalDescontos > 0 ? `
              <tr>
                <td colspan="3" style="padding:10px; text-align:right; color: #16a34a; font-size: 12px;">Desconto sobre produtos</td>
                <td style="padding:10px; text-align:right; color: #16a34a; font-size: 12px;">-${currency(totalDescontos)}</td>
              </tr>
              ` : ''}
              <tr>
                <td colspan="3" style="padding:10px; text-align:right; font-weight:700; font-size: 14px;">Total</td>
                <td style="padding:10px; text-align:right; font-weight:700; font-size: 14px;">${currency(totalFinal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      const garantiaHTML = `
        <div style="margin-top:18px;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Garantia</div>
          <div style="font-size:12px; color:#333; white-space:pre-line;">${garantiasTexto}</div>
        </div>
      `;

      const termoHTML = termoEntregaAtivo ? `
        <div style="margin-top:18px;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Termo de Entrega e Recebimento</div>
          <div style="font-size:12px; color:#333; white-space:pre-line;">${termoEntregaTexto}</div>
        </div>
      ` : '';

      // Monta container capturável (idêntico ao da OS, com Pagamento inserido)
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.style.padding = '24px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.innerHTML = `
        ${headerHTML}
        ${followWhatsHTML}
        ${instagramHTML}
        ${pedidoHeaderHTML}
        ${clienteHTML}
        ${infosBasicasHTML}
        ${pagamentoHTML}
        ${produtosTabelaHTML}
        ${garantiaHTML}
        ${termoHTML}
        
        <div style="margin-top:80px; display:flex; justify-content:space-between; align-items:flex-start; gap:20px; page-break-inside:avoid;">
          <div style="flex:1; text-align:center;">
            <div style="border-bottom:1px solid #000; margin-bottom:4px;"></div>
            <div style="font-size:12px; font-weight:600; color:#111;">Válleri</div>
            <div style="font-size:10px; color:#555;">CNPJ: 38.827.698/0001-96</div>
          </div>
          <div style="flex:1; text-align:center;">
            <div style="border-bottom:1px solid #000; margin-bottom:4px;"></div>
            <div style="font-size:12px; font-weight:600; color:#111;">${pedido.cliente_nome}</div>
            <div style="font-size:10px; color:#555;">${cpfCnpj || '111.111.111-01'}</div>
          </div>
        </div>
      `;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        logging: false,
        imageTimeout: 0
      });
      document.body.removeChild(tempDiv);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;

      const marginLeft = 10;
      const marginRight = 10;
      const marginTop = 8;    // mesma margem da OS
      const marginBottom = 10;

      const contentWidthMM = pageWidth - (marginLeft + marginRight);
      const pageAvailMM = pageHeight - (marginTop + marginBottom);
      const pageBreakGap = 2;
      const pageOverlap = 0;

      const pxPerMm = canvas.width / contentWidthMM;

      const findSafeCutRow = (sourceCanvas: HTMLCanvasElement, suggestedEndPx: number, windowPx: number): number => {
        const ctx = sourceCanvas.getContext('2d');
        if (!ctx) return suggestedEndPx;
        const width = sourceCanvas.width;
        const start = Math.max(0, Math.floor(suggestedEndPx - windowPx));
        const end = Math.min(sourceCanvas.height - 1, Math.floor(suggestedEndPx + windowPx));
        const sampleStepX = Math.max(1, Math.floor(width / 96));
        let bestRow = suggestedEndPx;
        let bestScore = -1;
        for (let y = start; y <= end; y++) {
          const row = ctx.getImageData(0, y, width, 1).data;
          let whiteCount = 0;
          let samples = 0;
          for (let x = 0; x < width; x += sampleStepX) {
            const idx = x * 4;
            const r = row[idx], g = row[idx + 1], b = row[idx + 2];
            const v = (r + g + b) / 3;
            if (v > 245) whiteCount++;
            samples++;
          }
          const score = whiteCount / Math.max(1, samples);
          if (score > bestScore) {
            bestScore = score;
            bestRow = y;
          }
        }
        return bestRow;
      };

      const addPagedCanvas = (pdfDoc: jsPDF, sourceCanvas: HTMLCanvasElement): { lastYMM: number } => {
        const firstSegmentPx = Math.max(0, Math.floor((pageAvailMM - pageBreakGap) * pxPerMm));
        const otherSegmentPx = Math.max(0, Math.floor((pageAvailMM - pageBreakGap) * pxPerMm));
        const scanWindowPx = Math.max(12, Math.floor(12 * pxPerMm));

        const makeSlice = (startYpx: number, heightPx: number): string => {
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = sourceCanvas.width;
          sliceCanvas.height = heightPx;
          const ctx = sliceCanvas.getContext('2d');
          if (!ctx) return sourceCanvas.toDataURL('image/png');
          ctx.drawImage(sourceCanvas, 0, startYpx, sourceCanvas.width, heightPx, 0, 0, sliceCanvas.width, sliceCanvas.height);
          return sliceCanvas.toDataURL('image/png');
        };

        let ypx = 0;

        const firstEndPx = findSafeCutRow(sourceCanvas, ypx + firstSegmentPx, scanWindowPx);
        const firstHeightPx = Math.max(0, firstEndPx - ypx);
        const firstDataUrl = makeSlice(ypx, firstHeightPx);
        const firstHeightMM = firstHeightPx / pxPerMm;
        pdfDoc.addImage(firstDataUrl, 'PNG', marginLeft, marginTop, contentWidthMM, firstHeightMM);
        pdfDoc.setFillColor(255, 255, 255);
        pdfDoc.rect(marginLeft, pageHeight - marginBottom - pageBreakGap, contentWidthMM, pageBreakGap, 'F');
        ypx = firstEndPx;
        let lastYMM = marginTop + firstHeightMM;

        while (ypx < sourceCanvas.height) {
          const suggestedEndPx = ypx + otherSegmentPx;
          const endPx = findSafeCutRow(sourceCanvas, suggestedEndPx, scanWindowPx);
          const slicePx = Math.max(0, Math.min(endPx - ypx, sourceCanvas.height - ypx));
          if (slicePx <= 0) break;

          pdfDoc.addPage();
          const dataUrl = makeSlice(ypx, slicePx);
          const heightMM = slicePx / pxPerMm;
          pdfDoc.addImage(dataUrl, 'PNG', marginLeft, marginTop, contentWidthMM, heightMM);
          pdfDoc.setFillColor(255, 255, 255);
          pdfDoc.rect(marginLeft, pageHeight - marginBottom - pageBreakGap, contentWidthMM, pageBreakGap, 'F');

          ypx = endPx;
          lastYMM = marginTop + heightMM;
        }
        return { lastYMM };
      };

      const { lastYMM } = addPagedCanvas(pdf, canvas);

      // Seções de fotos iguais à OS
      const fotosRestantes = fotosPedido.filter((f: any) => !usedPhotoIds.includes(f.id));
      const fotosControle = (anexos || []).filter((a: any) => a.descricao === 'foto_controle');

      const loadImageMeta = async (src: string): Promise<{ dataUrl: string; width: number; height: number }> => {
        return await new Promise((resolve, reject) => {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';
            img.onload = () => {
              const c = document.createElement('canvas');
              c.width = img.naturalWidth;
              c.height = img.naturalHeight;
              const ctx = c.getContext('2d');
              if (!ctx) return reject(new Error('Canvas context não disponível'));
              ctx.drawImage(img, 0, 0);
              const dataUrl = c.toDataURL('image/jpeg', 0.92);
              resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = async () => {
              try {
                const resp = await fetch(src, { mode: 'cors', cache: 'no-cache' });
                if (!resp.ok) throw new Error('Falha ao buscar imagem');
                const blob = await resp.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                  const dataUrl = reader.result as string;
                  resolve({ dataUrl, width: 1200, height: 900 });
                };
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(blob);
              } catch (e) {
                reject(e);
              }
            };
            img.src = src;
          } catch (e) {
            reject(e);
          }
        });
      };

      const addPhotosSection = async (tituloSecao: string, fotos: any[], startY?: number) => {
        if (!fotos || fotos.length === 0) return;
        const cols = 3;
        const gap = 6;
        const contentW = pageWidth - (marginLeft + marginRight);
        const cellW = (contentW - gap * (cols - 1)) / cols;
        const cellH = 60;

        let y = typeof startY === 'number' ? startY : (marginTop + 8);
        const titleHeight = 6;
        if (y + titleHeight > pageHeight - marginBottom) {
          pdf.addPage();
          y = marginTop + 8;
        }
        pdf.setFontSize(14);
        pdf.setTextColor(17);
        pdf.text(tituloSecao, marginLeft, y - 2);

        let x = marginLeft;
        y += 6;
        let colIndex = 0;

        for (const f of fotos) {
          if (y + cellH > pageHeight - marginBottom) {
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.setTextColor(17);
            pdf.text(tituloSecao, marginLeft, marginTop);
            y = marginTop + 8;
            colIndex = 0;
            x = marginLeft;
          }

          let meta: { dataUrl: string; width: number; height: number } | null = null;
          try {
            meta = await loadImageMeta(f.url_arquivo);
          } catch (e) {
            meta = null;
          }

          try {
            let imgWmm = cellW;
            let imgHmm = cellH;
            if (meta) {
              const ar = meta.width / meta.height;
              imgWmm = cellW;
              imgHmm = cellW / ar;
              if (imgHmm > cellH) {
                imgHmm = cellH;
                imgWmm = cellH * ar;
              }
            }

            const drawX = x + (cellW - imgWmm) / 2;
            const drawY = y + (cellH - imgHmm) / 2;

            pdf.addImage((meta?.dataUrl || f.url_arquivo), 'JPEG', drawX, drawY, imgWmm, imgHmm);
          } catch (e) {
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.rect(x, y, cellW, cellH);
            pdf.text('Imagem não pôde ser carregada', x + 4, y + cellH / 2);
          }

          try {
            const dateStr = f.created_at ? format(new Date(f.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '';
            if (dateStr) {
              pdf.setFontSize(9);
              pdf.setTextColor(85);
              pdf.text(dateStr, x + 2, y + cellH + 4);
            }
          } catch { }

          colIndex++;
          if (colIndex >= cols) {
            colIndex = 0;
            x = marginLeft;
            y += cellH + 12;
          } else {
            x += cellW + gap;
          }
        }
      };

      const startYPhotos = Math.min(pageHeight - marginBottom, lastYMM + 10);
      await addPhotosSection('Fotos do pedido', fotosRestantes, startYPhotos);
      await addPhotosSection('Fotos de controle', fotosControle, startYPhotos);

      const fileName = `pedido-cliente-${numero}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Erro ao gerar PDF do cliente:', err);
    }
  }, []);

  // PDF por Pedido (busca Supabase e gera layout multi-seções)
  const generatePedidoPDF = useCallback(async (pedidoId: string) => {
    try {
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();
      if (pedidoError) throw pedidoError;

      // Buscar dados completos do cliente (se houver cliente_id)
      let clienteDetalhes: any | null = null;
      if (pedido.cliente_id) {
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', pedido.cliente_id)
          .single();
        if (!clienteError && clienteData) {
          clienteDetalhes = clienteData;
        }
      }

      const { data: itens, error: itensError } = await supabase
        .from('pedido_itens')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('sequencia', { ascending: true });
      if (itensError) throw itensError;

      const { data: anexos, error: anexosError } = await supabase
        .from('pedido_anexos')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('created_at', { ascending: true });
      if (anexosError) throw anexosError;

      const currency = (v?: number | null) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const safe = (s?: string | null) => s || '—';
      const numero = pedido.numero_pedido;
      const anoAtual = new Date().getFullYear();

      // Mapear fotos por item ANTES de montar produtosHTML
      const fotosPorItem: Record<string, any[]> = {};
      (anexos || []).forEach((a: any) => {
        if (a.descricao === 'foto_pedido') {
          const key = a.pedido_item_id || 'sem_item';
          (fotosPorItem[key] ||= []).push(a);
        }
      });
      const usedPhotoIds: string[] = [];

      const produtosHTML = (Array.isArray(itens) && itens.length > 0 ? itens : [{
        descricao: pedido.descricao_sofa,
        tipo_sofa: pedido.tipo_sofa,
        tipo_servico: pedido.tipo_servico,
        cor: pedido.cor,
        dimensoes: pedido.dimensoes,
        espuma: pedido.espuma,
        tecido: pedido.tecido,
        braco: pedido.braco,
        tipo_pe: pedido.tipo_pe,
        preco_unitario: pedido.preco_unitario || pedido.valor_total || 0,
        observacoes: pedido.observacoes,
      }]).map((it: any, idx: number) => {
        const descricao = [safe(it.tipo_sofa), safe(it.tipo_servico)].filter(Boolean).join(' - ');
        const detalhes = [
          it.cor ? `Cor: ${it.cor}` : '',
          it.tecido ? `Tecido: ${it.tecido}` : '',
          it.espuma ? `Espuma: ${it.espuma}` : '',
          it.braco ? `Braço: ${it.braco}` : '',
          it.tipo_pe ? `Tipo Pé: ${it.tipo_pe}` : '',
          it.dimensoes ? `Dimensões: ${it.dimensoes}` : ''
        ].filter(Boolean).join(' • ');

        const fotosItem = it.id ? (fotosPorItem[it.id] || []) : (idx === 0 ? (fotosPorItem['sem_item'] || []) : []);
        const primeiraFoto = fotosItem && fotosItem.length > 0 ? fotosItem[0] : null;
        if (primeiraFoto?.id) usedPhotoIds.push(primeiraFoto.id);
        const imagemItemHTML = primeiraFoto ? `
              <div style="width:120px; min-width:120px;">
                <img src="${primeiraFoto.url_arquivo}" style="width:120px; height:90px; object-fit:cover; border-radius:6px;" crossorigin="anonymous" />
              </div>
            ` : '';

        return `
          <tr>
            <td style="padding:10px; border-bottom:1px solid #eee;">
              <div style="display:flex; gap:12px; align-items:flex-start;">
                ${imagemItemHTML}
                <div style="flex:1;">
                  <div style="font-weight:600;">${descricao || safe(it.descricao)}</div>
                  ${detalhes ? `<div style="color:#555; font-size:12px; margin-top:4px;">${detalhes}</div>` : ''}
                </div>
              </div>
            </td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">1</td>
          </tr>
        `;
      }).join('');

      const somaTotal = (Array.isArray(itens) ? itens.reduce((acc: number, it: any) => acc + (it.preco_unitario || 0), 0) : (pedido.valor_total || 0));

      const termoEntregaAtivo = pedido.termo_entrega_ativo ?? true;
      const termoEntregaTexto = pedido.termo_entrega_texto || `
        Recebi o produto em perfeito estado, sem defeitos de montagem ou avaria.
        Declaro que o ITEM É FUNCIONAL e não apresenta vício aparente.
      `;

      // Apenas manter a lista de fotos; mapeamento já foi movido para cima
      const fotosPedido = (anexos || []).filter((a: any) => a.descricao === 'foto_pedido');

      // Preparar logo oficial com fallback para evitar erro de imagem ausente
      const envLogo = (import.meta as any).env?.VITE_BRANDING_LOGO_URL as string | undefined;
      const lsLogo = typeof window !== 'undefined' ? window.localStorage.getItem('brandingLogoUrl') : null;
      // Priorizar arquivos locais do public para máxima compatibilidade
      const candidateLogos = ['/logo-sofaearte-oficial.png', '/logo-sofaearte-oficial.svg', lsLogo, envLogo].filter(Boolean) as string[];
      const resolveLogoSrc = async (): Promise<string> => {
        for (const url of candidateLogos) {
          const ok = await new Promise<boolean>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
          });
          if (ok) return url;
        }
        return '/placeholder.svg';
      };
      const logoSrc = await resolveLogoSrc();
      const logoImgTag = `<img src="${logoSrc}" crossorigin="anonymous" referrerpolicy="no-referrer" style="height:84px; width:auto;" />`;

      const brandMetallic = '#64748b';
      const headerHTML = `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:20px;">
          <div style="display:flex; align-items:center; gap:24px;">
            ${logoImgTag}
            <div>
              <div style="color:${brandMetallic}; font-size:18px; font-weight:700; margin-bottom:2px;">Válleri</div>
              <div style="display:flex; flex-direction:column; gap:0; color:#222; font-size:12px;">
                <div style="padding:2px 6px; line-height:14px;">VÁLLERI</div>
                <div style="padding:2px 6px; line-height:14px;">CNPJ: 38.827.698/0001-96</div>
                <div style="padding:2px 6px; line-height:14px;">Rua do Aragão, 70</div>
                <div style="padding:2px 6px; line-height:14px;">Boa Vista, Recife-PE</div>
                <div style="padding:2px 6px; line-height:14px;">CEP 50060-150</div>
              </div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px; min-width:220px;">
            <div style="background:#f5f5f5; color:#111; border-radius:8px; padding:6px 10px; font-size:12px; display:flex; align-items:center; gap:6px;">
              <!-- calendar icon -->
              <svg style="display:block; overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div style="display:flex; flex-direction:column; gap:0; font-size:12px; color:#333; overflow:visible; min-width:260px;">
              <div style="display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; min-height:16px; line-height:16px; padding:2px 6px;">
                <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${brandMetallic}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>
                <span style="display:flex; align-items:center; height:16px; line-height:16px;">sofaearterecife@gmail.com</span>
              </div>
              <div style="display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; min-height:16px; line-height:16px; padding:2px 6px;">
                <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${brandMetallic}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72 12.54 12.54 0 0 0 .65 2.73 2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l1.44-1.2a2 2 0 0 1 2.11-.45 12.54 12.54 0 0 0 2.73.65A2 2 0 0 1 22 16.92Z"/></svg>
                <span style="display:flex; align-items:center; height:16px; line-height:16px;">+55 (81) 97910-6729</span>
              </div>
              <div style="display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; min-height:16px; line-height:16px; padding:2px 6px;">
                <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${brandMetallic}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72 12.54 12.54 0 0 0 .65 2.73 2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l1.44-1.2a2 2 0 0 1 2.11-.45 12.54 12.54 0 0 0 2.73.65A2 2 0 0 1 22 16.92Z"/></svg>
                <span style="display:flex; align-items:center; height:16px; line-height:16px;">+55 (81) 98222-6725</span>
              </div>
              <div style="display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; min-height:16px; line-height:16px; padding:2px 6px;">
                <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${brandMetallic}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4"/></svg>
                <span style="display:flex; align-items:center; height:16px; line-height:16px;">(81) 98222-6725</span>
              </div>
            </div>
          </div>
        </div>
      `;

      const followWhatsHTML = `
        <div style="margin-top:10px; color:#333; font-size:12px;">Acompanhe o status do seu pedido no WhatsApp (81) 98222-6725 ou (81) 97910-6729</div>
      `;

      const instagramHTML = `
        <div style="margin-top:2px; margin-bottom:2px; color:#444; font-size:12px; display:grid; grid-template-columns:18px auto; align-items:center; column-gap:4px; width:fit-content; line-height:16px;">
          <svg style="display:block; transform: translateY(2px); overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
          <span style="display:flex; align-items:center; height:16px; line-height:16px;">@sofaearterecife</span>
        </div>
      `;

      const osHeaderHTML = `
        <div style="margin-top:12px; background:${brandMetallic}; color:#fff; border-radius:4px; padding:8px 12px; display:flex; align-items:center; justify-content:center; width:100%; text-align:center;">
          <div style="font-size:16px; font-weight:700; letter-spacing:.3px; text-transform:uppercase; transform: translateY(-7px);">Ordem de serviço ${numero}-${anoAtual}</div>
        </div>
      `;

      const cli = clienteDetalhes || {};
      const cpfCnpj = cli.cpf_cnpj || '';
      const telefone1 = pedido.cliente_telefone || cli.telefone || '';
      const telefone2 = cli.telefone2 || '';
      const emailCliente = pedido.cliente_email || cli.email || '';
      const enderecoCompleto = cli.endereco_completo || pedido.cliente_endereco || '';
      const bairro = cli.bairro || '';
      const cidadeEstado = [cli.cidade, cli.estado].filter(Boolean).join('-');
      const cep = cli.cep || '';



      const clienteHTML = `
        <div style="margin-top:16px; border:1px solid #eee; border-radius:8px; padding:12px; background:#fafafa;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <div style="color:#111; font-size:13px; font-weight:600;">Cliente: ${pedido.cliente_nome}</div>
              ${cpfCnpj ? `<div style="color:#111; font-size:12px;">CPF: ${cpfCnpj}</div>` : ''}
              ${enderecoCompleto ? `<div style="color:#111; font-size:12px;">${enderecoCompleto}</div>` : ''}
              ${bairro || cidadeEstado ? `<div style="color:#111; font-size:12px;">${[bairro, cidadeEstado].filter(Boolean).join(', ')}</div>` : ''}
              ${cep ? `<div style="color:#111; font-size:12px;">CEP ${cep}</div>` : ''}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end; text-align:right; color:#444; font-size:12px;">
              ${telefone1 ? `<div style="min-height:16px; line-height:16px;">${formatPhoneBR(telefone1)}</div>` : ''}
              ${telefone2 ? `<div style="min-height:16px; line-height:16px;">${formatPhoneBR(telefone2)}</div>` : ''}
              ${emailCliente ? `<div style="color:#555; font-size:12px;">${emailCliente}</div>` : ''}
            </div>
          </div>
        </div>
      `;

      const infosBasicasHTML = `
        <div style="margin-top:18px;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Informações básicas</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="background:#F9FAFB; border:1px solid #eee; border-radius:8px; padding:10px;">
              <div style="font-size:12px; color:#555;">Previsão de entrega</div>
              <div style="font-size:13px; font-weight:600;">${pedido.data_previsao_entrega ? format(new Date(pedido.data_previsao_entrega), 'dd/MM/yyyy', { locale: ptBR }) : 'A definir'}</div>
            </div>
            <div style="background:#F9FAFB; border:1px solid #eee; border-radius:8px; padding:10px;">
              <div style="font-size:12px; color:#555;">Observações</div>
              <div style="font-size:13px;">${safe(pedido.observacoes)}</div>
            </div>
          </div>
        </div>
      `;

      const produtosTabelaHTML = `
        <div style="margin-top:20px;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Produtos</div>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#F3F4F6;">
                <th style="text-align:left; padding:10px; font-size:12px;">Descrição</th>
                <th style="text-align:center; padding:10px; font-size:12px;">Qtde</th>
              </tr>
            </thead>
            <tbody>
              ${produtosHTML}
            </tbody>
          </table>
        </div>
      `;

      const termoHTML = termoEntregaAtivo ? `
        <div style="margin-top:18px;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Termo de Entrega e Recebimento</div>
          <div style="font-size:12px; color:#333; white-space:pre-line;">${termoEntregaTexto}</div>
        </div>
      ` : '';

      // Página de fotos: restantes por item + fotos de controle
      const fotosRestantes = fotosPedido.filter((f: any) => !usedPhotoIds.includes(f.id));
      const fotosControle = (anexos || []).filter((a: any) => a.descricao === 'foto_controle');
      const fotosHTML = (fotosRestantes.length > 0 || fotosControle.length > 0) ? `
        <div style="page-break-before:always;">
          <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:8px;">Fotos</div>
          ${fotosRestantes.length > 0 ? `
          <div style="font-size:12px; color:#555; margin-bottom:6px;">Fotos do pedido</div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
            ${fotosRestantes.map((f: any) => `
              <div style="border:1px solid #eee; border-radius:8px; padding:8px; background:#FAFAFA;">
                <img src="${f.url_arquivo}" style="width:100%; height:auto; object-fit:cover; border-radius:6px;" crossorigin="anonymous" />
                <div style="font-size:11px; color:#555; margin-top:6px;">${format(new Date(f.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}
          ${fotosControle.length > 0 ? `
          <div style="font-size:12px; color:#555; margin-top:14px; margin-bottom:6px;">Fotos de controle</div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
            ${fotosControle.map((f: any) => `
              <div style="border:1px solid #eee; border-radius:8px; padding:8px; background:#FAFAFA;">
                <img src="${f.url_arquivo}" style="width:100%; height:auto; object-fit:contain; border-radius:6px;" crossorigin="anonymous" />
                <div style="font-size:11px; color:#555; margin-top:6px;">${format(new Date(f.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
      ` : '';

      // Monta o container e captura
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.style.padding = '24px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      // Removido fotosHTML do bloco capturado para evitar cortes nas imagens ao dividir páginas.
      tempDiv.innerHTML = `
        ${headerHTML}
        ${followWhatsHTML}
        ${instagramHTML}
        ${osHeaderHTML}
        ${clienteHTML}
        ${infosBasicasHTML}
        ${produtosTabelaHTML}
        ${termoHTML}
      `;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        logging: false,
        imageTimeout: 0
      });

      document.body.removeChild(tempDiv);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;

      const marginLeft = 10;
      const marginRight = 10;
      const marginTop = 8;    // margem superior (reduzida)
      const marginBottom = 10; // margem inferior (reduzida)

      const contentWidthMM = pageWidth - (marginLeft + marginRight);
      const pageAvailMM = pageHeight - (marginTop + marginBottom);
      const pageBreakGap = 2;  // espaço em branco entre páginas (visível, reduzido)
      const pageOverlap = 0;   // sem sobreposição para evitar repetição de linha

      // Relação pixels/mm ao escalar o canvas para a largura útil do PDF
      const pxPerMm = canvas.width / contentWidthMM;

      // Encontra uma linha de corte segura (faixa com maioria branca) próxima ao fim sugerido
      const findSafeCutRow = (sourceCanvas: HTMLCanvasElement, suggestedEndPx: number, windowPx: number): number => {
        const ctx = sourceCanvas.getContext('2d');
        if (!ctx) return suggestedEndPx;
        const width = sourceCanvas.width;
        const start = Math.max(0, Math.floor(suggestedEndPx - windowPx));
        const end = Math.min(sourceCanvas.height - 1, Math.floor(suggestedEndPx + windowPx));
        const sampleStepX = Math.max(1, Math.floor(width / 96));
        let bestRow = suggestedEndPx;
        let bestScore = -1;
        for (let y = start; y <= end; y++) {
          const row = ctx.getImageData(0, y, width, 1).data;
          let whiteCount = 0;
          let samples = 0;
          for (let x = 0; x < width; x += sampleStepX) {
            const idx = x * 4;
            const r = row[idx], g = row[idx + 1], b = row[idx + 2];
            const v = (r + g + b) / 3; // brilho simples
            if (v > 245) whiteCount++;
            samples++;
          }
          const score = whiteCount / Math.max(1, samples);
          if (score > bestScore) {
            bestScore = score;
            bestRow = y;
          }
        }
        return bestRow;
      };

      // Função que recorta o canvas em segmentos e insere no PDF com gap visível
      const addPagedCanvas = (pdfDoc: jsPDF, sourceCanvas: HTMLCanvasElement): { lastYMM: number } => {
        const firstSegmentPx = Math.max(0, Math.floor((pageAvailMM - pageBreakGap) * pxPerMm));
        const otherSegmentPx = Math.max(0, Math.floor((pageAvailMM - pageBreakGap) * pxPerMm));
        const scanWindowPx = Math.max(12, Math.floor(12 * pxPerMm)); // ~12mm em px

        const makeSlice = (startYpx: number, heightPx: number): string => {
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = sourceCanvas.width;
          sliceCanvas.height = heightPx;
          const ctx = sliceCanvas.getContext('2d');
          if (!ctx) return sourceCanvas.toDataURL('image/png');
          ctx.drawImage(sourceCanvas, 0, startYpx, sourceCanvas.width, heightPx, 0, 0, sliceCanvas.width, sliceCanvas.height);
          return sliceCanvas.toDataURL('image/png');
        };

        let ypx = 0;

        // Primeira página — ajusta o fim para uma linha branca próxima
        const firstEndPx = findSafeCutRow(sourceCanvas, ypx + firstSegmentPx, scanWindowPx);
        const firstHeightPx = Math.max(0, firstEndPx - ypx);
        const firstDataUrl = makeSlice(ypx, firstHeightPx);
        const firstHeightMM = firstHeightPx / pxPerMm;
        pdfDoc.addImage(firstDataUrl, 'PNG', marginLeft, marginTop, contentWidthMM, firstHeightMM);
        // Gap visível no rodapé
        pdfDoc.setFillColor(255, 255, 255);
        pdfDoc.rect(marginLeft, pageHeight - marginBottom - pageBreakGap, contentWidthMM, pageBreakGap, 'F');
        ypx = firstEndPx;
        let lastYMM = marginTop + firstHeightMM;

        // Demais páginas
        while (ypx < sourceCanvas.height) {
          const suggestedEndPx = ypx + otherSegmentPx;
          const endPx = findSafeCutRow(sourceCanvas, suggestedEndPx, scanWindowPx);
          const slicePx = Math.max(0, Math.min(endPx - ypx, sourceCanvas.height - ypx));
          if (slicePx <= 0) break;

          pdfDoc.addPage();
          const dataUrl = makeSlice(ypx, slicePx);
          const heightMM = slicePx / pxPerMm;
          pdfDoc.addImage(dataUrl, 'PNG', marginLeft, marginTop, contentWidthMM, heightMM);
          // Gap visível no rodapé
          pdfDoc.setFillColor(255, 255, 255);
          pdfDoc.rect(marginLeft, pageHeight - marginBottom - pageBreakGap, contentWidthMM, pageBreakGap, 'F');

          ypx = endPx;
          lastYMM = marginTop + heightMM;
        }
        return { lastYMM };
      };

      const { lastYMM } = addPagedCanvas(pdf, canvas);

      // --- NOVO: Páginas de fotos sem cortes ---
      const loadImageMeta = async (src: string): Promise<{ dataUrl: string; width: number; height: number }> => {
        return await new Promise((resolve, reject) => {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';
            img.onload = () => {
              const c = document.createElement('canvas');
              c.width = img.naturalWidth;
              c.height = img.naturalHeight;
              const ctx = c.getContext('2d');
              if (!ctx) return reject(new Error('Canvas context não disponível'));
              ctx.drawImage(img, 0, 0);
              const dataUrl = c.toDataURL('image/jpeg', 0.92);
              resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = async () => {
              try {
                const resp = await fetch(src, { mode: 'cors', cache: 'no-cache' });
                if (!resp.ok) throw new Error('Falha ao buscar imagem');
                const blob = await resp.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                  const dataUrl = reader.result as string;
                  resolve({ dataUrl, width: 1200, height: 900 });
                };
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(blob);
              } catch (e) {
                reject(e);
              }
            };
            img.src = src;
          } catch (e) {
            reject(e);
          }
        });
      };

      const addPhotosSection = async (tituloSecao: string, fotos: any[], startY?: number) => {
        if (!fotos || fotos.length === 0) return;
        // Inserir um cabeçalho e grid 3-colunas, mantendo imagens inteiras (contain)
        const cols = 3;
        const gap = 6; // mm
        const contentW = pageWidth - (marginLeft + marginRight);
        const cellW = (contentW - gap * (cols - 1)) / cols; // mm
        const cellH = 60; // mm por célula (altura suficiente para manter proporções)

        // Decidir posição inicial: tentar continuar na mesma página logo abaixo do último texto
        let y = typeof startY === 'number' ? startY : (marginTop + 8);
        // Espaço necessário para título
        const titleHeight = 6; // mm aproximado
        // Se não couber o título na página atual, ir para nova página
        if (y + titleHeight > pageHeight - marginBottom) {
          pdf.addPage();
          y = marginTop + 8;
        }
        pdf.setFontSize(14);
        pdf.setTextColor(17); // #111
        pdf.text(tituloSecao, marginLeft, y - 2);

        let x = marginLeft;
        y += 6; // espaço abaixo do título
        let colIndex = 0;

        for (const f of fotos) {
          // Se não couber mais uma linha completa, ir para próxima página
          if (y + cellH > pageHeight - marginBottom) {
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.setTextColor(17);
            pdf.text(tituloSecao, marginLeft, marginTop);
            y = marginTop + 8;
            colIndex = 0;
            x = marginLeft;
          }

          // Pré-carregar imagem e metadados para ajustar proporção
          let meta: { dataUrl: string; width: number; height: number } | null = null;
          try {
            meta = await loadImageMeta(f.url_arquivo);
          } catch (e) {
            // Se falhar, tentar usar diretamente a URL (pode não funcionar em todos os casos)
            meta = null;
          }

          // Tentar adicionar imagem
          try {
            // Definir tamanho "contain" dentro da célula
            // Assumir proporção 4:3 como default se não conseguirmos natural sizes
            let imgWmm = cellW;
            let imgHmm = cellH;
            if (meta) {
              // Ajustar proporção para "contain" dentro da célula
              const ar = meta.width / meta.height; // width/height
              imgWmm = cellW;
              imgHmm = cellW / ar; // altura correspondente
              if (imgHmm > cellH) {
                imgHmm = cellH;
                imgWmm = cellH * ar;
              }
            }

            // Centralizar dentro da célula
            const drawX = x + (cellW - imgWmm) / 2;
            const drawY = y + (cellH - imgHmm) / 2;

            pdf.addImage((meta?.dataUrl || f.url_arquivo), 'JPEG', drawX, drawY, imgWmm, imgHmm);
          } catch (e) {
            // Se houver erro na imagem, renderizar um placeholder
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.rect(x, y, cellW, cellH);
            pdf.text('Imagem não pôde ser carregada', x + 4, y + cellH / 2);
          }

          // Legenda com data
          try {
            const dateStr = f.created_at ? format(new Date(f.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '';
            if (dateStr) {
              pdf.setFontSize(9);
              pdf.setTextColor(85); // #555
              pdf.text(dateStr, x + 2, y + cellH + 4);
            }
          } catch { }

          // Avançar coluna
          colIndex++;
          if (colIndex >= cols) {
            // Próxima linha
            colIndex = 0;
            x = marginLeft;
            y += cellH + 12; // espaço vertical entre linhas
          } else {
            // Próxima coluna
            x += cellW + gap;
          }
        }
      };

      // Construir páginas específicas para fotos (pedido e controle)
      // Iniciar "Fotos" logo abaixo do último conteúdo, com uma pequena margem
      const startYPhotos = Math.min(pageHeight - marginBottom, lastYMM + 10);
      await addPhotosSection('Fotos do pedido', fotosRestantes, startYPhotos);
      await addPhotosSection('Fotos de controle', fotosControle, startYPhotos);

      const fileName = `pedido-${numero}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Erro ao gerar PDF do pedido:', err);
    }
  }, []);

  // Modo impressão nativa (react-to-print) — recomendado para manter layout e evitar cortes
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<string>('Relatório de Pedidos');

  // Estilos de página aplicados somente na impressão
  const pageStyle = `
    @page { size: A4 landscape; margin: 10mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .print-hide { display: none !important; }
      [data-action], .action-buttons { display: none !important; }
      .print-table { width: 100%; border-collapse: collapse; font-size: 8px !important; }
      .print-table * { font-size: inherit !important; }
      /* Neutralizar truncamento/ellipsis na impressão */
      .print-table .truncate { white-space: normal !important; overflow: visible !important; text-overflow: clip !important; }
      /* Conteúdo mais compacto */
      .print-table .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
      .print-table .py-2 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
      .print-table .gap-4 { gap: 0.25rem !important; }
      .print-table .text-sm { font-size: 0.6rem !important; } /* ~9.6px */
      .print-table .text-xs { font-size: 0.55rem !important; } /* ~8.8px */
      /* Remover largura mínima para caber melhor */
      .print-table .min-w-\\[1200px\\] { min-width: auto !important; }
      /* Quebra natural e alinhamento superior */
      .print-table div { white-space: normal !important; word-break: break-word !important; vertical-align: top !important; }
      /* Evitar quebra de linhas dentro de um item */
      .print-table tr { page-break-inside: avoid; }
    }
  `;

  const doPrint = useReactToPrint({
    // Compat: novas versões usam contentRef; mantemos content como fallback
    contentRef: printRef,
    documentTitle: titleRef.current,
    pageStyle,
    onBeforeGetContent: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
  });

  const printCurrentView = (title?: string) => {
    if (title) titleRef.current = title;
    doPrint?.();
  };

  return { generatePDF, generatePedidoPDF, generatePedidoClientePDF, printRef, printCurrentView, isPrinting };
};