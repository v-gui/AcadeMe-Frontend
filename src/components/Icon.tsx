import { ButtonHTMLAttributes, FC, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { 
  FaArrowLeft as arrowLeft,
  FaArrowRight as arrowRight,
  FaCheck as check,
  FaSearch as search,
  FaPlus as add,
} from 'react-icons/fa'; // Importando os ícones com apelidos

// Mapeando os apelidos dos ícones
const iconMap = {
  arrowLeft,
  arrowRight,
  check,
  search,
  add,
};

const iconVariants = cva(
  "h-42 px-4 py-2 flex items-center bg-none",
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

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconVariants> {
  iconLeft?: keyof typeof iconMap; // Permite passar o nome do ícone à esquerda
  iconCenter?: keyof typeof iconMap; // Permite passar o nome do ícone ao centro
  iconRight?: keyof typeof iconMap; // Permite passar o nome do ícone à direita
}

const Icon = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, shape, iconLeft, iconCenter, iconRight, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(iconVariants({ shape, size, className }))} 
        {...props}
      >
        {iconLeft && <span className="mr-2">{iconMap[iconLeft]({})}</span>} {/* Adiciona ícone à esquerda */}
        {children || (iconCenter && <span>{iconMap[iconCenter]({})}</span>)} {/* Adiciona conteúdo dentro do botão ou ícone ao centro */}
        {iconRight && <span className="ml-2">{iconMap[iconRight]({})}</span>} {/* Adiciona ícone à direita */}
      </button>
    );
  }
);

Icon.displayName = 'Button';

export { Icon, iconVariants };
