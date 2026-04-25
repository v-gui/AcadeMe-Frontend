import { ButtonHTMLAttributes, forwardRef } from 'react';
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

const buttonVariants = cva(
  "h-42 px-4 py-2 flex items-center justify-center text-center bg-[#006ACB] text-[#F0F2F5] hover:opacity-85",
  {
    variants: {
      shape: {
        pill: "rounded-full",
        round: "rounded-lg",
        soft: "rounded",
        square: "rounded-none",
        halfleft:"rounded-l-full",
        halfright:"rounded-r-full"
      },
      buttonStyle: {
        default: "bg-[#006ACB] text-[#F0F2F5]",
        light: "bg-[#2C9AFF] text-[#F0F2F5]",
        dark: "bg-[#003465] text-[#F0F2F5]",
        white: "bg-[#F0F2F5] text-[#006ACB]",
        outline: "bg-transparent border border-[#006ACB] text-[#006ACB]",
        destructive: "bg-transparent border border-[#8E98A8] text-[#8E98A8] hover:bg-[#003465] hover:text-[#2C9AFF] hover:border-[#2C9AFF]",   
      },
      size: {
        default: "",
        sm: ""
      },
    },
    defaultVariants: {
      shape: 'pill',
      buttonStyle: 'default',
      size: 'default',
    }
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  iconLeft?: keyof typeof iconMap;
  iconCenter?: keyof typeof iconMap;
  iconRight?: keyof typeof iconMap;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, shape, iconLeft, iconCenter, iconRight, children, ...props }, ref) => {
    const LeftIcon = iconLeft ? iconMap[iconLeft] : null;
    const CenterIcon = iconCenter ? iconMap[iconCenter] : null;
    const RightIcon = iconRight ? iconMap[iconRight] : null;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ shape, size, className }))} 
        {...props}
      >
        {LeftIcon && <span className="mr-2"><LeftIcon /></span>}
        {children || (CenterIcon && <span><CenterIcon /></span>)}
        {RightIcon && <span className="ml-2"><RightIcon /></span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
