"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CheckCircle, FileText, Loader2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type ProposalType = 'core' | 'funding' | 'membership' | 'governance';

interface ProposalFormData {
  title: string;
  description: string;
  type: ProposalType;
  targets: string[];
  values: string[];
  calldatas: string[];
  metadataURI?: string;
}

const INITIAL_FORM_DATA: ProposalFormData = {
  title: '',
  description: '',
  type: 'governance',
  targets: [''],
  values: ['0'],
  calldatas: ['0x'],
};

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  daoId: string;
}

export function CreateProposalModal({ isOpen, onClose, daoId }: CreateProposalModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProposalFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [proposalId, setProposalId] = useState<string | null>(null);
  
  const { isConnected } = useAccount();

  const steps = [
    { id: '1', name: 'Basic Info' },
    { id: '2', name: 'Actions' },
    { id: '3', name: 'Review & Submit' },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Proposal title is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Proposal description is required';
      }
    } else if (step === 2) {
      formData.targets.forEach((target, index) => {
        if (!target) {
          newErrors[`targets.${index}`] = 'Target address is required';
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(target)) {
          newErrors[`targets.${index}`] = 'Invalid Ethereum address';
        }
        
        if (formData.values[index] === undefined || formData.values[index] === '') {
          newErrors[`values.${index}`] = 'Value is required';
        } else if (isNaN(Number(formData.values[index])) || Number(formData.values[index]) < 0) {
          newErrors[`values.${index}`] = 'Value must be a positive number';
        }
        
        if (!formData.calldatas[index]) {
          newErrors[`calldatas.${index}`] = 'Calldata is required';
        } else if (!formData.calldatas[index].startsWith('0x')) {
          newErrors[`calldatas.${index}`] = 'Calldata must start with 0x';
        }
      });
      
      if (formData.targets.length === 0) {
        newErrors.actions = 'At least one action is required';
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
    if (!validateStep(3)) return;
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual contract interaction
      console.log('Submitting proposal with data:', { ...formData, daoId });
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock proposal ID - in a real app, this would come from the contract
      const mockProposalId = Math.floor(Math.random() * 1000).toString();
      setProposalId(mockProposalId);
      setCurrentStep(4); // Show success step
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert(`Failed to create proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (proposalId) {
      // If proposal was created successfully, refresh the proposals list
      window.location.reload();
    }
    onClose();
  };

  // Reset form when modal is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    } else {
      // Reset form when opening
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
      setErrors({});
      setProposalId(null);
    }
  };

  // Step Components
  const Step1BasicInfo = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Proposal Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Allocate funds for Q1 marketing campaign"
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Provide a detailed description of your proposal..."
          rows={6}
        />
        <p className="text-sm text-muted-foreground">
          You can use Markdown for formatting. Include all relevant details that voters should know.
        </p>
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Proposal Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: ProposalType) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select proposal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="governance">Governance</SelectItem>
            <SelectItem value="funding">Funding</SelectItem>
            <SelectItem value="membership">Membership</SelectItem>
            <SelectItem value="core">Core</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {formData.type === 'governance' && 'Changes to protocol parameters or governance settings'}
          {formData.type === 'funding' && 'Request funding from the DAO treasury'}
          {formData.type === 'membership' && 'Add or remove members, update roles'}
          {formData.type === 'core' && 'Core protocol upgrades and smart contract changes'}
        </p>
      </div>
    </div>
  );

  const Step2Actions = () => {
    const addAction = () => {
      setFormData({
        ...formData,
        targets: [...formData.targets, ''],
        values: [...formData.values, '0'],
        calldatas: [...formData.calldatas, '0x'],
      });
    };

    const removeAction = (index: number) => {
      const newTargets = [...formData.targets];
      const newValues = [...formData.values];
      const newCalldatas = [...formData.calldatas];
      
      newTargets.splice(index, 1);
      newValues.splice(index, 1);
      newCalldatas.splice(index, 1);
      
      setFormData({
        ...formData,
        targets: newTargets,
        values: newValues,
        calldatas: newCalldatas,
      });
    };

    const updateAction = (index: number, field: 'target' | 'value' | 'calldata', value: string) => {
      if (field === 'target') {
        const newTargets = [...formData.targets];
        newTargets[index] = value;
        setFormData({ ...formData, targets: newTargets });
      } else if (field === 'value') {
        const newValues = [...formData.values];
        newValues[index] = value;
        setFormData({ ...formData, values: newValues });
      } else if (field === 'calldata') {
        const newCalldatas = [...formData.calldatas];
        newCalldatas[index] = value;
        setFormData({ ...formData, calldatas: newCalldatas });
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Proposed Actions</h3>
            <Button type="button" variant="outline" size="sm" onClick={addAction}>
              <Plus className="mr-2 h-4 w-4" /> Add Action
            </Button>
          </div>

          {formData.targets.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h4 className="mt-2 text-sm font-medium">No actions added</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Add at least one action that will be executed if this proposal passes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.targets.map((_, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-muted-foreground"
                    onClick={() => removeAction(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <div className="space-y-2">
                    <Label>Target Contract Address *</Label>
                    <Input
                      value={formData.targets[index]}
                      onChange={(e) => updateAction(index, 'target', e.target.value)}
                      placeholder="0x..."
                    />
                    {errors[`targets.${index}`] && (
                      <p className="text-sm text-red-500">{errors[`targets.${index}`]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Value (ETH) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.000000000000000001"
                        value={formData.values[index]}
                        onChange={(e) => updateAction(index, 'value', e.target.value)}
                        placeholder="0.0"
                      />
                      {errors[`values.${index}`] && (
                        <p className="text-sm text-red-500">{errors[`values.${index}`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Calldata (hex) *</Label>
                      <Input
                        value={formData.calldatas[index]}
                        onChange={(e) => updateAction(index, 'calldata', e.target.value)}
                        placeholder="0x..."
                      />
                      {errors[`calldatas.${index}`] && (
                        <p className="text-sm text-red-500">{errors[`calldatas.${index}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="metadataURI">Metadata URI (optional)</Label>
          <Input
            id="metadataURI"
            value={formData.metadataURI || ''}
            onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
            placeholder="ipfs://... or https://..."
          />
          <p className="text-sm text-muted-foreground">
            Link to additional metadata (e.g., documents, images, or detailed specifications)
          </p>
        </div>
      </div>
    );
  };

  const Step3Review = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-medium mb-2">Proposal Details</h3>
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium">{formData.title}</h4>
          <p className="text-muted-foreground mt-2 whitespace-pre-line">
            {formData.description}
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Proposed Actions</h3>
        <div className="space-y-4">
          {formData.targets.map((target, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Target</p>
                  <p className="font-mono text-sm break-all">{target}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p>{formData.values[index]} ETH</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Calldata</p>
                  <p className="font-mono text-sm break-all">
                    {formData.calldatas[index].substring(0, 30)}
                    {formData.calldatas[index].length > 30 ? '...' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {formData.metadataURI && (
        <div>
          <h3 className="font-medium mb-2">Additional Metadata</h3>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="break-all text-sm">{formData.metadataURI}</p>
          </div>
        </div>
      )}
    </div>
  );

  const StepComplete = () => (
    <div className="py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-medium">Proposal Created Successfully!</h3>
      <p className="mt-2 text-muted-foreground">
        Your proposal has been submitted to the DAO. It will be visible to all members once confirmed on the blockchain.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Button variant="outline" onClick={handleClose}>
          Back to Proposals
        </Button>
        <Button onClick={handleClose}>
          View Proposal
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {currentStep === 4 ? 'Proposal Submitted' : 'Create New Proposal'}
          </DialogTitle>
          {currentStep < 4 && (
            <DialogDescription>
              Step {currentStep} of {steps.length}
              <Progress value={(currentStep / steps.length) * 100} className="h-1.5 mt-2" />
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {currentStep === 1 && <Step1BasicInfo />}
          {currentStep === 2 && <Step2Actions />}
          {currentStep === 3 && <Step3Review />}
          {currentStep === 4 && <StepComplete />}
        </div>

        {currentStep < 4 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? handleClose : handleBack}
              disabled={isSubmitting}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Proposal...
                  </>
                ) : (
                  'Create Proposal'
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Label component
const Label = ({ 
  htmlFor, 
  children, 
  className = '' 
}: { 
  htmlFor?: string; 
  children: React.ReactNode; 
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
);
