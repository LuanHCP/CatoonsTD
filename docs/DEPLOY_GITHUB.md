# Publicação no GitHub

## 1. Criar o repositório

Sugestão de nome:

`CatoonsTD`

Descrição curta:

`Tower Defense web/desktop com progressão, heróis, maestria, sinergias e desenvolvimento assistido por IA.`

Defina como **Public** se a intenção for usar diretamente como portfólio.

## 2. Subir o projeto

No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "chore: portfolio beta v0.27.1"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

Nunca envie certificados de assinatura, chaves privadas, tokens ou saves pessoais. O `.gitignore` já cobre formatos comuns desses arquivos.

## 3. Ativar GitHub Pages

Como o jogo é estático e o `index.html` está na raiz:

1. abra o repositório no GitHub;
2. vá em **Settings → Pages**;
3. escolha publicação pela branch `main`;
4. selecione a pasta `/ (root)`;
5. salve;
6. aguarde o GitHub apresentar a URL pública.

Depois disso, a URL do Pages pode ser adicionada no campo **Website** do próprio repositório.

## 4. Criar a primeira tag do beta

Sugestão:

```bash
git tag -a v0.9.0-beta -m "Catoons TD public beta"
git push origin v0.9.0-beta
```

A versão interna atual é `v0.27.1`; `v0.9.0-beta` pode ser usada como nomenclatura pública do produto.

## 5. Publicar a versão Windows

Não coloque o `.exe` no histórico normal do Git.

Use **Releases → Draft a new release** e anexe o ZIP de distribuição Windows. Dessa forma:

- o código continua limpo;
- binários ficam associados a versões específicas;
- usuários encontram facilmente a build para baixar;
- o histórico Git não cresce com binários recompilados.

## 6. Configurar Issues

Este pacote já contém templates para:

- Bug report;
- Feature request.

Eles aparecerão automaticamente ao abrir uma nova Issue no GitHub.

## 7. Sugestão de branches

```text
main  -> beta estável / versão de portfólio
dev   -> alterações em andamento
```

Fluxo simples:

```text
dev -> playtest -> correções -> merge em main -> tag/release
```

## 8. Depois de publicar

No README do perfil/LinkedIn, divulgue dois links:

- **Jogar no navegador** — GitHub Pages;
- **Código-fonte / documentação** — repositório GitHub.

A versão Windows pode ficar como opção adicional em Releases.
