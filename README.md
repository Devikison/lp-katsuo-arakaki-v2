# LP · Katsuo Arakaki · Terapia Breve — VERSÃO B (enxuta)

Esta é a **Versão B** do teste A/B da landing page do Katsuo Arakaki: mesma copy da
Versão A, layout mais simples e direto (menos elementos visuais, sem carrossel,
sem cards em excesso), inspirado no site antigo do cliente
(katsuoarakaki.com.br), para comparar performance com a Versão A.

- **Versão A** (a página "cheia", com vídeo, carrossel de depoimentos, tabela
  comparativa em cartão etc.): repositório [`lp-katsuo-arakaki`](https://github.com/Devikison/lp-katsuo-arakaki),
  publicada em `www.katsuoarakaki.sitepreviavisual.site`.
- **Versão B** (esta aqui, enxuta): publicada em `katsuoarakakiv2.sitepreviavisual.site`.

As duas são **repositórios GitHub separados** porque o GitHub Pages só permite
um domínio customizado por repositório — não dá pra servir dois domínios
diferentes a partir do mesmo repo.

## Estrutura

```
index.html              página completa (mesma copy da Versão A, layout enxuto)
assets/css/style.css    design system simplificado (sem o design system completo da V1)
assets/js/config.js     >>> único arquivo que precisa ser editado <<<
assets/js/main.js       WhatsApp, vídeos, acordeão do FAQ, cookies
CNAME                   domínio do GitHub Pages: katsuoarakakiv2.sitepreviavisual.site
```

## Antes de publicar

Edite `assets/js/config.js` (mesmos campos da Versão A — número de WhatsApp,
mensagem, links de vídeo). **Se atualizar um número/mensagem/vídeo aqui, replique
na Versão A também**, e vice-versa, senão os dois testes ficam com ofertas
diferentes sem querer.

## O que é diferente da Versão A

- Sem carrossel de depoimentos (lista simples, rolagem nativa da página).
- Sem tabela de comparação em cartão com sombra — é uma tabela HTML simples.
- Sem efeito de "revelar ao rolar" nem rolagem suave customizada — 100% nativo.
- Seção de perguntas frequentes com fundo azul e cards brancos (acordeão com
  abertura/fechamento suave via JS).
- Cor é usada só no hero e no bloco de FAQ; o resto da página é branco, com uma
  linha fina separando as seções.
- Listas usam marcador 👉 em vez de ícones ilustrados.

## Quando editar as duas versões

Qualquer mudança de **copy** (texto) deve, em princípio, ir pras duas versões,
já que o teste A/B compara *layout*, não *mensagem*. Mudanças de **layout/visual**
só valem para esta versão (B).
