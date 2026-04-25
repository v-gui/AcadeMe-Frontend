import { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { 
  FaArrowLeft as arrowLeft,
  FaArrowRight as arrowRight,
  FaCheck as check,
  FaSearch as search,
  FaPlus as add,
  FaUserLock as userLock,
  FaPencilAlt as edit,
  FaTrashAlt as trash,
  FaSave as save
} from 'react-icons/fa';


const iconMap = {
  arrowLeft,
  arrowRight,
  check,
  search,
  add,
  userLock,
  edit,
  trash,
  save
};

const iconVariants = cva(
  "inline-flex items-center justify-center transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      shape: {
        pill: "rounded-full",
        round: "rounded-lg",
        soft: "rounded",
        square: "rounded-none",
        halfleft: "rounded-l-full",
        halfright: "rounded-r-full"
      },
      buttonStyle: {
        default: "bg-[#006ACB] text-[#F0F2F5] hover:bg-[#0052a3]",
        light: "bg-[#2C9AFF] text-[#F0F2F5] hover:bg-[#1a85e6]",
        dark: "bg-[#003465] text-[#F0F2F5] hover:bg-[#002447]",
        white: "bg-[#F0F2F5] text-[#006ACB] border border-gray-200 hover:bg-white",
        outline: "bg-transparent border border-[#006ACB] text-[#006ACB] hover:bg-blue-50",
        destructive: "bg-transparent border border-[#8E98A8] text-[#8E98A8] hover:bg-[#003465] hover:text-[#2C9AFF] hover:border-[#2C9AFF]",   
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      shape: 'pill',
      buttonStyle: 'default',
      size: 'default',
    }
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconVariants> {
  iconLeft?: keyof typeof iconMap;
  iconCenter?: keyof typeof iconMap;
  iconRight?: keyof typeof iconMap;
}

const Icon = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, shape, buttonStyle, iconLeft, iconCenter, iconRight, children, ...props }, ref) => {
    const LeftIcon = iconLeft ? iconMap[iconLeft] : null;
    const CenterIcon = iconCenter ? iconMap[iconCenter] : null;
    const RightIcon = iconRight ? iconMap[iconRight] : null;

    return (
      <button
        ref={ref}
        className={cn(iconVariants({ shape, size, buttonStyle, className }))} 
        {...props}
      >
        {LeftIcon && <span className={iconCenter || children ? "mr-2" : ""}><LeftIcon /></span>}
        
        
        {children}
        {CenterIcon && !children && <span><CenterIcon /></span>}
        
        {RightIcon && <span className={iconCenter || children ? "ml-2" : ""}><RightIcon /></span>}
      </button>
    );
  }
);

Icon.displayName = 'Button';

export { Icon, iconVariants };
