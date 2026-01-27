import React from 'react';
import { useFlowStore } from '@/lib/stores/flow-store';
import { useVariableValidation } from '../hooks/use-variable-validation';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    nodeId: string;
    containerClassName?: string;
    value: string;
}

export function ValidatedTextarea({ 
    nodeId, 
    value, 
    className, 
    containerClassName, 
    ...props 
}: ValidatedTextareaProps) {
    const { nodes, edges } = useFlowStore();
    
    const validation = useVariableValidation(value, nodeId, nodes, edges);
    const errors = [...validation.invalidNodes, ...validation.invalidFields];
    const hasError = errors.length > 0;

    return (
        <div className={cn("flex flex-col gap-1 w-full", containerClassName)}>
            <textarea
                value={value}
                className={cn(
                    "w-full bg-background border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all resize-none",
                    hasError ? "border-red-500 focus:ring-red-500" : "border-input hover:border-accent-foreground/50",
                    className
                )}
                {...props}
            />
            {hasError && (
                 <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Invalid variables: {errors.join(', ')}
                </p>
            )}
        </div>
    );
}
