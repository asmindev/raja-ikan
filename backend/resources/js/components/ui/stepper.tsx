import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';

interface Step {
    id: number;
    title: string;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn('w-full', className)}>
            <div className="flex w-full items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="relative z-10 flex flex-col items-center">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200',
                                        {
                                            'border-primary bg-primary text-primary-foreground shadow-sm':
                                                isCompleted || isCurrent,
                                            'border-muted-foreground/30 bg-background text-muted-foreground':
                                                !isCompleted && !isCurrent,
                                        },
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <span className="text-xs font-semibold">
                                            {step.id}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute top-10 w-32 text-center">
                                    <p
                                        className={cn(
                                            'text-xs font-medium transition-colors duration-200',
                                            isCurrent
                                                ? 'text-foreground'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                </div>
                            </div>

                            {!isLast && (
                                <div
                                    className={cn(
                                        'mx-2 h-[1px] flex-1 transition-colors duration-200',
                                        currentStep > step.id
                                            ? 'bg-primary'
                                            : 'bg-muted-foreground/20',
                                    )}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="h-8" />
        </div>
    );
}
