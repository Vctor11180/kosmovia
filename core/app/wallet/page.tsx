import { WalletPanel } from "../../components/WalletPanel";

export default function Page() {
  return (
    <>
      <h1>Wallet</h1>
      <p className="muted">Tu saldo, enviar y recibir pagos, y fondos de prueba.</p>
      <WalletPanel />
    </>
  );
}
