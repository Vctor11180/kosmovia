'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CommunityBar } from '../../components/CommunityBar';
import { ChannelList } from '../../components/ChannelList';
import { ChatArea } from '../../components/ChatArea';
import { MemberList } from '../../components/MemberList';
import { ProfileModal } from '../../components/ProfileModal';
import { WalletDrawer } from '../../components/WalletDrawer';
import { CreateChannelModal } from '../../components/CreateChannelModal';
import { QuickInvoiceModal } from '../../components/QuickInvoiceModal';
import { Channel, Community, Message, SettlementRecord, User, WalletTransaction } from '../../types';
import {
  authService,
  communityService,
  chatService,
  walletService,
  settlementService,
  INITIAL_USER,
  INITIAL_COMMUNITIES,
  INITIAL_MESSAGES,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTLEMENTS,
} from '../../services';

export function PlataformaPage() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [activeCommunityId, setActiveCommunityId] = useState<string>('comm-1');
  const [activeChannelId, setActiveChannelId] = useState<string>('chan-1');
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Tema Claro / Oscuro (Turquesa + Negro/Blanco)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modales de creación de canal y cobro B2B
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState<boolean>(false);
  const [isQuickInvoiceOpen, setIsQuickInvoiceOpen] = useState<boolean>(false);

  // Estados de Billetera Stellar
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [balanceUSDC, setBalanceUSDC] = useState<number>(185.0);
  const [balanceXLM, setBalanceXLM] = useState<number>(42.8);
  const [publicKey, setPublicKey] = useState<string>('GD26UBYVEYYVVOVCMOLPMIKPWQRFV34LK3I7LHBNTUGYHYIKFMEREH2A');
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [settlements, setSettlements] = useState<SettlementRecord[]>(INITIAL_SETTLEMENTS);
  // Borrador de integración: estado visible del pago (antes solo iba a la consola).
  const [payNotice, setPayNotice] = useState<{ kind: 'info' | 'ok' | 'error'; text: string } | null>(null);

  // Sincronizar tema con atributo en documentElement
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Carga inicial desacoplada desde la capa de servicios
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [user, comms, pk, balances, txs, stls] = await Promise.all([
          authService.getCurrentUser(),
          communityService.getCommunities(),
          walletService.getPublicKey(),
          walletService.getBalances(''),
          walletService.getTransactions(''),
          settlementService.getSettlements(),
        ]);

        if (!isMounted) return;

        setCurrentUser(user);
        setCommunities(comms);
        setPublicKey(pk);
        setBalanceUSDC(balances.usdc);
        setBalanceXLM(balances.xlm);
        setTransactions(txs);
        setSettlements(stls);

        if (comms.length > 0 && !comms.some((c) => c.id === activeCommunityId)) {
          setActiveCommunityId(comms[0].id);
          if (comms[0].channels.length > 0) {
            setActiveChannelId(comms[0].channels[0].id);
          }
        }
      } catch (err) {
        console.error('[PlataformaPage] Error loading initial service data:', err);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Suscripción en tiempo real y carga de mensajes por canal activo
  useEffect(() => {
    let isMounted = true;

    chatService.getMessages(activeChannelId).then((msgs) => {
      if (!isMounted) return;
      setMessagesByChannel((prev) => ({
        ...prev,
        [activeChannelId]: msgs,
      }));
    });

    const unsubscribe = chatService.subscribeToMessages(activeChannelId, (incomingMsg) => {
      if (!isMounted) return;
      setMessagesByChannel((prev) => {
        const current = prev[activeChannelId] || [];
        if (current.some((m) => m.id === incomingMsg.id)) {
          return prev;
        }
        return {
          ...prev,
          [activeChannelId]: [...current, incomingMsg],
        };
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeChannelId]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeCommunity = communities.find((c) => c.id === activeCommunityId) || communities[0];
  const activeChannel = activeCommunity.channels.find((ch) => ch.id === activeChannelId) || activeCommunity.channels[0];

  const handleSelectCommunity = (communityId: string) => {
    setActiveCommunityId(communityId);
    const targetCommunity = communities.find((c) => c.id === communityId);
    if (targetCommunity && targetCommunity.channels.length > 0) {
      setActiveChannelId(targetCommunity.channels[0].id);
    }
  };

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setIsMobileOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      const sentMsg = await chatService.sendMessage(activeChannel.id, text, currentUser);
      setMessagesByChannel((prev) => {
        const current = prev[activeChannel.id] || [];
        if (current.some((m) => m.id === sentMsg.id)) return prev;
        return {
          ...prev,
          [activeChannel.id]: [...current, sentMsg],
        };
      });
    } catch (err) {
      console.error('[PlataformaPage] Error sending message:', err);
    }
  };

  const handleCreateChannel = async (name: string, topic: string) => {
    try {
      const newChannel = await communityService.createChannel(activeCommunity.id, {
        name,
        topic: topic || 'Canal creado por la comunidad',
        type: 'text',
      });

      setCommunities((prev) =>
        prev.map((c) =>
          c.id === activeCommunity.id
            ? { ...c, channels: [...c.channels, newChannel] }
            : c
        )
      );

      setActiveChannelId(newChannel.id);

      await chatService.sendMessage(
        newChannel.id,
        `🎉 Canal #${name} creado con éxito. ¡Inicia la conversación!`,
        currentUser
      );
    } catch (err) {
      console.error('[PlataformaPage] Error creating channel:', err);
    }
  };

  const handleCreateInvoice = (amount: number, concept: string) => {
    const payload = JSON.stringify({ amount, concept });
    handleSendMessage(`[COBRO_B2B:${payload}]`);
  };

  const handlePayInvoice = async (amount: number, concept: string) => {
    try {
      // 1. Ejecutar pago no-custodia con servicio de wallet
      const newTx = await walletService.sendPayment({
        to: `#${activeChannel.name}`,
        amount,
        asset: 'USDC',
      });
      setTransactions((prev) => [newTx, ...prev]);

      const balances = await walletService.getBalances(publicKey);
      setBalanceUSDC(balances.usdc);

      // 2. Registrar liquidación B2B con deducción de fee (0.5%)
      const newSettlement = await settlementService.recordPayment({
        amount,
        concept,
        client: activeCommunity.name,
      });
      setSettlements((prev) => [newSettlement, ...prev]);

      // 3. Confirmar en el canal mediante el servicio de chat
      await chatService.sendMessage(
        activeChannel.id,
        `✅ Cobro saldado: ${amount} USDC por "${concept}". Fee 0.5% deducido (${newSettlement.feeUSDC} USDC). Transacción confirmada en Stellar Testnet.`,
        currentUser
      );
    } catch (err) {
      console.error('[PlataformaPage] Error paying invoice:', err);
    }
  };

  const handleDisbursePending = async () => {
    try {
      await settlementService.disburseBatch();
      const updated = await settlementService.getSettlements();
      setSettlements(updated);
    } catch (err) {
      console.error('[PlataformaPage] Error disbursing pending settlements:', err);
    }
  };

  const handleUpdateProfile = async (updated: { displayName: string; bio: string }) => {
    try {
      const user = await authService.updateProfile(updated);
      setCurrentUser(user);
    } catch (err) {
      console.error('[PlataformaPage] Error updating profile:', err);
    }
  };

  const handleSendPayment = async (to: string, amount: number, asset: 'USDC' | 'XLM') => {
    setPayNotice({ kind: 'info', text: `Enviando ${amount} ${asset} a ${to}… (si usas Freighter, confirma ahí)` });
    try {
      const newTx = await walletService.sendPayment({
        to,
        amount,
        asset,
      });
      setTransactions((prev) => [newTx, ...prev]);

      const balances = await walletService.getBalances(publicKey);
      setBalanceUSDC(balances.usdc);
      setBalanceXLM(balances.xlm);

      setPayNotice({ kind: 'ok', text: `Pago enviado: ${amount} ${asset} a ${to}.` });
      await chatService.sendMessage(
        activeChannel.id,
        `💸 He transferido ${amount} ${asset} a ${to} mediante Stellar Testnet (Tx verificada).`,
        currentUser
      );
    } catch (err) {
      console.error('[PlataformaPage] Error sending payment:', err);
      setPayNotice({ kind: 'error', text: err instanceof Error ? err.message : 'No se pudo enviar el pago.' });
    }
  };

  const currentMembers = (activeCommunity.members || []).map((m) =>
    m.id === currentUser.id ? { ...m, ...currentUser } : m
  );

  return (
    <div className={`app-container ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div
        className="mobile-backdrop"
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      <CommunityBar
        communities={communities}
        activeCommunityId={activeCommunity.id}
        onSelectCommunity={handleSelectCommunity}
      />

      <ChannelList
        community={activeCommunity}
        activeChannelId={activeChannel.id}
        onSelectChannel={handleSelectChannel}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
      />

      <ChatArea
        channel={activeChannel}
        community={activeCommunity}
        messages={messagesByChannel[activeChannel.id] || []}
        onSendMessage={handleSendMessage}
        onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
        onToggleMemberList={() => setIsMemberListOpen((prev) => !prev)}
        isMemberListOpen={isMemberListOpen}
        onOpenWallet={() => setIsWalletOpen(true)}
        balanceUSDC={balanceUSDC}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenQuickInvoice={() => setIsQuickInvoiceOpen(true)}
        onPayInvoice={handlePayInvoice}
      />

      <MemberList
        members={currentMembers}
        isOpen={isMemberListOpen}
      />

      <ProfileModal
        user={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleUpdateProfile}
        stellarAddress={publicKey}
      />

      <WalletDrawer
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balanceUSDC={balanceUSDC}
        balanceXLM={balanceXLM}
        publicKey={publicKey}
        transactions={transactions}
        onSend={handleSendPayment}
        settlements={settlements}
        onDisbursePending={handleDisbursePending}
      />

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreate={handleCreateChannel}
      />

      <QuickInvoiceModal
        isOpen={isQuickInvoiceOpen}
        onClose={() => setIsQuickInvoiceOpen(false)}
        onSubmit={handleCreateInvoice}
      />
      {payNotice ? (
        <div
          role={payNotice.kind === 'error' ? 'alert' : 'status'}
          onClick={() => payNotice.kind !== 'info' && setPayNotice(null)}
          style={{
            position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 1000,
            maxWidth: 'min(92vw, 520px)', padding: '12px 16px', borderRadius: 12, fontSize: 14, cursor: 'pointer',
            background: payNotice.kind === 'error' ? '#3a1616' : '#0b1f21',
            color: payNotice.kind === 'error' ? '#ffb4b4' : '#f2fbfa',
            border: `1px solid ${payNotice.kind === 'ok' ? '#2dd4bf' : payNotice.kind === 'error' ? '#f87171' : '#143235'}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          {payNotice.text}
        </div>
      ) : null}
    </div>
  );
}
