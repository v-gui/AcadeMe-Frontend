import { useRef } from 'react';
import { Button } from './components/Button';
import { TextBar } from './components/TextBar';
import { TextArea } from './components/TextArea';
import './App.css';

function App() {
  // Ajuste na tipagem do useRef para compatibilidade com o componente Button
  const ref = useRef<HTMLButtonElement>(null);
  
  return (
    <div className="App p-10 flex flex-col gap-8">
      {/* Teste de Botão */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-500 text-sm italic">Exemplo de Botão:</p>
        <Button ref={ref} size='default' shape='pill' iconRight='add'>
          Novo
        </Button>
      </div>

      {/* Teste de TextBars */}
      <div className="flex flex-col gap-4">
        <p className="text-gray-500 text-sm italic">Exemplos de TextBar:</p>
        <TextBar 
          variant="default" 
          textSize="lg" 
          label="Blockchain" 
          placeholder="Digite algo..." 
          iconLeft="search" 
          hideIconsOnInput 
        />
        <TextBar 
          variant="default" 
          textSize="sm" 
          className="extra-class" 
          label="Campo Simples"
        />
      </div>
      
      {/* Teste de TextAreas */}
      <div className="flex flex-col gap-6">
        <p className="text-gray-500 text-sm italic">Exemplos de TextArea:</p>
        <TextArea
          label="Descrição"
          borderColor="blue" // Variante de estilo padrão
          textSize="md" // Tamanho médio do texto
          textColor="blue" // Cor do texto
          labelSize="md" // Tamanho médio do label
          labelColor="blue" // Cor do label
          placeholder="Digite sua descrição aqui..."
          rows={5} // Número de linhas do TextArea
        />

        <TextArea
          className="mt-6"
          label="Comentários"
          borderColor="light_gray" // Variante de estilo para indicar algo neutro/limpo
          textSize="sm" // Tamanho pequeno do texto
          textColor="gray" // Cor cinza para o texto
          labelSize="sm" // Tamanho pequeno do label
          labelColor="dark_blue" // Cor azul escuro para o label
          placeholder="Digite seus comentários..."
          rows={3} // Número de linhas do TextArea
        />
      </div>
    </div>
  );
}

export default App;