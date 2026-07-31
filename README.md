# Integração de Abastecimentos — GD Tech

Aplicação fullstack desenvolvida para consumir a API de abastecimentos, persistir e estruturar os dados no PostgreSQL, gerar comprovantes fiscais em PDF armazenados em Object Storage (MinIO S3) e disponibilizar uma interface gráfica para consulta e filtragem.

## Estrutura do Projeto

- `backend`: API em NestJS responsável pela sincronização de dados, persistência no PostgreSQL, compilação de comprovantes com PDFKit e integração S3 via MinIO.
- `frontend`: Interface em Next.js App Router para visualização dos abastecimentos, filtragem dinâmica e download de comprovantes.

## Execução com Docker Compose

### Pré-requisitos
- Docker e Docker Compose instalados.

### Passo a Passo
1. Acesse a pasta raiz do projeto:
   ```bash
   cd integracao-de-abastecimentos
   ```

2. Copie o arquivo de variáveis de ambiente de exemplo:
   ```bash
   cp .env.example .env
   ```

3. Suba a aplicação inteira via Docker Compose:
   ```bash
   docker compose up -d --build
   ```

O Docker Compose compilará os containers, executará as migrations do PostgreSQL automaticamente e iniciará a aplicação.

## Mapeamento de Portas

Os serviços foram configurados na faixa de portas liberada para a aplicação (`3100-3199`):

- **Frontend Next.js**: `http://localhost:3100`
- **Backend API NestJS**: `http://localhost:3101`
- **Documentação Swagger**: `http://localhost:3101/api/docs`
- **PostgreSQL**: `localhost:3102`
- **MinIO S3 API**: `http://localhost:3103`
- **MinIO Console UI**: `http://localhost:3104`

## Sincronização e Ingestão

A ingestão consome o endpoint paginado da API base de forma incremental e resiliente:

- **Idempotência**: O número do protocolo (`protocolo_number`) possui constraint única no PostgreSQL. A gravação utiliza comandos de inserção atômica (`insert().orIgnore()`), garantindo que tentativas duplicadas sejam descartadas no banco sem gerar erros ou duplicações.
- **Sincronização Agendada**: Um job interno roda automaticamente a cada 12 horas (`@Cron`), salvando o cursor da última página processada em `sync_log`. Nas execuções seguintes, a busca consulta apenas os registros criados após esse cursor.
- **Sincronização Manual**: O operador pode acionar a sincronização incremental a qualquer momento via interface ou através do endpoint:
  ```text
  POST /abastecimentos/sync
  ```
- **Parametrização do Lote**: A quantidade limite de itens por requisição é configurada via variável de ambiente (`LIMIT_SYNC=50`), facilitando ajustes de lote sem alterar o código.

### Resiliência a Falhas da API Base

- **Salvar Progresso por Página**: A cada página consumida da API externa, o `last_cursor` é gravado no banco (`sync_state`). Se a API externa cair no meio do processo (ex: na 5ª página), os dados das páginas anteriores já estão garantidos no banco. Na próxima tentativa, o processo recomeça a partir de onde parou.
- **Isolamento de Erro por Registro**: Se um único item dentro de um lote de 50 registros vier corrompido ou com erro de validação, a exceção é capturada individualmente. O erro é contabilizado no log e os outros 49 registros válidos da mesma página são salvos normalmente.

## Endpoints da API

### Abastecimentos
- `GET /abastecimentos` — Lista paginada (`page`, `limit`) com filtros por `protocolo_number`, `vehicle`, `buyer_cpf`, `establishment_cnpj`, `date_from` e `date_to`.
- `GET /abastecimentos/:id` — Detalhe completo de um abastecimento com seus itens, posto, filial e motorista.
- `GET /abastecimentos/:id/comprovante` — Retorna a URL pública do comprovante gerado no MinIO.

### Sincronização
- `POST /abastecimentos/sync` — Dispara o processo de sincronização manual.

## Arquitetura e Decisões Técnicas

