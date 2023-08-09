import { Avatar, Button, Menu } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { type FC } from "react";
import { useAuthenticationStyles } from "./Authentication.styles";

export const Authentication: FC<{ sm: boolean }> = ({ sm }) => {
  const { data: session } = useSession();

  const { classes } = useAuthenticationStyles();

  return session ? (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Avatar
          color="cyan"
          size={sm ? "sm" : "md"}
          radius="xl"
          className={classes.avatar}
        >
          {session.user.name?.charAt(0).toUpperCase()}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() => void signOut()}
          icon={<IconLogout size={14} />}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ) : (
    <Button variant="outline" onClick={() => void signIn()}>
      Sign in
    </Button>
  );
};
