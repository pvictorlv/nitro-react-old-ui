# Wired System - New Features Implementation

Este documento descreve as novas funcionalidades implementadas no sistema Wired baseadas no código compilado fornecido.

## Funcionalidades Implementadas

### 1. Sistema de Variáveis (`wiredfurni.params.variables.availability`)

#### WiredVariableManager
Gerenciador central para variáveis do sistema wired.

**Funcionalidades:**
- Armazenamento de variáveis com tipos (string, number, boolean, object)
- Controle de disponibilidade de variáveis
- Validação de tipos
- Operações CRUD completas

**Uso:**
```typescript
import { WiredVariableManager } from './api/wired';

// Definir uma variável
WiredVariableManager.setVariable('player_score', 100);
WiredVariableManager.setVariableAvailability('player_score', true);

// Obter variável
const score = WiredVariableManager.getVariable('player_score');

// Verificar disponibilidade
const isAvailable = WiredVariableManager.isVariableAvailable('player_score');
```

#### WiredFurniParams
Sistema avançado para parâmetros de mobília wired com suporte a variáveis tipadas.

**Funcionalidades:**
- Variáveis tipadas (string, number, boolean, object)
- Controle de disponibilidade
- Validação automática de tipos
- Busca e filtragem
- Import/Export de configurações

**Uso:**
```typescript
import { WiredFurniParams } from './api/wired';

// Criar variável tipada
WiredFurniParams.setParamVariable('game_active', true, 'boolean', true, 'Status do jogo');

// Validar variável
const validation = WiredFurniParams.validateParamVariable('score', 100, 'number');

// Buscar variáveis
const results = WiredFurniParams.searchVariables('game');
```

### 2. Ferramentas de Criação (`wiredcreatortools`)

#### WiredCreatorTools
Sistema completo de ferramentas para criação e edição avançada de wired.

**Funcionalidades:**
- Modo avançado com ferramentas extras
- Sistema de templates
- Histórico com undo/redo
- Configurações personalizáveis
- Grid snap
- Auto-save
- Import/Export de configurações

**Configurações disponíveis:**
```typescript
interface WiredCreatorToolsConfig {
    enableAdvancedMode: boolean;    // Habilita ferramentas avançadas
    showVariables: boolean;         // Mostra variáveis disponíveis
    showDebugInfo: boolean;         // Informações de debug
    autoSave: boolean;              // Salvamento automático
    gridSnap: boolean;              // Snap para grid
    gridSize: number;               // Tamanho do grid
}
```

**Uso:**
```typescript
import { WiredCreatorTools } from './api/wired';

// Configurar ferramentas
WiredCreatorTools.updateConfig({
    enableAdvancedMode: true,
    showVariables: true,
    gridSnap: true,
    gridSize: 32
});

// Salvar template
WiredCreatorTools.saveTemplate('meu_template', templateData);

// Histórico
WiredCreatorTools.addToHistory({ type: 'action', data: {} });
const canUndo = WiredCreatorTools.canUndo();
const lastAction = WiredCreatorTools.undo();
```

### 3. Novas Ações e Condições Wired

#### WiredActionSetVariableView
Nova ação para definir/modificar variáveis.

**Operações suportadas:**
- Set (definir valor)
- Add (somar - apenas números)
- Subtract (subtrair - apenas números)
- Multiply (multiplicar - apenas números)
- Divide (dividir - apenas números)

#### WiredConditionVariableView
Nova condição para verificar valores de variáveis.

**Comparações suportadas:**
- Equals (igual)
- Not Equals (diferente)
- Greater Than (maior que - apenas números)
- Less Than (menor que - apenas números)
- Greater or Equal (maior ou igual - apenas números)
- Less or Equal (menor ou igual - apenas números)
- Contains (contém - apenas strings)

### 4. Interface de Usuário Aprimorada

#### Gerenciador de Variáveis
- Interface completa para gerenciar variáveis
- Busca e filtragem por tipo
- Import/Export de variáveis
- Controle de disponibilidade

#### Ferramentas de Criação
- Painel de configurações avançadas
- Gerenciamento de templates
- Histórico visual com undo/redo
- Import/Export de configurações

#### Melhorias no WiredBaseView
- Botões para acessar ferramentas avançadas (quando habilitado)
- Exibição de variáveis disponíveis
- Indicadores visuais do modo avançado

## Códigos de Layout Adicionados

### Ações
- `WiredActionLayoutCode.SET_VARIABLE = 28` - Definir variável

### Condições
- `WiredConditionLayoutCode.VARIABLE_CONDITION = 26` - Condição de variável

## Estilos CSS

Novos estilos adicionados em `WiredView.scss`:
- `.wired-variable-manager` - Estilos para o gerenciador de variáveis
- `.wired-creator-tools` - Estilos para as ferramentas de criação
- `.advanced-mode-indicator` - Indicador do modo avançado
- `.variable-availability-display` - Exibição de variáveis disponíveis

## Integração com Sistema Existente

As novas funcionalidades são totalmente compatíveis com o sistema wired existente:

1. **Retrocompatibilidade**: Todas as funcionalidades existentes continuam funcionando
2. **Extensibilidade**: Novas ações e condições podem ser facilmente adicionadas
3. **Configurabilidade**: Funcionalidades avançadas podem ser habilitadas/desabilitadas
4. **Persistência**: Configurações são salvas no localStorage

## Exemplo de Uso Completo

Veja o arquivo `WiredExampleUsage.tsx` para exemplos detalhados de como usar todas as funcionalidades.

## Arquivos Criados/Modificados

### Novos Arquivos:
- `src/api/wired/WiredVariableManager.ts`
- `src/api/wired/WiredCreatorTools.ts`
- `src/api/wired/WiredFurniParams.ts`
- `src/components/wired/views/WiredVariableManagerView.tsx`
- `src/components/wired/views/WiredCreatorToolsView.tsx`
- `src/components/wired/views/actions/WiredActionSetVariableView.tsx`
- `src/components/wired/views/conditions/WiredConditionVariableView.tsx`
- `src/components/wired/WiredExampleUsage.tsx`

### Arquivos Modificados:
- `src/api/wired/index.ts` - Exportações adicionadas
- `src/api/wired/WiredActionLayoutCode.ts` - Novo código adicionado
- `src/api/wired/WiredConditionLayoutCode.ts` - Novo código adicionado
- `src/components/wired/views/WiredBaseView.tsx` - Funcionalidades avançadas
- `src/components/wired/views/actions/WiredActionLayoutView.tsx` - Nova ação
- `src/components/wired/views/conditions/WiredConditionLayoutView.tsx` - Nova condição
- `src/components/wired/WiredView.scss` - Novos estilos

## Próximos Passos

1. **Testes**: Implementar testes unitários para as novas funcionalidades
2. **Documentação**: Expandir documentação com mais exemplos
3. **Otimização**: Otimizar performance para grandes quantidades de variáveis
4. **Integração**: Integrar com sistema de persistência do servidor
5. **Validação**: Adicionar mais validações e tratamento de erros

## Notas Técnicas

- As variáveis são armazenadas em memória e localStorage
- O sistema suporta tipos TypeScript para melhor type safety
- Todas as operações são validadas antes da execução
- O histórico tem limite configurável para evitar uso excessivo de memória
- As configurações são persistidas automaticamente