/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, Flex, Indicator, Menu, Text } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { useState, type FC, useEffect } from "react";
import { useNotificationStyles } from "./Notification.styles";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { type Post } from "@prisma/client";

export const Notification: FC<{ sm: boolean }> = ({ sm }) => {
  const router = useRouter();
  const { classes } = useNotificationStyles();

  const [isNotification, setIsNotification] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // const notifications = api.notification.getAllNotifications.useQuery().data

  // const { mutateAsync } = api.notification.seeNotification.useMutation()

  // const onNotificationClick = (id: string) => {
  //     mutateAsync(id)
  //     router.push(`/post/${id}`)
  // }

  // useEffect(() => {
  //     if (notifications && notifications.length) {
  //         setIsNotification(notifications.some((notification) => !notification.read))
  //         setIsProcessing(true)
  //     } else setIsNotification(false)
  // }, [notifications])

  useEffect(() => {
    isProcessing && setTimeout(() => setIsProcessing(false), 4000);
  }, [isProcessing]);

  return (
    <Menu shadow="md" position="bottom-end">
      <Menu.Target>
        <Indicator size={10} disabled={!isNotification} processing>
          <Avatar size={sm ? "sm" : "md"} radius="xl" color="indigo" className={classes.avatar}>
            <IconBell size={sm ? 16 : 24} />
          </Avatar>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        {/* {notifications && notifications.length ? notifications.map((notification, i) => {
                    const data = JSON.parse(notification.message) as Post

                    return <Menu.Item key={i} onClick={() => onNotificationClick(notification.id)}>
                        <Flex gap={20} align="center">
                            <Avatar radius="xl" color="indigo" src={data.image} />
                            <Flex direction="column">
                                <Text size="md" weight="bold">New article is out!</Text>
                                <Text size="xs">{data.title}</Text>
                            </Flex>
                        </Flex>
                    </Menu.Item>
                }) : <Menu.Label>No notification</Menu.Label>} */}
        <Menu.Label>No notification</Menu.Label>
      </Menu.Dropdown>
    </Menu>
  );
};
