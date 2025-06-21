# Uso Básico

## Início Rápido

Compacte todo o seu repositório:
```bash
repomix
```

## Casos de Uso Comuns

### Compactar Diretórios Específicos
```bash
repomix path/to/directory
```

### Incluir Arquivos Específicos
Use [glob patterns](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax):
```bash
repomix --include "src/**/*.ts,**/*.md"
```

### Excluir Arquivos
```bash
repomix --ignore "**/*.log,tmp/"
```

### Repositórios Remotos
```bash
# Usando URL do GitHub
repomix --remote https://github.com/user/repo

# Usando abreviação
repomix --remote user/repo

# Branch/tag/commit específico
repomix --remote user/repo --remote-branch main
repomix --remote user/repo --remote-branch 935b695
```

### Entrada de Lista de Arquivos (stdin)

Passe caminhos de arquivos via stdin para máxima flexibilidade:

```bash
# Usando comando find
find src -name "*.ts" -type f | repomix --stdin

# Usando git para obter arquivos rastreados
git ls-files "*.ts" | repomix --stdin

# Usando ls com padrões glob
ls src/**/*.ts | repomix --stdin

# De um arquivo contendo caminhos de arquivos
cat file-list.txt | repomix --stdin

# Entrada direta com echo
echo -e "src/index.ts\nsrc/utils.ts" | repomix --stdin
```

A opção `--stdin` permite que você canalize uma lista de caminhos de arquivos para o Repomix, oferecendo máxima flexibilidade na seleção de quais arquivos compactar.

> [!NOTE]
> Ao usar `--stdin`, os caminhos de arquivos podem ser relativos ou absolutos, e o Repomix tratará automaticamente da resolução de caminhos e deduplicação.

### Entrada de Lista de Arquivos (stdin)

Passe caminhos de arquivos via stdin para máxima flexibilidade:

```bash
# Usando o comando find
find src -name "*.ts" -type f | repomix --stdin

# Usando git para obter arquivos rastreados
git ls-files "*.ts" | repomix --stdin

# Usando ls com padrões glob
ls src/**/*.ts | repomix --stdin

# De um arquivo contendo caminhos de arquivos
cat file-list.txt | repomix --stdin

# Entrada direta com echo
echo -e "src/index.ts\nsrc/utils.ts" | repomix --stdin
```

A opção `--stdin` permite canalizar uma lista de caminhos de arquivos para o Repomix, oferecendo máxima flexibilidade na seleção de quais arquivos compactar.

> [!NOTE]
> Ao usar `--stdin`, os caminhos de arquivos podem ser relativos ou absolutos, e o Repomix irá automaticamente lidar com a resolução de caminhos e desduplicação.

## Formatos de Saída

### XML (Padrão)
```bash
repomix --style xml
```

### Markdown
```bash
repomix --style markdown
```

### Texto Simples
```bash
repomix --style plain
```

## Opções Adicionais

### Remover Comentários
```bash
repomix --remove-comments
```

### Mostrar Números de Linha
```bash
repomix --output-show-line-numbers
```

### Copiar para a Área de Transferência
```bash
repomix --copy
```

### Desativar Verificação de Segurança
```bash
repomix --no-security-check
```

## Configuração

Inicializar arquivo de configuração:
```bash
repomix --init
```

Veja o [Guia de Configuração](/pt-br/guide/configuration) para opções detalhadas.
