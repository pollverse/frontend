"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Proposal } from "@/lib/types/dao";
import { format } from "date-fns";
import { CheckCircle, Clock, XCircle, Check, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProposalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
}

export function ProposalDetailsModal({ isOpen, onClose, proposal }: ProposalDetailsModalProps) {
  if (!proposal) return null;

  const statusIcons = {
    active: <Clock className="w-4 h-4 mr-1.5 text-amber-500" />,
    passed: <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />,
    rejected: <XCircle className="w-4 h-4 mr-1.5 text-red-500" />,
    executed: <Check className="w-4 h-4 mr-1.5 text-green-500" />,
    queued: <Clock className="w-4 h-4 mr-1.5 text-blue-500" />,
  };

  const statusText = {
    active: "Voting Active",
    passed: "Passed",
    rejected: "Rejected",
    executed: "Executed",
    queued: "Queued for Execution",
  };

  const statusColors = {
    active: "bg-amber-100 text-amber-800",
    passed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    executed: "bg-green-100 text-green-800",
    queued: "bg-blue-100 text-blue-800",
  };

  const startDate = new Date(proposal.startBlock);
  const endDate = new Date(proposal.endBlock);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">{proposal.title}</DialogTitle>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="mr-2">
                  {proposal.title.charAt(0).toUpperCase() + proposal.title.slice(1)}
                </Badge>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors.active}`}>
                  {statusIcons.active}
                  {statusText.active}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Proposal #{proposal.id}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="whitespace-pre-line">{proposal.description || "No description provided."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Voting Period</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starts</span>
                  <span>{format(startDate, 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ends</span>
                  <span>{format(endDate, 'MMM d, yyyy h:mm a')}</span>
                </div>
                {isActive && (
                  <div className="pt-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{
                          width: `${Math.min(100, ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days remaining
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Voting Results</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      For
                    </span>
                    <span>{proposal.forVotes.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ 
                        width: `${(proposal.forVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes)) * 100}%` 
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Against
                    </span>
                    <span>{proposal.againstVotes.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ 
                        width: `${(proposal.againstVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes)) * 100}%` 
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                      Abstain
                    </span>
                    <span>{proposal.abstainVotes.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-400" 
                      style={{ 
                        width: `${(proposal.abstainVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes)) * 100}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quorum</span>
                  <span>{proposal.quorum}% required</span>
                </div>
              </div>
            </div>
          </div>

          {proposal.status === 'active' && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-lg font-medium mb-3">Cast Your Vote</h3>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center px-4 py-2 border border-green-200 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <Check className="w-4 h-4 mr-2" />
                  Vote For
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-red-200 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <X className="w-4 h-4 mr-2" />
                  Vote Against
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Abstain
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
