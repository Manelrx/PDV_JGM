# 📄 ARQUITETURA_OFICIAL_MVP_MARKET_AUTONOMO
## 1. Status do Documento

* **Status:** CONGELADO
* **Versão:** 1.0
* **Escopo:** MVP
* **Autoridade:** Arquitetura oficial do sistema
* **Alterações:** Somente via nova versão (ex: v1.1)

---

## 2. Objetivo do Projeto

Construir um **sistema de mercado autônomo** para condomínios e prédios comerciais no Brasil, capaz de operar **1 mercado real em produção**, com:

* Venda funcional
* Pagamento via Pix
* Estoque confiável
* Auditoria mínima
* Base sólida para escalar até 10 mercados

Este documento define **a arquitetura oficial e imutável do MVP**.

---

## 3. Escopo do MVP (OBRIGATÓRIO)

### 3.1 Funcionalidades INCLUÍDAS

* Multi-tenant lógico (1 mercado inicialmente)
* Cadastro de produtos (sincronizados do ERP)
* Controle de estoque por mercado
* Controle por lote e validade
* Venda com carrinho
* Pagamento via Pix
* Confirmação de pagamento síncrona
* Baixa automática de estoque
* Auditoria de eventos críticos
* Interface simples (app ou totem)

---

### 3.2 Funcionalidades EXPLICITAMENTE FORA DO MVP

❌ Reconhecimento facial
❌ Computer Vision
❌ BI avançado
❌ Campanhas e promoções
❌ Cupons
❌ White-label
❌ Cartão de crédito/débito
❌ IA de previsão
❌ Preço dinâmico

> ⚠️ Qualquer tentativa de implementar itens acima **viola a arquitetura congelada**.

---

## 4. Stack Tecnológica OFICIAL

### Backend

* **Node.js (LTS)**
* **NestJS**
* **TypeScript**

### Banco de Dados

* **PostgreSQL**

### ORM

* **Prisma**

### Infraestrutura

* Docker (local)
* AWS (produção)
* HTTPS obrigatório

### Autenticação

* JWT simples

### Pagamento

* Pix (1 gateway apenas)

---

## 5. Arquitetura Geral

### 5.1 Princípios

* Simplicidade operacional
* Consistência > performance
* Auditoria > conveniência
* Escala horizontal futura

---

### 5.2 Serviços do MVP (CONGELADOS)

| Serviço   | Responsabilidade   |
| --------- | ------------------ |
| Auth      | Autenticação e JWT |
| Market    | Mercado / Tenant   |
| Product   | Produtos e preços  |
| Inventory | Estoque e validade |
| Sale      | Carrinho e venda   |
| Payment   | Pix                |
| Audit     | Logs imutáveis     |
| ERP Sync  | Integração com ERP |

❗ Nenhum novo serviço pode ser criado no MVP.

---

## 6. Modelo de Dados OFICIAL (Resumo)

### Tabelas obrigatórias

* tenants
* products
* inventory_items
* inventory_movements
* sales
* sale_items
* payments
* audit_logs

### Regras imutáveis

1. Todas as tabelas possuem `tenant_id`
2. Estoque **nunca** pode ficar negativo
3. Estoque só muda via `inventory_movements`
4. Venda só é confirmada após pagamento
5. Nada é deletado fisicamente
6. Auditoria é append-only

---

## 7. Fluxos Críticos (OBRIGATÓRIOS)

### 7.1 Fluxo de Venda

```
Cliente seleciona produtos
→ Gera cobrança Pix
→ Pagamento confirmado
→ Venda = PAID
→ Estoque é baixado
→ Evento auditado
```

---

### 7.2 Fluxo sem Pagamento

```
Cliente não paga
→ Venda permanece PENDING
→ Estoque NÃO é baixado
→ Saída NÃO é liberada
→ Evento auditado
```

---

### 7.3 Fluxo de Divergência de Estoque

```
Diferença detectada
→ Ajuste manual
→ Registro de movimento
→ Registro em auditoria
```

---

## 8. Segurança Mínima Obrigatória

* HTTPS
* JWT
* Validação de entrada
* Rate limit básico
* Logs de erro
* Backup diário do banco

---

## 9. Regras INEGOCIÁVEIS (LEI DO PROJETO)

1. Estoque é a verdade absoluta
2. Pagamento vem antes da saída
3. Auditoria não é opcional
4. Simples primeiro, complexo depois
5. Nada fora do MVP entra no MVP
6. Arquitetura não se discute durante execução

---

## 10. Governança de IA (OBRIGATÓRIO)

Qualquer IA envolvida no projeto deve seguir:

```text
REGRAS DE EXECUÇÃO:
- Seguir integralmente este documento
- Não sugerir mudanças de arquitetura
- Não adicionar funcionalidades
- Não alterar stack ou modelo de dados
- Apenas executar tarefas solicitadas
```

IA que não seguir essas regras **deve ser descartada**.

---

## 11. Critério de MVP PRONTO

O MVP é considerado pronto quando:

* 1 mercado real está operando
* Pix funciona sem erro
* Estoque confere com vendas
* Auditoria registra eventos
* Sistema roda 24/7
* Dono confia nos números

---

## 12. Evolução Pós-MVP (NÃO IMPLEMENTAR AGORA)

Somente após 30 dias de operação real:

* Reconhecimento facial
* BI
* Campanhas
* Cartão
* Escala para múltiplos mercados

Esses itens **não fazem parte deste documento**.

---

## 13. Controle de Versão

Qualquer alteração deve gerar novo documento:

```
ARQUITETURA_OFICIAL_MVP_MARKET_AUTONOMO_vX.Y.md
```

Sem exceções.

---

# ✅ CONCLUSÃO

Este documento é a **fonte única da verdade** do MVP.

* Ele governa o código
* Ele governa a IA
* Ele governa decisões técnicas

Nada fora dele existe.
