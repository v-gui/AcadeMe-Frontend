import { useRef } from 'react';
import { Button } from './components/Button';
import { TextBar } from './components/TextBar';
import { TextArea } from './components/TextArea';
import './App.css';

function App() {

  const ref = useRef<HTMLButtonElement>(null);
  
  return (
    <div className="App p-10 flex flex-col gap-8">
      
      <div className="flex flex-col gap-2">
        <p className="text-gray-500 text-sm italic">Exemplo de Botão:</p>
        <Button ref={ref} size='default' shape='pill' iconRight='add'>
          Novo
        </Button>
      </div>

      
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
      
      
      <div className="flex flex-col gap-6">
        <p className="text-gray-500 text-sm italic">Exemplos de TextArea:</p>
        <TextArea
          label="Descrição"
          borderColor="blue"
          textSize="md"
          textColor="blue"
          labelSize="md"
          labelColor="blue"
          placeholder="Digite sua descrição aqui..."
          rows={5}
        />

        <TextArea
          className="mt-6"
          label="Comentários"
          borderColor="light_gray"
          textSize="sm"
          textColor="gray"
          labelSize="sm"
          labelColor="dark_blue"
          placeholder="Digite seus comentários..."
          rows={3}
        />
      </div>
    </div>
  );
}

export default App;