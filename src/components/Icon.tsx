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
  FaPencilAlt as edit, // Ícone de Lápis para Editar
  FaTrashAlt as trash,  // Ícone de Lixeira para Excluir
  FaSave as save       // Ícone de Disco para Salvar (opcional)
} from 'react-icons/fa';

// Mapeando os apelidos dos ícones
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
        icon: "h-10 w-10", // Tamanho ideal para botões que só tem ícone
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
    return (
      <button
        ref={ref}
        className={cn(iconVariants({ shape, size, buttonStyle, className }))} 
        {...props}
      >
        {iconLeft && <span className={iconCenter || children ? "mr-2" : ""}>{iconMap[iconLeft]({})}</span>}
        
        {/* Se tiver children (texto), mostra o texto. Se não, mostra o ícone central */}
        {children}
        {iconCenter && !children && <span>{iconMap[iconCenter]({})}</span>}
        
        {iconRight && <span className={iconCenter || children ? "ml-2" : ""}>{iconMap[iconRight]({})}</span>}
      </button>
    );
  }
);

Icon.displayName = 'Button';

export { Icon, iconVariants };
