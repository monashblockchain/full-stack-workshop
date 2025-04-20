"use client";

import type React from "react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Send, Copy, CheckCircle2 } from "lucide-react";

interface TipFormProps {
  onSendTip: (
    recipientAddress: string,
    amount: number,
    message: string
  ) => Promise<void>;
  isLoading: boolean;
}

export function TipForm({ onSendTip, isLoading }: TipFormProps) {
  const { connected } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Predefined amounts for quick selection
  const presetAmounts = [0.01, 0.05, 0.1, 0.5, 1];

  // Recent recipients (could be stored in localStorage in a real app)
  const recentRecipients = [
    {
      address: "GZNk9UMmQFyqKpF8LR6JcWxCZ4Ld7SvS7UimDWxBJvx",
      name: "Community Fund",
    },
    {
      address: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
      name: "Solana Foundation",
    },
    {
      address: "3DCzqgYJgEMGjzWj5SYK5NKN5L2MBHyiCRKaM4G5L2pR",
      name: "Developer DAO",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!recipientAddress || !amount) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await onSendTip(recipientAddress, Number.parseFloat(amount), message);
      // Reset form after successful submission
      setRecipientAddress("");
      setAmount("");
      setMessage("");
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectRecipient = (address: string) => {
    setRecipientAddress(address);
  };

  const handleSelectAmount = (amt: number) => {
    setAmount(amt.toString());
  };

  return (
    <Card className="glassmorphism-card card-highlight border-solana-purple/20">
      <div className="absolute inset-0 bg-card-gradient pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Send className="h-5 w-5 text-solana-purple" /> Send a Tip
        </CardTitle>
        <CardDescription className="text-gray-400">
          Send SOL to any wallet address on Solana Devnet
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-gray-300">
              Recipient Wallet Address
            </Label>
            <div className="relative">
              <Input
                id="recipient"
                placeholder="Enter Solana wallet address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                required
                className="glassmorphism-input pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onClick={() =>
                  recipientAddress && handleCopyAddress(recipientAddress)
                }
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-solana-teal" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Recent recipients */}
            {recentRecipients.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Recent recipients:</p>
                <div className="flex flex-wrap gap-2">
                  {recentRecipients.map((recipient, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectRecipient(recipient.address)}
                      className="text-xs bg-black/30 hover:bg-black/50 text-gray-300 px-2 py-1 rounded-md transition-colors"
                    >
                      {recipient.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">
              Amount (SOL)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.000000001"
              min="0"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="glassmorphism-input"
            />

            {/* Quick amount selection */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Quick amounts:</p>
              <div className="flex flex-wrap gap-2">
                {presetAmounts.map((amt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectAmount(amt)}
                    className="text-xs bg-black/30 hover:bg-black/50 text-gray-300 px-2 py-1 rounded-md transition-colors"
                  >
                    {amt} SOL
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a message with your tip"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="glassmorphism-input resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full solana-button group relative overflow-hidden"
            disabled={isLoading || !connected}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-solana-purple to-solana-blue opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Send className="mr-2 h-4 w-4" /> Send Tip
              </span>
            )}
          </Button>

          {!connected && (
            <p className="text-center text-sm text-solana-purple mt-2">
              Connect your wallet to send tips
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
