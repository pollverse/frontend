'use client'
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useGovernorFactory } from "@/hooks/useGovernorFactory"
import { toast } from "sonner"
import { TokenType } from "@/lib/types/dao";

type DaoFormData = {
  // Step 1: Basic Info
  daoName: string;
  daoDescription: string;
  metadataURI: string;
  
  // Step 2: Token Config
  tokenType: TokenType;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
  maxSupply: string;
  baseURI: string;
  
  // Step 3: Governance Params
  votingDelay: string; // blocks
  votingPeriod: string; // blocks
  proposalThreshold: string;
  timelockDelay: string; // seconds
  quorumPercentage: string; // 1-100
};

const INITIAL_FORM_DATA: DaoFormData = {
  daoName: '',
  daoDescription: '',
  metadataURI: '',
  tokenType: TokenType.ERC20,
  tokenName: '',
  tokenSymbol: '',
  initialSupply: '',
  maxSupply: '',
  baseURI: '',
  votingDelay: '1',
  votingPeriod: '7200', // ~1 day in blocks (assuming 12s block time)
  proposalThreshold: '0',
  timelockDelay: '86400', // 1 day in seconds
  quorumPercentage: '51', // 4% quorum
};

const GOVERNOR_FACTORY_ADDRESS = process.env.NEXT_CELO_GOVERNOR_FACTORY_ADDRESS as `0x${string}`;

// Step components
const Step1BasicInfo = ({ formData, setFormData, errors }: { formData: DaoFormData, setFormData: (data: DaoFormData) => void, errors: Partial<Record<keyof DaoFormData, string>> }) => (
  <CardContent className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="daoName">DAO Name *</Label>
      <Input
        id="daoName"
        value={formData.daoName}
        onChange={(e) => setFormData({ ...formData, daoName: e.target.value })}
        placeholder="My Awesome DAO"
      />
      {errors.daoName && <p className="text-sm text-red-500">{errors.daoName}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="daoDescription">Description</Label>
      <textarea
        id="daoDescription"
        value={formData.daoDescription}
        onChange={(e) => setFormData({ ...formData, daoDescription: e.target.value })}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Describe your DAO's purpose and goals..."
        rows={4}
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="metadataURI">Metadata URI (optional)</Label>
      <Input
        id="metadataURI"
        value={formData.metadataURI}
        onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
        placeholder="ipfs://... or https://..."
      />
      <p className="text-sm text-muted-foreground">Link to additional metadata (logo, social links, etc.)</p>
    </div>
  </CardContent>
);

const Step2TokenConfig = ({ formData, setFormData, errors }: { formData: DaoFormData, setFormData: (data: DaoFormData) => void, errors: Partial<Record<keyof DaoFormData, string>> }) => (
  <CardContent className="space-y-6">
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Token Type</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={formData.tokenType === TokenType.ERC20 ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, tokenType: TokenType.ERC20 })}
            className="flex-1"
          >
            ERC20
          </Button>
          <Button
            type="button"
            variant={formData.tokenType === TokenType.ERC721 ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, tokenType: TokenType.ERC721 })}
            className="flex-1"
          >
            ERC721
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tokenName">Token Name *</Label>
          <Input
            id="tokenName"
            value={formData.tokenName}
            onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
            placeholder="My DAO Token"
          />
          {errors.tokenName && <p className="text-sm text-red-500">{errors.tokenName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tokenSymbol">Token Symbol *</Label>
          <Input
            id="tokenSymbol"
            value={formData.tokenSymbol}
            onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value })}
            placeholder={formData.tokenType === TokenType.ERC20 ? 'TOK' : 'NFT'}
            className="uppercase"
          />
          {errors.tokenSymbol && <p className="text-sm text-red-500">{errors.tokenSymbol}</p>}
        </div>
      </div>

      {formData.tokenType === TokenType.ERC20 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initialSupply">Initial Supply *</Label>
            <div className="relative">
              <Input
                id="initialSupply"
                type="number"
                min="0"
                value={formData.initialSupply}
                onChange={(e) => setFormData({ ...formData, initialSupply: e.target.value })}
                placeholder="1000000"
              />
            </div>
            {errors.initialSupply && <p className="text-sm text-red-500">{errors.initialSupply}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxSupply">Max Supply (optional)</Label>
            <Input
              id="maxSupply"
              type="number"
              min="0"
              value={formData.maxSupply}
              onChange={(e) => setFormData({ ...formData, maxSupply: e.target.value })}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="baseURI">Base URI (optional)</Label>
          <Input
            id="baseURI"
            value={formData.baseURI}
            onChange={(e) => setFormData({ ...formData, baseURI: e.target.value })}
            placeholder="ipfs://... or https://..."
          />
          <p className="text-sm text-muted-foreground">Base URI for token metadata (will be used for all tokens)</p>
        </div>
      )}
    </div>
  </CardContent>
);

