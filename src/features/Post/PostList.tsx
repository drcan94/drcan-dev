import { Flex } from "@mantine/core";
import React, { type FC } from "react";
import { api } from "~/utils/api";

import { PostCard } from "./PostCard";

export const PostList: FC = () => {
  const allPosts = api.post.getAllPosts.useQuery();

  const posts = allPosts.data;
  console.log("posts", posts);
  return (
    <React.Fragment>
      {posts &&
        posts.map((post, i) => (
          <Flex key={i} direction="column">
            <PostCard {...post} lastItem={posts.length === i + 1} />
          </Flex>
        ))}
    </React.Fragment>
  );
};
