"use client";

import { useState } from 'react';
import GlassCard from './GlassCard';

interface EscrowFormProps {
  onSubmit: (payee: string, amount: number, description: string) => void;
  loading: boolean;
  userStats: any;
}

export default function EscrowForm({ onSubmit, loading, userStats }: EscrowFormProps) {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payee && amount && description) {
      onSubmit(payee, parseFloat(amount), description);
      setPayee('');
      setAmount('');
      setDescription('');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <GlassCard>
          <h2 className="text-2xl font-bold mb-6">Create New Escrow</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Freelancer Address
              </label>
              <input
                type="text"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                placeholder="aleo1..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                Enter the Aleo wallet address of the freelancer. He must have registered as a freelancer.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the project requirements, deliverables, and timeline..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Amount (ALEO)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  min="1"
                  step="0.1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Milestones
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMilestones(num)}
                      className={`flex-1 py-3 rounded-lg transition-colors ${
                        milestones === num 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Payments will be split evenly across milestones
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between mb-4">
                <span>Milestone Breakdown</span>
                <span className="font-semibold">{amount || 0} ALEO total</span>
              </div>
              
              <div className="space-y-3">
                {Array.from({ length: milestones }).map((_, index) => {
                  const milestoneAmount = amount ? (parseFloat(amount) / milestones).toFixed(2) : '0';
                  return (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div>
                        <span className="font-medium">Milestone {index + 1}</span>
                        <p className="text-sm text-gray-400">Upon completion of phase {index + 1}</p>
                      </div>
                      <span className="font-semibold">{milestoneAmount} ALEO</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !payee || !amount || !description}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating Escrow...' : 'Create Secure Escrow'}
            </button>
            
            <div className="text-sm text-gray-400 text-center">
              <p>✅ Funds are held securely in escrow until milestones are approved</p>
              <p>✅ All transactions are private and secure on Aleo blockchain</p>
            </div>
          </form>
        </GlassCard>
      </div>
      
      <GlassCard>
        <h3 className="text-xl font-bold mb-4">How it Works</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold">Create Escrow</h4>
              <p className="text-sm text-gray-400">Funds are locked in a smart contract</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold">Work Delivered</h4>
              <p className="text-sm text-gray-400">Freelancer submits completed milestones</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold">Approve & Pay</h4>
              <p className="text-sm text-gray-400">You approve work and release payment</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <h4 className="font-semibold mb-2">Your Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Projects Created</span>
                <span className="font-semibold">{userStats.totalProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate</span>
                <span className="font-semibold">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Client Rating</span>
                <span className="font-semibold">{userStats.rating} ⭐</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}