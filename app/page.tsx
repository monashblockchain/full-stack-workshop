"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { TipForm } from "@/components/TipForm";
import { TipHistory } from "@/components/TipHistory";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink } from "lucide-react";
import type { Tip } from "@/lib/types";

export default function Home() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; color: string; left: string; delay: string }[]
  >([]);
  const { toast } = useToast();

  // Transaction confirmation modal
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [currentTx, setCurrentTx] = useState<{
    signature: string;
    recipient: string;
    amount: number;
    message?: string;
  } | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, [publicKey, connection]);

  // Fetch balance on connection change
  useEffect(() => {
    if (connected) {
      fetchBalance();
      // Set up interval to refresh balance every 15 seconds
      const intervalId = setInterval(fetchBalance, 15000);
      return () => clearInterval(intervalId);
    } else {
      setWalletBalance(null);
    }
  }, [connected, fetchBalance]);

  // Create confetti effect
  const createConfetti = useCallback(() => {
    const colors = ["#9945FF", "#14F195", "#00FFA3", "#FFFFFF"];
    const pieces = [];

    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.5}s`,
      });
    }

    setConfettiPieces(pieces);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!publicKey) return;

    try {
      // Use only the where clause without orderBy (no index needed)
      const q = query(
        collection(db, "tips"),
        where("fromWallet", "==", publicKey.toString())
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const tipsList: Tip[] = [];
          querySnapshot.forEach((doc) => {
            tipsList.push({ id: doc.id, ...doc.data() } as Tip);
          });

          // Sort the tips by timestamp manually
          tipsList.sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
            const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
            return timeB.getTime() - timeA.getTime(); // descending order
          });

          setTips(tipsList);
        },
        (error) => {
          console.error("Firestore error:", error);
          toast({
            variant: "destructive",
            title: "Error fetching tips",
            description: error.message,
          });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up Firestore listener:", error);
    }
  }, [publicKey, toast]);

  const handleSendTip = async (
    recipientAddress: string,
    amount: number,
    message: string
  ) => {
    if (!publicKey || !connected) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet first",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Validate recipient address
      let toPublicKey: PublicKey;
      try {
        toPublicKey = new PublicKey(recipientAddress);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid address",
          description: "The recipient address is not a valid Solana address",
        });
        setIsLoading(false);
        return;
      }

      // Check if balance is sufficient
      if (walletBalance !== null && amount > walletBalance) {
        toast({
          variant: "destructive",
          title: "Insufficient balance",
          description: `You need ${amount} SOL but only have ${walletBalance.toFixed(
            4
          )} SOL`,
        });
        setIsLoading(false);
        return;
      }

      // Create a Solana transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Send the transaction
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      // Store the tip in Firestore
      await addDoc(collection(db, "tips"), {
        fromWallet: publicKey.toString(),
        toWallet: recipientAddress,
        amount,
        message,
        timestamp: new Date(),
        txHash: signature,
      });

      // Update wallet balance
      fetchBalance();

      // Show success notification
      toast({
        title: "Tip sent successfully!",
        description: `${amount} SOL sent to ${recipientAddress.slice(
          0,
          4
        )}...${recipientAddress.slice(-4)}`,
        className: "bg-black border border-solana-purple/50 text-white",
      });

      // Show transaction confirmation modal
      setCurrentTx({
        signature,
        recipient: recipientAddress,
        amount,
        message,
      });
      setIsConfirmationOpen(true);

      // Create confetti effect
      createConfetti();

      setIsLoading(false);
    } catch (error) {
      console.error("Error sending tip:", error);
      toast({
        variant: "destructive",
        title: "Error sending tip",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="confetti"
              style={{
                backgroundColor: piece.color,
                left: piece.left,
                top: "-20px",
                animationDelay: piece.delay,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold solana-gradient-text animate-glow drop-shadow-solana-glow">
              One Tap Tip
            </h1>
            <p className="text-gray-400 mt-1">
              Send SOL tips with just one tap
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="wallet-adapter-dropdown">
              <WalletMultiButton />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="network-badge">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-solana-purple opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-solana-purple"></span>
                </span>
                Solana Devnet
              </Badge>

              {connected && walletBalance !== null && (
                <Badge
                  variant="outline"
                  className="bg-black/40 text-white border-white/10"
                >
                  Balance: {walletBalance.toFixed(4)} SOL
                </Badge>
              )}
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="transition-all duration-300 hover:translate-y-[-4px]">
            <TipForm onSendTip={handleSendTip} isLoading={isLoading} />
          </div>
          <div className="transition-all duration-300 hover:translate-y-[-4px]">
            <TipHistory tips={tips} />
          </div>
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>One Tap Tip © {new Date().getFullYear()} | Built on Solana</p>
          <p className="mt-1">
            All transactions are performed on Solana Devnet
          </p>
        </footer>
      </div>

      {/* Transaction Confirmation Modal */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="glassmorphism-card border-solana-purple/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-5 w-5 text-solana-teal" />
              Transaction Successful
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Your tip has been sent successfully
            </DialogDescription>
          </DialogHeader>

          {currentTx && (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-medium text-solana-teal">
                    {currentTx.amount} SOL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient</span>
                  <span className="font-medium text-white">
                    {currentTx.recipient.slice(0, 4)}...
                    {currentTx.recipient.slice(-4)}
                  </span>
                </div>
                {currentTx.message && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Message</span>
                    <span className="font-medium text-white">
                      {currentTx.message}
                    </span>
                  </div>
                )}
              </div>

              <a
                href={`https://explorer.solana.com/tx/${currentTx.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-black/30 text-solana-purple hover:text-solana-blue rounded-lg p-3 transition-colors"
              >
                View on Solana Explorer <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setIsConfirmationOpen(false)}
              className="w-full solana-button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