### Backend (NestJS)
- **Organização Modular por Domínio**: O backend está dividido em módulos focados em contextos de negócio (`abastecimento`, `motorista`, `posto`, `filial`, `sync`, `receipt`, `storage`), separando as rotas (Controllers), a regra de negócio (Services) e o banco (Repositories).
- **Precisão Numérica de 40 Dígitos**: O campo `unit_price` da API base possui até 30+ casas decimais. Para evitar acúmulo de erros de arredondamento com tipos de ponto flutuante (`float`), gravamos os dados no banco como `NUMERIC` e usamos a biblioteca `decimal.js` na aplicação via Transformers customizados do TypeORM.
- **Indexação por Placa no PostgreSQL**: Para deixar as buscas por placa (`ILIKE %PLACA%`) rápidas mesmo com milhões de registros, criamos via migration um índice especializado do tipo GIN usando a extensão `pg_trgm` (`idx_abastecimentos_vehicle_plate_trgm`).
- **Guarda do JSON Bruto (`raw_payload`)**: Gravamos o JSON original completo recebido da API base em uma coluna `JSONB`. Isso permite auditar dados passados e reprocessar informações se o contrato de origem mudar no futuro, sem precisar refazer chamadas à API externa.
- **Preservação de Dados de Origem e Fuso Horário**: A data de abastecimento original (`created_at`) é mantida exatamente como veio da API externa. Já os horários criados pela nossa própria aplicação (como a data de emissão do comprovante PDF e os logs internos) utilizam o fuso horário local de Mato Grosso do Sul (`America/Campo_Grande`).

### Frontend (Next.js App Router)
- **Filtros e Paginação na URL**: As buscas, filtros e a página atual ficam salvos diretamente nos parâmetros da URL (`searchParams`). Isso permite compartilhar links de pesquisas diretamente e dispensa bibliotecas pesadas de estado global (como Redux ou Zustand).
- **Componentes Desacoplados e React Query**: Interface organizada em componentes reutilizáveis (`FilterBar`, `FuelingCard`, `ReceiptView`), com TanStack Query cuidando do cache client-side, requisições e estados de carregamento.

## Trade-offs

- **Geração do PDF sob Demanda vs Fila de Background**: O comprovante em PDF só é compilado e salvo no MinIO no momento em que o usuário clica para visualizar no frontend. Isso evita salvar milhares de PDFs de abastecimentos que ninguém vai abrir. Como a compilação via `PDFKit` leva milissegundos, a resposta é quase instantânea e evitamos a complexidade de adicionar infraestrutura de filas (como BullMQ ou Redis).
- **Sincronização a cada 12h vs Consulta Frequente**: O agendamento automático foi definido para 12 horas para não sobrecarregar ou estressar a API de origem de terceiros. Para casos em que o usuário precisa do dado imediatamente, a sincronização manual fica disponível na interface.
- **Trava de Sincronização em Memória vs Lock Distribuído**: O controle para não rodar duas sincronizações ao mesmo tempo é feito com uma variável em memória na instância do backend. Isso atende perfeitamente ao Docker Compose de container único. Em uma estrutura multi-instâncias com autoscaling, essa trava evoluiria para um lock distribuído no Redis.
- **Exposição de Portas para Avaliação**: As portas do banco PostgreSQL (`3102`) e do MinIO (`3103`/`3104`) foram expostas no Docker Compose para permitir que o avaliador inspecione o banco e os arquivos sem barreira. Em produção, esses serviços rodariam em rede privada fechada (VPC).
- **Escopo de Autenticação**: As rotas da API própria foram mantidas abertas para facilitar o teste sem necessidade de gerar tokens JWT. Em um ambiente de produção B2B, as rotas seriam protegidas com autenticação OAuth2/JWT e controle de acesso por perfil (RBAC).

## Testes Automatizados

O backend possui suíte de testes unitários desenvolvida em Jest para validação das regras de negócio, conversão de DTOs, deduplicação de entidades e resiliência:

```bash
# Executar testes unitários no backend
cd backend
npm run test
```
