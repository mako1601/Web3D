import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, Button, CircularProgress, Divider, Typography } from '@mui/material';
import { generateHTML } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import katex from 'katex';
import DOMPurify from 'dompurify';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import CodeViewer from '@components/CodeViewer';
import { CodeRunner } from '@components/CodeRunner';
import ContentContainer from '@components/ContentContainer';
import { getArticleById } from '@api/articleApi';
import { getUserById } from '@api/userApi';
import { formatDate } from '@utils/dateUtils';
import { Article } from '@mytypes/articleTypes';
import { useAuth } from '@context/AuthContext';
import { useArticleForm } from '@hooks/useArticles';

export default function ViewArticle() {
  const { id } = ReactDOM.useParams();
  const articleId = Number(id);
  const { user } = useAuth();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [author, setAuthor] = React.useState<{ lastName: string; firstName: string; middleName?: string } | null>(null);
  const [htmlContent, setHtmlContent] = React.useState<string | null>(null);
  const { useFetchJsonFromUrl } = useArticleForm();

  React.useEffect(() => {
    if (isNaN(articleId)) return;

    const fetchArticle = async () => {
      try {
        const data = await getArticleById(articleId);
        setArticle(data);

        if (data.userId) {
          const userData = await getUserById(data.userId);
          setAuthor(userData);
        }

        if (data.contentUrl) {
          const json = await useFetchJsonFromUrl(data.contentUrl);
          const html = generateHTML(json, [
            StarterKit,
            Underline,
            Image.extend({
              renderHTML({ HTMLAttributes }) {
                return ["img", { ...HTMLAttributes, style: "max-width: 100%; height: auto;" }];
              },
            }).configure({ inline: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            CodeRunner,
          ]);
          setHtmlContent(html);
        }
      } catch (e: any) {
        console.error("Ошибка загрузки статьи: ", e);
      }
    };
    fetchArticle();
  }, [articleId]);

  const renderContent = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements: React.ReactNode[] = [];

    doc.body.childNodes.forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        if (element.tagName === "PRE" && element.getAttribute("data-type") === "code-runner") {
          const codeElement = element.querySelector("code");
          const codeText = codeElement?.textContent || "";

          elements.push(<CodeViewer key={index} code={codeText} />);
        } else {
          // Обработка математических формул
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = element.outerHTML;

          // Находим все текстовые узлы, содержащие формулы
          const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
          const textNodes: Node[] = [];
          let currentNode;
          while (currentNode = walker.nextNode()) {
            textNodes.push(currentNode);
          }

          textNodes.forEach(textNode => {
            const text = textNode.nodeValue || '';
            const regex = /\$(.*?)\$/g;
            let match;
            let lastIndex = 0;
            const fragments = [];

            while ((match = regex.exec(text)) !== null) {
              // Текст до формулы
              if (match.index > lastIndex) {
                fragments.push(document.createTextNode(text.substring(lastIndex, match.index)));
              }

              // Формула
              const formula = match[1];
              try {
                const span = document.createElement('span');
                katex.render(formula, span, {
                  throwOnError: false,
                  strict: false,
                  displayMode: false,
                  macros: {
                    '\\text': '\\text'
                  }
                });
                fragments.push(span);
              } catch (e) {
                console.error('Ошибка рендеринга формулы:', e);
                fragments.push(document.createTextNode(`$${formula}$`));
              }

              lastIndex = match.index + match[0].length;
            }

            // Текст после последней формулы
            if (lastIndex < text.length) {
              fragments.push(document.createTextNode(text.substring(lastIndex)));
            }

            // Заменяем текстовый уузл на фрагменты
            if (fragments.length > 0) {
              const parent = textNode.parentNode;
              if (parent) {
                fragments.forEach(fragment => {
                  parent.insertBefore(fragment, textNode);
                });
                parent.removeChild(textNode);
              }
            }
          });

          elements.push(
            <div
              key={index}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tempDiv.innerHTML) }}
            />
          );
        }
      }
    });

    return elements;
  };

  return (
    <Page>
      <Header />
      <ContentContainer>
        {(!article || !author || !htmlContent) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="h4" color="text.primary">
                  {article.title}
                </Typography>
                <Typography>
                  {article.description}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography
                  sx={{ cursor: 'pointer' }}
                  color="text.primary"
                  onClick={() => author && console.log(`ID автора: ${article.userId}`)}
                >
                  {author ? `${author.lastName} ${author.firstName} ${author.middleName}` : "Загрузка…"}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  {article.updatedAt ? "Обновлено" : "Создано"}: {article.updatedAt ? formatDate(article.updatedAt) : formatDate(article.createdAt)}
                </Typography>
                {user && user.id === article.userId ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    component={ReactDOM.Link}
                    to="edit"
                    sx={{ margin: '1rem 0' }}
                  >
                    Изменить
                  </Button>
                ) : null}
              </Box>
            </Box>
            <Divider variant="middle" />
            <Box>
              <div style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                {htmlContent && renderContent(htmlContent)}
              </div>
            </Box>
          </PageCard>
        )}
      </ContentContainer>
    </Page>
  );
}