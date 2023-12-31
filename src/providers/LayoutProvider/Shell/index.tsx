import React, { useEffect, useState } from "react";
import { useClickOutside, useMediaQuery } from "@mantine/hooks";
import { MainLinks } from "../MainLinks";
import { Brand } from "../Brand";
import { User } from "../User";
import { Box, type MantineColor } from "@mantine/core";
import { HeaderMenu } from "../../../components/Layout/HeaderMenu";
import {
  AppShell,
  Navbar,
  Header,
  Burger,
  useMantineTheme,
  ScrollArea,
  Aside,
} from "@mantine/core";
import type { NextPage } from "next";
import { useSelector } from "react-redux";
import { selectRtl } from "~/redux/modules/ui/uiSlice";

const Shell: NextPage<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useMantineTheme();
  const rtl = useSelector(selectRtl);

  // const xs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`, undefined, {
  //   getInitialValueInEffect: false,
  // });

  const sm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`, undefined, {
    getInitialValueInEffect: false,
  });

  const md = useMediaQuery(`(max-width: ${theme.breakpoints.md})`, undefined, {
    getInitialValueInEffect: false,
  });

  // const lg = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`, undefined, {
  //   getInitialValueInEffect: false,
  // });

  const xl = useMediaQuery(`(max-width: ${theme.breakpoints.xl})`, undefined, {
    getInitialValueInEffect: false,
  });

  const [opened, setOpened] = useState(sm ? false : true);
  const [top, setTop] = useState("0");
  const [navbar, setNavbar] = useState<HTMLElement | null>(null);
  const [header, setHeader] = useState<HTMLElement | null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const borderColor: MantineColor =
    theme.colorScheme === "dark" ? theme.colors.gray[6] : theme.colors.dark[9];

  const bgColor: MantineColor =
    theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2];

  const navBgColor: MantineColor =
    theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.cyan[0];
  useClickOutside(() => sm && opened && setOpened(false), null, [
    navbar,
    header,
  ]);

  useEffect(() => {
    sm ? setOpened(false) : setOpened(true);
  }, [sm]);

  useEffect(() => {
    let prevScrollpos = window.scrollY;
    window.onscroll = function () {
      const currentScrollPos = window.scrollY;
      if (prevScrollpos > currentScrollPos) {
        setTop("0");
      } else {
        setTop(md ? "-56" : "-70");
      }
      prevScrollpos = currentScrollPos;
    };
  }, [top, md]);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
  }, [isFirstRender]);

  if (isFirstRender) {
    // conditionally render your component
    // only on the client side by checking
    // if the window object is available
    return null;
  }

  return (
    <AppShell
      layout={sm ? "default" : "alt"}
      styles={{
        main: {
          background: bgColor,
          paddingLeft: opened && !sm ? "300px !important" : "0 !important",
          paddingRight: xl
            ? "0 !important"
            : "calc(var(--mantine-aside-width, 0px))",
          filter: opened && sm ? "blur(10px)" : "blur(0)",
          transition: "padding-left .3s linear",
        },
        root: {
          header: {
            transition: "top .4s linear, left .3s ease, left .3s linear",
            borderBottomColor: borderColor,
          },
          aside: {
            transition: "top .4s linear",
          },
        },
      }}
      header={
        <Header
          ref={setHeader}
          top={`${top}px`}
          height={{ base: 50, md: 70 }}
          p="md"
          dir={rtl ? "rtl" : "ltr"}
          sx={{
            zIndex: 101,
          }}
          right={0}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              minWidth: "100%",
            }}
          >
            {/* <MediaQuery largerThan="sm" styles={{ display: "none" }}> */}
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
              mr="md"
              ml={-5}
            />
            {/* </MediaQuery> */}
            <HeaderMenu sm={sm} />
          </div>
        </Header>
      }
      navbarOffsetBreakpoint={"xs"}
      asideOffsetBreakpoint={"xl"}
      aside={
        <Aside
          hidden={xl}
          hiddenBreakpoint="xl"
          width={{ xl: 500, lg: 0 }}
          top={`calc(var(--mantine-header-height, 0px) + calc(${top}px))`}
        >
          <Aside.Section mt={10} px={"sm"}>
            Header
          </Aside.Section>
          <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
            <Box p="sm">Body</Box>
          </Aside.Section>
          <Aside.Section>
            <Box py="xs" px="sm">
              Down
            </Box>
          </Aside.Section>
        </Aside>
      }
      navbar={
        <Navbar
          ref={setNavbar}
          width={{ xs: opened ? 300 : 0 }}
          hiddenBreakpoint="xs"
          hidden={!opened}
          height={`calc({100%} - var(--mantine-header-height, 0rem) - var(--mantine-footer-height, 0rem))`}
          bg={navBgColor}
          sx={{
            overflow: "hidden",
            zIndex: 100,
            borderRightColor: rtl ? borderColor : "unset",
            borderLeftColor: !rtl ? borderColor : "unset",
            borderWidth: opened ? "1px" : 0,
            transition: "all .3s linear",
          }}
        >
          <Navbar.Section mt={10} px={"sm"}>
            <Brand sm={sm} setOpened={setOpened} />
          </Navbar.Section>
          <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
            <Box p="sm">
              <MainLinks sm={sm} setOpened={setOpened} />
            </Box>
          </Navbar.Section>
          <Navbar.Section>
            <Box py="xs" px="sm">
              <User />
            </Box>
          </Navbar.Section>
        </Navbar>
      }
    >
      <Box dir={rtl ? "rtl" : "ltr"} style={{ padding: "0 20px" }}>
        {children}
      </Box>
    </AppShell>
  );
};

export default Shell;
