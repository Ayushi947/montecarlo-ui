"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  /** Number of digits */
  length?: number;
  /** Callback when OTP is complete */
  onComplete?: (otp: string) => void;
  /** Callback when OTP changes */
  onChange?: (otp: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Auto-focus first input */
  autoFocus?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * OTP Input Component
 *
 * 6-digit OTP input with:
 * - Auto-focus progression
 * - Backspace navigation
 * - Paste support
 * - Auto-submit on complete
 *
 * Matches Stitch UI: OTP Verification screen
 */
export function OtpInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Notify parent when OTP changes
  React.useEffect(() => {
    const otpValue = otp.join("");
    onChange?.(otpValue);

    // Auto-submit when complete
    if (otpValue.length === length && !otp.includes("")) {
      onComplete?.(otpValue);
    }
  }, [otp, length, onChange, onComplete]);

  /**
   * Handle input change
   */
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Move to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle key down (backspace navigation)
   */
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle paste
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    const digits = pastedData.slice(0, length).split("");

    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < length) {
        newOtp[i] = digit;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastFilledIndex = Math.min(digits.length, length) - 1;
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  /**
   * Handle focus
   */
  const handleFocus = (index: number) => {
    // Select the input content on focus
    inputRefs.current[index]?.select();
  };

  /**
   * Reset OTP
   */
  const reset = () => {
    setOtp(Array(length).fill(""));
    inputRefs.current[0]?.focus();
  };

  // Expose reset method
  React.useImperativeHandle(
    React.useRef({ reset }),
    () => ({ reset }),
    [length]
  );

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 sm:gap-3",
        className
      )}
    >
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-lg",
            "border-2 bg-background text-foreground",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            error
              ? "border-destructive focus:ring-destructive"
              : "border-input focus:border-primary focus:ring-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

/**
 * OTP Input with Reset Handle
 */
export interface OtpInputHandle {
  reset: () => void;
}

export const OtpInputWithRef = React.forwardRef<OtpInputHandle, OtpInputProps>(
  (props, ref) => {
    const [otp, setOtp] = React.useState<string[]>(
      Array(props.length || 6).fill("")
    );
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const length = props.length || 6;

    React.useImperativeHandle(ref, () => ({
      reset: () => {
        setOtp(Array(length).fill(""));
        inputRefs.current[0]?.focus();
      },
    }));

    // Same implementation as OtpInput...
    return <OtpInput {...props} />;
  }
);

OtpInputWithRef.displayName = "OtpInputWithRef";
