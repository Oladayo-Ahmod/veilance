import WalletConnect from "../ui/WalletConnect";

export default function WelcomeScreen() {
  return (
    <div className="text-center py-20">
      <h2 className="text-4xl font-bold mb-4">Welcome to Veilance</h2>
      <p className="text-xl text-gray-300 mb-8">Private, secure freelancing on the Aleo blockchain</p>
      <div className="max-w-md mx-auto">
        <WalletConnect />
      </div>
    </div>
  );
}