const Step3GovernanceParams = ({ formData, setFormData, errors }: { formData: DaoFormData, setFormData: (data: DaoFormData) => void, errors: Partial<Record<keyof DaoFormData, string>> }) => {
  // Helper to convert blocks to human-readable time
  const blocksToTime = (blocks: number) => {
    const seconds = blocks * 12; // Assuming 12s block time
    const days = seconds / 86400;
    if (days >= 1) return `${days.toFixed(1)} days`;
    const hours = seconds / 3600;
    if (hours >= 1) return `${hours.toFixed(1)} hours`;
    return `${(seconds / 60).toFixed(1)} minutes`;
  };

  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="votingDelay">Voting Delay (blocks) *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="votingDelay"
              type="number"
              min="1"
              value={formData.votingDelay}
              onChange={(e) => setFormData({ ...formData, votingDelay: e.target.value })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              {formData.votingDelay ? blocksToTime(Number(formData.votingDelay)) : '0'} delay before voting starts
            </span>
          </div>
          {errors.votingDelay && <p className="text-sm text-red-500">{errors.votingDelay}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="votingPeriod">Voting Period (blocks) *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="votingPeriod"
              type="number"
              min="1"
              value={formData.votingPeriod}
              onChange={(e) => setFormData({ ...formData, votingPeriod: e.target.value })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              {formData.votingPeriod ? blocksToTime(Number(formData.votingPeriod)) : '0'} duration of voting
            </span>
          </div>
          {errors.votingPeriod && <p className="text-sm text-red-500">{errors.votingPeriod}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposalThreshold">Proposal Threshold *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="proposalThreshold"
              type="number"
              min="0"
              value={formData.proposalThreshold}
              onChange={(e) => setFormData({ ...formData, proposalThreshold: e.target.value })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Minimum tokens required to create a proposal (0 = anyone can propose)
            </span>
          </div>
          {errors.proposalThreshold && <p className="text-sm text-red-500">{errors.proposalThreshold}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timelockDelay">Timelock Delay (seconds) *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="timelockDelay"
              type="number"
              min="86400"
              value={formData.timelockDelay}
              onChange={(e) => setFormData({ ...formData, timelockDelay: e.target.value })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Minimum {Math.floor(Number(formData.timelockDelay || 0) / 86400)} days delay before executing proposals
            </span>
          </div>
          {errors.timelockDelay && <p className="text-sm text-red-500">{errors.timelockDelay}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quorumPercentage">Quorum Percentage *</Label>
          <div className="flex items-center gap-2">
            <div className="relative w-32">
              <Input
                id="quorumPercentage"
                type="number"
                min="1"
                max="100"
                value={formData.quorumPercentage}
                onChange={(e) => setFormData({ ...formData, quorumPercentage: e.target.value })}
                className="pr-8"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Minimum % of total supply required for a proposal to pass
            </span>
          </div>
          {errors.quorumPercentage && <p className="text-sm text-red-500">{errors.quorumPercentage}</p>}
        </div>
      </div>
    </CardContent>
  );
};

const Step4Review = ({ formData }: { formData: DaoFormData }) => {
  // Format the governance parameters for display
  const formatBlocks = (blocks: string) => {
    const blocksNum = Number(blocks);
    const days = (blocksNum * 12) / 86400; // 12s block time
    return `${blocks} blocks${days >= 1 ? ` (~${days.toFixed(1)} days)` : ''}`;
  };

  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">DAO Information</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {formData.daoName}</p>
            <p><span className="text-muted-foreground">Description:</span> {formData.daoDescription || 'None'}</p>
            {formData.metadataURI && <p><span className="text-muted-foreground">Metadata URI:</span> {formData.metadataURI}</p>}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-medium">Token Configuration</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p><span className="text-muted-foreground">Type:</span> {formData.tokenType}</p>
            <p><span className="text-muted-foreground">Name:</span> {formData.tokenName}</p>
            <p><span className="text-muted-foreground">Symbol:</span> {formData.tokenSymbol}</p>
            {formData.tokenType === 'ERC20' ? (
              <>
                <p><span className="text-muted-foreground">Initial Supply:</span> {Number(formData.initialSupply).toLocaleString()}</p>
                <p><span className="text-muted-foreground">Max Supply:</span> {formData.maxSupply ? Number(formData.maxSupply).toLocaleString() : 'Unlimited'}</p>
              </>
            ) : (
              <p><span className="text-muted-foreground">Base URI:</span> {formData.baseURI || 'None'}</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-medium">Governance Parameters</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p><span className="text-muted-foreground">Voting Delay:</span> {formatBlocks(formData.votingDelay)}</p>
            <p><span className="text-muted-foreground">Voting Period:</span> {formatBlocks(formData.votingPeriod)}</p>
            <p><span className="text-muted-foreground">Proposal Threshold:</span> {formData.proposalThreshold} tokens</p>
            <p><span className="text-muted-foreground">Timelock Delay:</span> {Math.floor(Number(formData.timelockDelay) / 86400)} days</p>
            <p><span className="text-muted-foreground">Quorum Percentage:</span> {formData.quorumPercentage}%</p>
          </div>
        </div>
      </div>
    </CardContent>
  );
};

const StepComplete = ({ onBackToDaos }: { onBackToDaos: () => void }) => (
  <div className="py-12 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
      <CheckCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
    </div>
    <h3 className="mt-4 text-lg font-medium text-gray-900">DAO Created Successfully!</h3>
    <p className="mt-2 text-sm text-gray-500">
      Your DAO has been deployed to the blockchain. You can now start managing your community.
    </p>
    <div className="mt-6">
      <Button onClick={onBackToDaos}>
        Back to DAOs
      </Button>
    </div>
  </div>
);

export default function CreateDAOPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DaoFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DaoFormData, string>>>({});
  
  const { isConnected, address } = useAccount();
  const router = useRouter();
  
  const { 
    createDAO, 
    isCreatingDAO, 
    daoCreationError, 
    createdDAO 
  } = useGovernorFactory(GOVERNOR_FACTORY_ADDRESS);

  const steps = [
    { id: '1', name: 'Basic Info' },
    { id: '2', name: 'Token Config' },
    { id: '3', name: 'Governance' },
    { id: '4', name: 'Review & Deploy' },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof DaoFormData, string>> = {};
    
    if (step === 1) {
      if (!formData.daoName.trim()) {
        newErrors.daoName = 'DAO name is required';
      }
    } else if (step === 2) {
      if (!formData.tokenName.trim()) {
        newErrors.tokenName = 'Token name is required';
      }
      if (!formData.tokenSymbol.trim()) {
        newErrors.tokenSymbol = 'Token symbol is required';
      }
      if (formData.tokenType === 'ERC20' && !formData.initialSupply) {
        newErrors.initialSupply = 'Initial supply is required for ERC20 tokens';
      }
    } else if (step === 3) {
      if (!formData.votingDelay || Number(formData.votingDelay) <= 0) {
        newErrors.votingDelay = 'Voting delay must be at least 1 block';
      }
      if (!formData.votingPeriod || Number(formData.votingPeriod) <= 0) {
        newErrors.votingPeriod = 'Voting period must be at least 1 block';
      }
      if (formData.proposalThreshold === '' || Number(formData.proposalThreshold) < 0) {
        newErrors.proposalThreshold = 'Proposal threshold cannot be negative';
      }
      if (!formData.timelockDelay || Number(formData.timelockDelay) < 86400) {
        newErrors.timelockDelay = 'Timelock delay must be at least 1 day (86400 seconds)';
      }
      if (!formData.quorumPercentage || 
          Number(formData.quorumPercentage) < 1 || 
          Number(formData.quorumPercentage) > 100) {
        newErrors.quorumPercentage = 'Quorum must be between 1% and 100%';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Map form data to CreateDAOParams
      const daoParams = {
        daoName: formData.daoName.trim(),
        daoDescription: formData.daoDescription.trim(),
        metadataURI: formData.metadataURI.trim() || '',
        tokenName: formData.tokenName.trim(),
        tokenSymbol: formData.tokenSymbol.trim(),
        initialSupply: BigInt(formData.initialSupply || '0'),
        maxSupply: formData.maxSupply ? BigInt(formData.maxSupply) : BigInt(0),
        votingDelay: Number(formData.votingDelay),
        votingPeriod: Number(formData.votingPeriod),
        proposalThreshold: BigInt(formData.proposalThreshold || '0'),
        timelockDelay: Number(formData.timelockDelay),
        quorumPercentage: Number(formData.quorumPercentage),
        tokenType: formData.tokenType === 'ERC20' ? TokenType.ERC20 : TokenType.ERC721,
        baseURI: formData.baseURI || '',
      };

      // Call the createDAO function from the hook
      await createDAO(daoParams);

      
      // If we get here, the transaction was successful
      setCurrentStep(5); // Show success step
      if (isCreatingDAO) {
        toast.loading('Creating DAO...');
      }
    } catch (error) {
      console.error('Error creating DAO:', error);
      if (daoCreationError) {
        toast.error(`Failed to create DAO: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
      if (createdDAO) {
        toast.success('DAO created successfully');
      }
    }
  };

  const handleBackToDaos = () => {
    router.push('/daos');
  };

  // If deployment was successful, show the success screen
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Create Your DAO</CardTitle>
              <CardDescription className="text-center">
                Step {currentStep} of {steps.length}
              </CardDescription>
              <div className="pt-4">
                <Progress value={100} className="h-2" />
              </div>
            </CardHeader>
            <StepComplete onBackToDaos={handleBackToDaos} />
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create Your DAO</CardTitle>
            <CardDescription className="text-center">
              Step {currentStep} of {steps.length}
            </CardDescription>
            <div className="pt-4">
              <Progress value={(currentStep / steps.length) * 100} className="h-2" />
            </div>
          </CardHeader>

          {currentStep === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} errors={errors} />}
          {currentStep === 2 && <Step2TokenConfig formData={formData} setFormData={setFormData} errors={errors} />}
          {currentStep === 3 && <Step3GovernanceParams formData={formData} setFormData={setFormData} errors={errors} />}
          {currentStep === 4 && <Step4Review formData={formData} />}

          <CardFooter className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {currentStep < steps.length ? (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting || isCreatingDAO}
              >
                {isSubmitting || isCreatingDAO ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating DAO...
                  </>
                ) : 'Create DAO'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}