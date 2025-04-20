"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Clock, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tip } from "@/lib/types";

interface TipHistoryProps {
  tips: Tip[];
}

export function TipHistory({ tips }: TipHistoryProps) {
  const { connected } = useWallet();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    // Format relative time
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs} sec ago`;
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day ago`;

    // Fall back to date format for older dates
    return date.toLocaleDateString();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="glassmorphism-card card-highlight border-solana-blue/20 h-full">
      <div className="absolute inset-0 bg-card-gradient opacity-50 pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-solana-blue" /> My Tip History
        </CardTitle>
        <CardDescription className="text-gray-400">
          View all your sent tips
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {!connected ? (
          <div className="text-center text-gray-400 py-8 border border-dashed border-white/10 rounded-lg bg-black/20">
            Connect your wallet to view your tip history
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glassmorphism rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Skeleton className="h-5 w-32 bg-white/5" />
                    <Skeleton className="h-4 w-24 bg-white/5 mt-2" />
                  </div>
                  <Skeleton className="h-5 w-16 bg-white/5" />
                </div>
                <Skeleton className="h-4 w-full bg-white/5 mt-4" />
              </div>
            ))}
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center text-gray-400 py-8 border border-dashed border-white/10 rounded-lg bg-black/20">
            No tips sent yet
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="glassmorphism rounded-lg p-4 transition-all duration-300 hover:shadow-neon-blue hover:border-solana-blue/40 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-white flex items-center gap-1">
                      To:{" "}
                      <span className="text-solana-teal">
                        {shortenAddress(tip.toWallet)}
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(tip.toWallet, `addr-${tip.id}`)
                        }
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedId === `addr-${tip.id}` ? (
                          <CheckCircle2 className="h-3 w-3 text-solana-teal" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDate(tip.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-solana-blue">
                      {tip.amount} SOL
                    </p>
                  </div>
                </div>
                {tip.message && (
                  <p className="text-sm mt-2 border-t border-white/10 pt-2 text-gray-300">
                    {tip.message}
                  </p>
                )}
                {tip.txHash && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      {shortenAddress(tip.txHash)}
                      <button
                        onClick={() => handleCopy(tip.txHash, `tx-${tip.id}`)}
                        className="text-gray-500 hover:text-white transition-colors ml-1"
                      >
                        {copiedId === `tx-${tip.id}` ? (
                          <CheckCircle2 className="h-3 w-3 text-solana-teal inline" />
                        ) : (
                          <Copy className="h-3 w-3 inline" />
                        )}
                      </button>
                    </p>
                    <a
                      href={`https://explorer.solana.com/tx/${tip.txHash}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs text-solana-purple hover:text-solana-blue transition-colors"
                    >
                      View <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
