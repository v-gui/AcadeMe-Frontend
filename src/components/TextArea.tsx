

import { TextareaHTMLAttributes, forwardRef, useState } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../utils/cn';


const textAreaVariants = cva(
  "p-2 border-b-2 border-transparent transition-colors w-full resize-none focus:outline-none",
  {
    variants: {
      background: {
        default: "bg-white",
        transparent: "bg-transparent",
      },
        borderColor: {
        black: "focus:border-black",
        white: "focus:border-[#F0F2F5]",
        gray: "focus:border-[#565656]",
        light_gray: "focus:border-[#94A2B7]",
        blue: "focus:border-[#006ACB]",
        dark_blue: "focus:border-[#003465]",
        light_blue: "focus:border-[#2C9AFF]",
        disabled: "border-none"
      },
      phColor: {
        black: "placeholder:text-black",
        white: "placeholder:text-[#F0F2F5]",
        gray: "placeholder:text-[#565656]",
        light_gray: "placeholder:text-[#94A2B7]",
        blue: "placeholder:text-[#006ACB]",
        dark_blue: "placeholder:text-[#003465]",
        light_blue: "placeholder:text-[#2C9AFF]",
      },
      textSize: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      textColor: {
        black: "text-black",
        white: "text-[#F0F2F5]",
        gray: "text-[#565656]",
        light_gray: "text-[#94A2B7]",
        blue: "text-[#006ACB]",
        dark_blue: "text-[#003465]",
        light_blue: "text-[#2C9AFF]",
      },
    },
    defaultVariants: {
      background: 'default',
      borderColor: 'blue',
      textSize: 'md',
      textColor: 'gray',
    },
  }
);


const labelVariants = cva(
  "mb-1 text-left font-medium",
  {
    variants: {
      labelSize: {
        sm: "text-sm",
        md: "text-2xl",
        lg: "text-3xl",
      },
      labelColor: {
        black: "text-black",
        white: "text-[F0F2F5]",
        gray: "text-[#565656]",
        light_gray: "text-[#94A2B7]",
        blue: "text-[#006ACB]",
        dark_blue: "text-[#003465]",
        light_blue: "text-[#2C9AFF]",
      },
    },
    defaultVariants: {
      labelSize: 'md',
      labelColor: 'blue',
    },
  }
);


interface TextAreaProps extends
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  VariantProps<typeof textAreaVariants>,
  VariantProps<typeof labelVariants> {
    label?: string;
    readOnly?: boolean;
}


const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, readOnly, background, borderColor, phColor, textSize, textColor, labelSize, labelColor, label, ...props }, ref) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="flex flex-col w-full max-w-md">
        {label && <label className={cn(labelVariants({ labelSize, labelColor }))}>{label}</label>}
        <textarea
          ref={ref}
          className={cn(textAreaVariants({ background, borderColor: readOnly? "disabled" : borderColor, phColor, textSize, textColor, className }))}
          readOnly={readOnly}
          {...props}
        />
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea };
