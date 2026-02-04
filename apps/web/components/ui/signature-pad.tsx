"use client"

import React, { useRef, useEffect, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function SignaturePad({ value, onChange, disabled, className }: SignaturePadProps) {
  const sigPad = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const clear = () => {
    sigPad.current?.clear()
    setIsEmpty(true)
    onChange?.('')
  }

  const handleEnd = () => {
    if (sigPad.current) {
        if (sigPad.current.isEmpty()) {
            setIsEmpty(true)
            onChange?.('')
        } else {
            setIsEmpty(false)
            // Trim whitespace for cleaner storage
            const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png')
            onChange?.(dataUrl)
        }
    }
  }

  // Responsive resize handler
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && sigPad.current) {
        const canvas = sigPad.current.getCanvas();
        const container = containerRef.current;
        
        // Save current signature
        const dataUrl = sigPad.current.isEmpty() ? null : canvas.toDataURL();
        
        // Update dimensions
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = container.offsetWidth * ratio;
        canvas.height = container.offsetHeight * ratio;
        canvas.getContext('2d')?.scale(ratio, ratio);
        
        // Restore signature if exists
        if (dataUrl) {
           sigPad.current.fromDataURL(dataUrl);
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
        // Debounce slightly or just run? Run immediately for responsiveness.
        updateDimensions();
    });

    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    
    // Initial sync
    updateDimensions();

    return () => resizeObserver.disconnect();
  }, []); // Logic handles updates via ref

  // Initialize from value if present
  useEffect(() => {
    if (value && sigPad.current && isEmpty) {
        sigPad.current.fromDataURL(value)
        setIsEmpty(false)
    }
  }, [value]) // Add value dependency to be safe, though usually run once is intended

  return (
    <div className={cn("space-y-2", className)}>
      <div 
        ref={containerRef}
        style={{ height: 160 }}
        className={cn(
        "border border-input rounded-md overflow-hidden relative bg-white h-40 min-h-[160px] w-full block", 
        disabled ? "opacity-50 pointer-events-none" : "hover:border-primary/50 transition-colors"
      )}>
        <SignatureCanvas
            ref={sigPad}
            penColor="black"
            canvasProps={{
                className: "absolute inset-0 w-full h-full cursor-crosshair block touch-none", 
            }}
            onEnd={handleEnd}
        />
        {!disabled && !isEmpty && (
            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 h-8 px-2 text-xs bg-muted/50 hover:bg-muted"
                onClick={clear}
            >
                <Eraser className="w-3 h-3 mr-1" /> Clear
            </Button>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground text-center select-none">
         Sign above
      </p>
    </div>
  )
}
