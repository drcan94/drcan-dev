import React from "react";
import {
  IconGitPullRequest, IconHome, IconHome2, IconHomeBolt, IconHomeHand, IconHomeOff,
} from "@tabler/icons-react";
import {
  ThemeIcon,
  UnstyledButton,
  Group,
  Text,
  type MantineTheme,
} from "@mantine/core";
import Link from "next/link";

interface MainLinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  path: string;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  sm: boolean;
}

const MainLink: React.FC<MainLinkProps> = ({
  icon,
  color,
  label,
  path,
  setOpened,
  sm,
}) => {
  return (
    <UnstyledButton
      sx={(theme: MantineTheme) => ({
        display: "block",
        width: 250,
        padding: theme ? theme.spacing.xs : 0,
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.violet[4],
          color:
            theme.colorScheme === "dark" ? theme.colors.red[4] : theme.white,
        },
      })}
      component={Link}
      href={path}
      onClick={() => sm && setOpened((o: boolean) => !o)}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
};

const data = [
  {
    icon: <IconHome size={20} />,
    color: "blue",
    label: "Anasayfa",
    path: "/",
  },
];

export function MainLinks({
  setOpened,
  sm,
}: {
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  sm: boolean;
}) {
  const links = data.map((link) => (
    <MainLink sm={sm} setOpened={setOpened} {...link} key={link.label} />
  ));
  return <div>{links}</div>;
}
