# 🎪 Narizes de Plantão - Plataforma Online

Plataforma de cartões de apresentação personalizados para artistas circenses.

## 🚀 Migração: Firebase → Supabase

Você migrou da plataforma **Firebase** para **Supabase** (banco PostgreSQL). Aqui está como configurar tudo:

---

## 📋 Checklist de Setup

### 1️⃣ Criar Projeto no Supabase

- [ ] Acesse [supabase.com](https://supabase.com)
- [ ] Crie uma conta ou faça login
- [ ] Clique em **"New Project"**
  - **Project name**: `cartoes-palhaco-app` (ou seu nome)
  - **Database Password**: Copie e guarde em lugar seguro!
  - **Region**: Americas
  - **Security**: Enable Data API (✓) + Automatically expose new tables (✓)

### 2️⃣ Configurar o Banco de Dados

Após criar o projeto:

1. Vá para **SQL Editor** → **New Query**
2. Copie e cole todo o conteúdo de `supabase-schema.sql`
3. Clique em **Run** para executar as queries

Isso vai criar:
- Tabela `palhacos` (com todos os campos necessários)
- Tabela `users` (para autenticação)
- Índices e triggers automáticos

### 3️⃣ Criar Buckets de Storage

Vá para **Storage** (na sidebar esquerda):

**Bucket 1 - Imagens**
- Nome: `images`
- Tipo: **Public** ✓
- Descrição: "Imagens de perfil e adicionais dos palhaços"

**Bucket 2 - PDFs**
- Nome: `pdfs`
- Tipo: **Public** ✓
- Descrição: "Documentos PDF para download"

### 4️⃣ Criar Usuários (Admin)

Vá para **Authentication** → **Users**:

1. Clique em **Add user**
2. Use essa estrutura:
   ```
   Email: seu-email@example.com
   Password: sua-senha-segura
   ```
3. Clique em **Save**
O login agora usa **Supabase Auth** diretamente. Nao e necessario criar ou sincronizar tabela `public.users`.

### 5️⃣ Aplicar RLS e Policies

No **SQL Editor**, execute o arquivo `supabase-schema.sql` completo para:
- Habilitar RLS em `palhacos`
- Permitir leitura publica dos cartoes
- Permitir criar/editar/excluir apenas para usuarios autenticados
- Remover a tabela legado `public.users` (se existir)

### 6️⃣ Copiar Credenciais

No dashboard do Supabase, vá para **Project Settings** → **API**:

Copie:
- `Project URL` (ex: `https://zrkleykmyrovovysrgti.supabase.co`)
- `anon public` (chave pública)

### 7️⃣ Configurar Variáveis de Ambiente

1. Copie `.env.example` para `.env.local`
2. Preencha:
   ```
   VITE_SUPABASE_URL=seu-url-aqui
   VITE_SUPABASE_ANON_KEY=sua-chave-aqui
   ```

> ⚠️ **IMPORTANTE**: Nunca commite `.env.local` no Git!

---

## 📁 Estrutura de Arquivos

```
cartaodevisitanarizes/
├── index.html                  # Página principal (atualizada para Supabase)
├── supabase-client.js          # Cliente Supabase com todas as funções
├── supabase-schema.sql         # Schema do banco de dados
├── .env.example                # Variáveis de exemplo
├── .env.local                  # Suas credenciais (nunca commitar!)
├── .gitignore                  # Arquivos ignorados
└── firebase-config.js          # ⚠️ DELETAR (não mais necessário)
```

---

## 🔄 O Que Muda do Firebase para Supabase?

| Firebase | Supabase |
|----------|----------|
| Firestore (NoSQL) | PostgreSQL (SQL) |
| Firebase Auth | Supabase Auth (com helpers) |
| Firebase Storage | Supabase Storage |
| Regras de segurança via JSON | RLS (Row Level Security) via SQL |

### Dados que foram Migrados:

- ✅ Informações de perfil dos palhaços
- ✅ Fotos e imagens
- ✅ Links sociais
- ✅ Cartões customizados
- ✅ PDFs e documentos

---

## 🛠️ Desenvolvimento Local

### Abrir o Projeto

```bash
cd c:\Users\marqu\Documents\GitHub\cartaodevisitanarizes
```

### Com Live Server (VS Code)

1. Instale a extensão **Live Server**
2. Clique com direito em `index.html` → **Open with Live Server**
3. Acesse `http://localhost:5500`

### Com Python

```bash
python -m http.server 8000
# Acesse http://localhost:8000
```

---

## 📚 Funções Disponíveis (supabase-client.js)

### Autenticação
```javascript
await login(email, password)      // Login
await logout()                    // Logout
isLoggedIn()                      // Verifica se está autenticado
getCurrentUser()                  // Retorna {id, email}
```

### Palhaços
```javascript
await getPalhacos()               // Lista todos
await getByPalhacoId(id)          // Busca um específico
await createPalhaco(data)         // Cria novo
await updatePalhaco(id, data)     // Atualiza
await deletePalhaco(id)           // Deleta
```

### Storage
```javascript
await uploadImage(file, bucket)   // Upload de imagem
// A trajetória agora é salva como URL no campo `pdf`
await deleteFile(path, bucket)    // Deleta arquivo
```

---

## 🐛 Troubleshooting

### "Erro: Usuário não encontrado"
- Verifique se o usuário foi criado na tabela `users`
- Cheque o email exato (case-sensitive)

### "Erro ao fazer upload de imagem"
- Verifique se os buckets foram criados como **Public**
- Cheque as permissões no **Storage**

### "Tabelas não criadas"
- Execute novamente `supabase-schema.sql` no SQL Editor
- Verifique se não há erros na execução

---

## 🔐 Segurança

- ✅ `.env.local` está no `.gitignore` (não será versionado)
- ✅ Credenciais públicas apenas (não inclua secret key)
- ✅ RLS pode ser ativado para restringir acesso
- ✅ PDFs são armazenados no Storage (acesso público)

---

## 📞 Próximos Passos

1. **Deploy**: Hospede em Vercel, Netlify ou GitHub Pages
2. **Domínio Customizado**: Configure um domínio próprio
3. **Email**: Configure alertas de notificação
4. **Backup**: Configure backups automáticos no Supabase

---

**Projeto atualizado em**: 2026-05-12  
**Stack**: Vanilla JS + Supabase + PostgreSQL
