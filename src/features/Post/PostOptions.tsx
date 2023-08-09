import { ActionIcon, Badge, Menu } from "@mantine/core";
import { type FC, type MouseEvent } from "react";
import { usePostStyles } from "./Post.styles";
import {
  IconAlertTriangleFilled,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { modals } from "@mantine/modals";

interface PostOptionsProps {
  id: string;
}

export const PostOptions: FC<PostOptionsProps> = ({ id }) => {
  const router = useRouter();
  const utils = api.useContext();
  const { classes } = usePostStyles();

  const { mutateAsync } = api.post.deletePost.useMutation({
    onSuccess: async () => {
      await utils.post.getAllPosts.invalidate();
    },
  });

  const openDeleteModal = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    event?.preventDefault();

    modals.openConfirmModal({
      title: "Delete your post",
      centered: true,
      size: "lg",
      children: (
        <Badge
          color="red"
          radius="md"
          size="lg"
          leftSection={
            <IconAlertTriangleFilled color="red" className={classes.icon} />
          }
          className={classes.badge}
        >
          A
          <span className={classes.lowercase}>
            re you sure you want to delete this post?
          </span>
          T
          <span className={classes.lowercase}>
            his action is destructive and you will
          </span>
          <br />
          <span className={classes.lowercase}>
            have to contact the support to restore your data
          </span>
        </Badge>
      ),
      labels: { confirm: "Delete post", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => void mutateAsync(id),
    });
  };

  const onEdit = async (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    event?.preventDefault();
    //TODO: create id page of post
    await router.push(`/post/${id}`);
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon
          onClick={(event) => event.preventDefault()}
          variant="outline"
          size="md"
          className={classes.dots}
        >
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item icon={<IconPencil size={14} />} onClick={() => void onEdit}>
          Edit
        </Menu.Item>
        <Menu.Item
          color="red"
          icon={<IconTrash size={14} />}
          onClick={openDeleteModal}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
