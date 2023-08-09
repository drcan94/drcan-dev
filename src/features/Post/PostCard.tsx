import { Avatar, Card, Flex, Image, Kbd, Text } from "@mantine/core";
import { type FC } from "react";
import { getTimeLabel } from "~/core/date";
import { api } from "~/utils/api";
import { usePostStyles } from "./Post.styles";
import { PostOptions } from "./PostOptions";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  timeReading: number;
  image: string | null;
  category: string | null;
  createdAt: Date;
  authorId: string;
  lastItem: boolean;
}

export const PostCard: FC<PostCardProps> = ({
  id,
  title,
  content,
  timeReading,
  category,
  image,
  authorId,
  createdAt,
  lastItem,
}) => {
  const { classes } = usePostStyles();

  const user = api.user.getUser.useQuery(authorId);

  const userName = user.data?.name;

  return (
    <Card
      component="a"
      href={"/post/" + id}
      shadow="lg"
      radius="md"
      padding="lg"
      withBorder
      className={classes.card}
      style={{ marginBottom: lastItem ? 0 : "null" }}
    >
      <PostOptions id={id} />
      <Flex align="center" justify="space-between">
        <Flex direction="column" gap={30}>
          <Flex align="center" gap={20}>
            <Avatar color="green" radius="xl" size="md">
              {userName?.charAt(0).toUpperCase()}
            </Avatar>
            <Text weight="bold" size="lg">
              {userName}
            </Text>
            <Text className={classes.date}>
              {createdAt.toLocaleDateString("tr-Tr", {
                day: "numeric",
                month: "short",
              })}
            </Text>
          </Flex>
          <Flex direction="column" gap={15}>
            <Text weight="bold" size={20}>
              {title}
            </Text>
            <Text size={16} className={classes.description}>
              {content}
            </Text>
          </Flex>
          <Flex align="center" gap={15}>
            <Kbd size="md">{category}</Kbd>
            <Text size={16} className={classes.description}>
              {`${getTimeLabel(timeReading)} read`}
            </Text>
          </Flex>
        </Flex>
        <Image maw={150} radius="md" src={image} alt="Post image" />
      </Flex>
    </Card>
  );
};
