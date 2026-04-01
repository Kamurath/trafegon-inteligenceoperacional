# Tráfegon Dashboard

Dashboard administrativo para gestão de pautas, aniversariantes e informações de unidades.

## Funcionalidades

- **Pauta:** Gestão de tarefas com status e prazos.
- **Aniversariantes:** Controle de aniversariantes do mês.
- **Informações:** Dados técnicos e contatos das unidades.
- **IA Híbrida:** Busca e comandos por voz/texto integrados com Gemini API.
- **Backup:** Sistema de backup automático local e exportação/importação manual.

## Tecnologias

- React 19
- TypeScript
- Tailwind CSS 4
- Motion (Framer Motion)
- Lucide React
- Gemini API (Google Generative AI)

## Configuração

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz do projeto e adicione sua chave da API do Gemini:
   ```env
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```
   *Você pode obter uma chave gratuita em [aistudio.google.com](https://aistudio.google.com/).*

## Desenvolvimento

Para rodar o projeto localmente:
```bash
npm run dev
```

## Produção

Para gerar o build de produção:
```bash
npm run build
```

Para visualizar o build localmente:
```bash
npm run preview
```

## Deploy na Vercel

1. Conecte seu repositório GitHub à Vercel.
2. Configure a variável de ambiente `VITE_GEMINI_API_KEY` no painel da Vercel.
3. O deploy será feito automaticamente.

## Licença

Privado.
