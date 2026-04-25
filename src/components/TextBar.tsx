

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { 
  FaArrowLeft as arrowLeft,
  FaArrowRight as arrowRight,
  FaCheck as check,
  FaSearch as search,
  FaPlus as add,
} from 'react-icons/fa';




const iconMap = {
  arrowLeft,
  arrowRight,
  check,
  search,
  add,
};


const inputVariants = cva(
  "focus:outline-none flex-1",
  {
    variants: {
      variant: {
        default: "border-[#E5E7EB] border-sm focus:border-[#006ACB]",
        error: "border-red-500 focus:border-red-600",
        success: "border-green-500 focus:border-green-600",
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
      variant: 'default',
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


interface TextBarProps extends
  InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants>,
  VariantProps<typeof labelVariants> {
  label?: string;
  iconLeft?: keyof typeof iconMap;
  iconRight?: keyof typeof iconMap;
  iconColor?: string;
  hideIconsOnInput?: boolean;
}


const TextBar = forwardRef<HTMLInputElement, TextBarProps>(
  ({ className, variant, textSize, textColor, labelSize, labelColor, label, iconLeft, iconRight, iconColor = '#E5E7EB', hideIconsOnInput = false, ...props }, ref) => {

    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };


    const shouldHideIcons = hideIconsOnInput && inputValue.length > 0;

    return (
      <div className="flex flex-col w-full">
        {label && <label className={cn(labelVariants({ labelSize, labelColor }))}>{label}</label>}
        <div
          className={cn(
            "flex items-center border rounded-sm transition-colors",
            isFocused ? "border-[#006ACB]" : inputVariants({ variant }).split(' ')[0]
          )}
        >
          {!shouldHideIcons && iconLeft && (
            <div className="mr-2 ml-2 bg-white p-3">
              {iconMap[iconLeft]({ color: iconColor, size: '1.25em' })} 
            </div>
          )}
          <input
            ref={ref}
            className={cn("p-2", inputVariants({ textSize, textColor, className }))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleInputChange}
            value={inputValue}
            {...props}
          />
          {!shouldHideIcons && iconRight && (
            <div className="mr-8 ml-2 bg-white p-3">
              {iconMap[iconRight]({ color: iconColor, size: '1.25em' })} 
            </div>
          )}
        </div>
      </div>
    );
  }
);

TextBar.displayName = 'TextBar';

export { TextBar };