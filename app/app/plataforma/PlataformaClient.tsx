'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { CommunityBar } from '../../components/CommunityBar';
import { ChannelList } from '../../components/ChannelList';
import { ChatArea } from '../../components/ChatArea';
import { MemberList } from '../../components/MemberList';
import { ProfileModal } from '../../components/ProfileModal';
import { WalletDrawer } from '../../components/WalletDrawer';
import { CreateChannelModal } from '../../components/CreateChannelModal';
import { QuickInvoiceModal } from '../../components/QuickInvoiceModal';
import { UserCard } from '../../components/UserCard';
import { CreateCommunityModal } from '../../components/CreateCommunityModal';
import { CommunitySettingsModal } from '../../components/CommunitySettingsModal';
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
  SERVICES_MODE,
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
  // En modo api no se muestra nada hasta tener los datos reales (sin parpadeo de los de ejemplo).
  const [ready, setReady] = useState<boolean>(SERVICES_MODE !== 'api');
  const [loadError, setLoadError] = useState<string | null>(null);
  // Tarjeta de perfil abierta (desde el chat o la lista de miembros) y "Transferir" a esa persona.
  const [profileCardUser, setProfileCardUser] = useState<User | null>(null);
  const [sendTo, setSendTo] = useState<{ recipient: string; nonce: number } | null>(null);
  // Saldo a mano (botón ↻) y notificaciones de pagos (revisa cada 20 s).
  const [isRefreshingWallet, setIsRefreshingWallet] = useState(false);
  const [lastSeenPayments, setLastSeenPayments] = useState<number>(0);
  const knownTxIds = useRef<Set<string> | null>(null);
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [isCommunitySettingsOpen, setIsCommunitySettingsOpen] = useState(false);

  // En pantallas chicas la lista de miembros arranca oculta (el chat necesita el espacio).
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1200) setIsMemberListOpen(false);
  }, []);
  const errorText = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

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
        let [user, comms, pk, balances, txs, stls] = await Promise.all([
          authService.getCurrentUser(),
          communityService.getCommunities(),
          walletService.getPublicKey(),
          walletService.getBalances(''),
          walletService.getTransactions(''),
          settlementService.getSettlements(),
        ]);

        if (!isMounted) return;

        // Link de invitación: /plataforma?c=<slug> te une y abre esa comunidad.
        const invited = new URLSearchParams(window.location.search).get('c');
        let invitedTarget = invited ? comms.find((c) => c.slug === invited) : undefined;
        if (invited && !invitedTarget && communityService.joinBySlug) {
          try {
            await communityService.joinBySlug(invited);
            comms = await communityService.getCommunities();
            invitedTarget = comms.find((c) => c.slug === invited);
            if (invitedTarget) setPayNotice({ kind: 'ok', text: `Te uniste a ${invitedTarget.name}.` });
          } catch (err) {
            setPayNotice({ kind: 'error', text: errorText(err, 'No pudimos unirte a esa comunidad.') });
          }
        }
        if (invitedTarget) {
          setActiveCommunityId(invitedTarget.id);
          if (invitedTarget.channels.length > 0) setActiveChannelId(invitedTarget.channels[0].id);
          window.history.replaceState(null, '', '/plataforma');
        }

        setCurrentUser(user);
        setCommunities(comms);
        setPublicKey(pk);
        setBalanceUSDC(balances.usdc);
        setBalanceXLM(balances.xlm);
        setTransactions(txs);
        setSettlements(stls);

        if (!invitedTarget && comms.length > 0 && !comms.some((c) => c.id === activeCommunityId)) {
          setActiveCommunityId(comms[0].id);
          if (comms[0].channels.length > 0) {
            setActiveChannelId(comms[0].channels[0].id);
          }
        }
        setReady(true);
      } catch (err) {
        console.error('[PlataformaPage] Error loading initial service data:', err);
        if (isMounted) setLoadError(errorText(err, 'No se pudieron cargar tus datos.'));
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const seenKey = `kosmovia:pagos-vistos:${publicKey}`;
  useEffect(() => {
    // Primera vez en este navegador: se cuenta desde ahora (el historial viejo no es "nuevo").
    try {
      const stored = Number(localStorage.getItem(seenKey));
      if (stored) setLastSeenPayments(stored);
      else {
        const now = Date.now();
        localStorage.setItem(seenKey, String(now));
        setLastSeenPayments(now);
      }
    } catch {
      setLastSeenPayments(Date.now());
    }
  }, [seenKey]);

  /** Trae saldo e historial; avisa si llegó dinero nuevo. `silent`: sin el giro del botón. */
  const refreshWallet = useCallback(
    async (silent = false) => {
      if (SERVICES_MODE !== 'api') return;
      if (!silent) setIsRefreshingWallet(true);
      try {
        const [balances, txs] = await Promise.all([
          walletService.getBalances(publicKey),
          walletService.getTransactions(publicKey),
        ]);
        setBalanceUSDC(balances.usdc);
        setBalanceXLM(balances.xlm);
        setTransactions(txs);
        const known = knownTxIds.current;
        if (known) {
          const incoming = txs.filter((t) => t.type === 'received' && !known.has(t.id));
          if (incoming.length > 0) {
            const t = incoming[0];
            setPayNotice({ kind: 'ok', text: `💸 Recibiste ${t.amount} ${t.asset} de ${t.counterparty}.` });
          }
        }
        knownTxIds.current = new Set(txs.map((t) => t.id));
      } catch (err) {
        if (!silent) setPayNotice({ kind: 'error', text: errorText(err, 'No se pudo actualizar el saldo.') });
      } finally {
        if (!silent) setIsRefreshingWallet(false);
      }
    },
    [publicKey]
  );

  useEffect(() => {
    if (!ready || SERVICES_MODE !== 'api') return;
    knownTxIds.current = new Set(transactions.map((t) => t.id));
    const timer = setInterval(() => void refreshWallet(true), 20_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, refreshWallet]);

  const unreadPayments = transactions.filter((t) => t.paidAt && Date.parse(t.paidAt) > lastSeenPayments).length;
  const markPaymentsSeen = () => {
    const now = Date.now();
    setLastSeenPayments(now);
    try {
      localStorage.setItem(seenKey, String(now));
    } catch {
      // Sin almacenamiento: el número vuelve a aparecer al recargar.
    }
  };

  // Al abrir la billetera: saldo e historial al día (también los pagos que te llegaron).
  useEffect(() => {
    if (!isWalletOpen || SERVICES_MODE !== 'api') return;
    let isMounted = true;
    Promise.all([walletService.getBalances(publicKey), walletService.getTransactions(publicKey)])
      .then(([balances, txs]) => {
        if (!isMounted) return;
        setBalanceUSDC(balances.usdc);
        setBalanceXLM(balances.xlm);
        setTransactions(txs);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [isWalletOpen, publicKey]);

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
      setPayNotice({ kind: 'error', text: errorText(err, 'No se pudo enviar el mensaje.') });
    }
  };

  const handleCreateChannel = async (name: string, topic: string): Promise<boolean> => {
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
      return true;
    } catch (err) {
      console.error('[PlataformaPage] Error creating channel:', err);
      setPayNotice({ kind: 'error', text: errorText(err, 'No se pudo crear el canal.') });
      return false;
    }
  };

  const handleCreateCommunity = async (input: { name: string; slug: string; description: string; image?: string }): Promise<boolean> => {
    try {
      const created = await communityService.createCommunity({ ...input, icon: '' });
      setCommunities((prev) => [...prev, created]);
      setActiveCommunityId(created.id);
      if (created.channels.length > 0) setActiveChannelId(created.channels[0].id);
      setPayNotice({ kind: 'ok', text: `Comunidad ${created.name} creada.` });
      return true;
    } catch (err) {
      setPayNotice({ kind: 'error', text: errorText(err, 'No se pudo crear la comunidad.') });
      return false;
    }
  };

  const handleSaveCommunityImage = async (image: string | null): Promise<boolean> => {
    try {
      const updated = await communityService.updateImage(activeCommunity.id, image);
      setCommunities((prev) => prev.map((c) => (c.id === updated.id ? { ...c, image: updated.image } : c)));
      setPayNotice({ kind: 'ok', text: 'Foto de la comunidad actualizada.' });
      return true;
    } catch (err) {
      setPayNotice({ kind: 'error', text: errorText(err, 'No se pudo guardar la foto.') });
      return false;
    }
  };

  const handleCreateInvoice = (amount: number, concept: string) => {
    const payload = JSON.stringify({ amount, concept });
    handleSendMessage(`[COBRO_B2B:${payload}]`);
  };

  /** Paga un cobro B2B a quien lo emitió (el autor del mensaje con la tarjeta). */
  const handlePayInvoice = async (amount: number, concept: string, payee: string): Promise<boolean> => {
    setPayNotice({ kind: 'info', text: `Pagando ${amount} USDC a ${payee}… (si usas Freighter, confirma ahí)` });
    try {
      // 1. Ejecutar pago no-custodia con servicio de wallet
      const newTx = await walletService.sendPayment({
        to: SERVICES_MODE === 'api' ? payee : `#${activeChannel.name}`,
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
      setPayNotice({ kind: 'ok', text: `Cobro pagado: ${amount} USDC a ${payee}.` });
      return true;
    } catch (err) {
      console.error('[PlataformaPage] Error paying invoice:', err);
      setPayNotice({ kind: 'error', text: errorText(err, 'No se pudo pagar el cobro.') });
      return false;
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

  const handleUpdateProfile = async (updated: { displayName: string; bio: string }): Promise<boolean> => {
    try {
      const user = await authService.updateProfile(updated);
      setCurrentUser(user);
      return true;
    } catch (err) {
      console.error('[PlataformaPage] Error updating profile:', err);
      setPayNotice({ kind: 'error', text: errorText(err, 'No se pudo guardar tu perfil.') });
      return false;
    }
  };

  const handleSendPayment = async (to: string, amount: number, asset: 'USDC' | 'XLM'): Promise<boolean> => {
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
      ).catch(() => {});
      return true;
    } catch (err) {
      console.error('[PlataformaPage] Error sending payment:', err);
      setPayNotice({ kind: 'error', text: errorText(err, 'No se pudo enviar el pago.') });
      return false;
    }
  };

  const currentMembers = (activeCommunity.members || []).map((m) =>
    m.id === currentUser.id ? { ...m, ...currentUser, role: m.role ?? currentUser.role } : m
  );

  const isCommunityOwner =
    SERVICES_MODE !== 'api' || currentMembers.find((m) => m.id === currentUser.id)?.role === 'admin';

  if (!ready) {
    return (
      <div className="login-page-container">
        <div className="login-box" role={loadError ? 'alert' : 'status'}>
          <p className="login-subtitle">{loadError ?? 'Cargando tus comunidades y tu billetera…'}</p>
          {loadError ? (
            <button type="button" className="btn-login-submit" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          ) : null}
        </div>
      </div>
    );
  }

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
        onCreateCommunity={() => setIsCreateCommunityOpen(true)}
        onOpenWallet={() => setIsWalletOpen((prev) => !prev)}
        isWalletOpen={isWalletOpen}
        balanceUSDC={balanceUSDC}
        notifications={{ transactions, unread: unreadPayments, onOpen: markPaymentsSeen }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <ChannelList
        community={activeCommunity}
        activeChannelId={activeChannel.id}
        onSelectChannel={handleSelectChannel}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
        isOwner={isCommunityOwner}
        onOpenSettings={() => setIsCommunitySettingsOpen(true)}
        onNotice={(text) => setPayNotice({ kind: 'ok', text })}
      />

      <ChatArea
        channel={activeChannel}
        community={activeCommunity}
        messages={messagesByChannel[activeChannel.id] || []}
        onSendMessage={handleSendMessage}
        onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
        onToggleMemberList={() => setIsMemberListOpen((prev) => !prev)}
        isMemberListOpen={isMemberListOpen}
        onOpenWallet={() => setIsWalletOpen((prev) => !prev)}
        isWalletOpen={isWalletOpen}
        currentUserId={currentUser.id}
        onOpenProfile={setProfileCardUser}
        onRefreshWallet={SERVICES_MODE === 'api' ? () => void refreshWallet() : undefined}
        isRefreshingWallet={isRefreshingWallet}
        notifications={{ transactions, unread: unreadPayments, onOpen: markPaymentsSeen }}
        balanceUSDC={balanceUSDC}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenQuickInvoice={() => setIsQuickInvoiceOpen(true)}
        onPayInvoice={handlePayInvoice}
      />

      <MemberList
        members={currentMembers}
        isOpen={isMemberListOpen}
        onOpenProfile={setProfileCardUser}
      />

      <UserCard
        user={profileCardUser}
        role={profileCardUser ? currentMembers.find((mm) => mm.id === profileCardUser.id)?.role : undefined}
        isSelf={profileCardUser?.id === currentUser.id}
        onClose={() => setProfileCardUser(null)}
        onTransfer={(username) => {
          setProfileCardUser(null);
          setSendTo({ recipient: username, nonce: Date.now() });
          setIsWalletOpen(true);
        }}
        onEditProfile={() => {
          setProfileCardUser(null);
          setIsProfileModalOpen(true);
        }}
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
        sendTo={sendTo}
        onRefresh={SERVICES_MODE === 'api' ? () => void refreshWallet() : undefined}
        isRefreshing={isRefreshingWallet}
      />

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreate={handleCreateChannel}
      />

      <CreateCommunityModal
        isOpen={isCreateCommunityOpen}
        onClose={() => setIsCreateCommunityOpen(false)}
        onCreate={handleCreateCommunity}
      />

      <CommunitySettingsModal
        community={activeCommunity}
        isOpen={isCommunitySettingsOpen}
        onClose={() => setIsCommunitySettingsOpen(false)}
        onSaveImage={handleSaveCommunityImage}
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
