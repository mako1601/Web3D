import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ArticleDto } from "../api/articleApi";
import { getUserById } from "../api/userApi";

interface ArticleCardProps {
  article: ArticleDto;
  onClick: () => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(" г.", "");
};

const ArticleCard = ({ article, onClick }: ArticleCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [author, setAuthor] = useState<{ lastName: string;firstName: string; middleName?: string } | null>(null);

  const isLongText = article.description.split("\n").length > 3;

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUserById(article.userId);
        setAuthor(userData);
      } catch (error) {
        console.error("Ошибка загрузки автора: ", error);
      }
    };

    fetchAuthor();
  }, [article.userId]);

  const handleDescriptionClick = () => {
    if (isLongText) {
      setExpanded(!expanded);
    } else {
      onClick();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "8px",
        transition: "background-color 0.3s ease",
        backgroundColor: hovered ? "#f0f0f0" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ padding: "1rem", cursor: 'pointer' }} onClick={onClick}>
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          {article.title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            {author ? `${author.lastName} ${author.firstName} ${author.middleName}`: "Загрузка…"}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {article.updatedAt ? "Обновлено" : "Создано"}: {article.updatedAt ? formatDate(article.updatedAt) : formatDate(article.createdAt)}
          </Typography>
        </Box>
      </Box>
      {article.description !== "" && (
        <Box
          sx={{ padding: "0 1rem 1rem 1rem", cursor: 'pointer', position: "relative", overflow: "hidden" }}
          onClick={handleDescriptionClick}
        >
          <Typography
            sx={{
              color: "text.secondary",
              whiteSpace: "pre-line",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: expanded ? "unset" : 3,
              overflow: "hidden",
              transition: "max-height 0.3s ease",
              wordBreak: "break-word",
            }}
          >
            {article.description}
          </Typography>
          {!expanded && isLongText && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "3rem",
                background: "linear-gradient(transparent, grey)",
                borderRadius: "8px",
              }}
            />
          )}
        </Box>
      )}
    </div>
  );
};

export default ArticleCard;