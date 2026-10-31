# ATLAS para Android

Aplicativo Android nativo em Kotlin que abre a interface web existente do ATLAS em uma WebView segura. O servidor e o site do Render continuam separados e não são alterados por este módulo.

## Primeiro uso
1. Abra o projeto `android-companion` no Android Studio.
2. Aguarde a sincronização do Gradle.
3. Execute no aparelho ou gere um APK de teste.
4. Na primeira abertura, informe a URL HTTPS pública do serviço ATLAS no Render.
5. O endereço fica salvo localmente no aparelho; use **Endereço** no topo para alterá-lo.

## O que esta etapa faz
- Reutiliza a interface e os recursos web do ATLAS já existentes.
- Mantém JavaScript e armazenamento local do WebView habilitados para o funcionamento da interface.
- Não coloca chaves de IA dentro do aplicativo.
- Não altera o serviço web publicado.
- Não pede senha do Instagram e não envia mensagens.

## Limitações desta primeira etapa
- A URL pública do serviço Render ainda precisa ser informada na primeira abertura.
- Microfone/permissões nativas e integração profunda com recursos Android serão tratados e testados em etapa própria.
- O projeto ainda precisa ser compilado e testado em aparelho real.
- O repositório ainda não inclui Gradle Wrapper.

## Publicação
A configuração de assinatura, Android App Bundle (AAB), testes e publicação na Play Store será feita depois que a compilação e o funcionamento básico forem validados.
