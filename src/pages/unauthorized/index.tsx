import { Button } from "@mantine/core";
import { type NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Yetkiniz Yok</title>
      </Head>
      <div>
        <Button
          component="a"
          href="https://youtu.be/QftqvrC58dE?t=107"
          style={{
            display: "flex",
            height: "fit-content",
            width: "fit-content",
            padding: "1rem",
          }}
        >
          Yav Sen kimsin?
          <br />
          <br />
          Asıl sen kimsin?
        </Button>
      </div>
    </>
  );
};

export default Home;
