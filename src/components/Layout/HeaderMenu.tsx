import { type FC } from "react";
import { Box, Flex, Button, rem } from "@mantine/core";
import { useDisclosure /* useHeadroom */ } from "@mantine/hooks";
import { useLayoutStyles } from "./Layout.styles";
import { Authentication } from "~/features/Authentication";
import { Notification } from "../Notification";
import { IconPlus } from "@tabler/icons-react";
import { PostModal } from "~/components/Layout/PostModal";
import { useSession } from "next-auth/react";

export const HeaderMenu: FC<{ sm: boolean }> = ({ sm }) => {
  const { classes } = useLayoutStyles();
  const { data: session } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  // const pinned = useHeadroom({ fixedAt: 120 });

  return (
    <Box
      sx={() => ({
        display: "flex",
        width: "100%",
        justifyContent: "flex-end",
        padding: 0,
        height: rem(70),
        // transform: `translate3d(0,${pinned ? 0 : rem(-110)} , 0`,
        transition: "transform 400ms ease",
      })}
    >
      <Flex align="center" justify="flex-end" className={classes.flex}>
        <Flex align="center" gap={15}>
          {session && <Notification sm={sm} />}
          <Authentication sm={sm} />
          {session && (
            <Flex
              justify="center"
              align={"center"}
              className={classes.writeButton}
            >
              <Button
                style={{
                  fontSize: sm ? 12 : 16,
                }}
                size={sm ? "xs" : "sm"}
                onClick={open}
                leftIcon={<IconPlus size={sm ? 16 : 24} />}
              >
                Yaz
              </Button>
            </Flex>
          )}
          <PostModal opened={opened} close={close} />
        </Flex>
      </Flex>
    </Box>
  );
};
