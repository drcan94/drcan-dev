/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from "next/router";
import { useState, type FC, useEffect } from "react";
import { api } from "~/utils/api";
import { usePostStyles } from "./Post.styles";
import { useMutation } from "@tanstack/react-query";
import { useForm, zodResolver } from "@mantine/form";
import { type PostSchemaValues, postSchema } from "./Post.schema";
import {
  Button,
  FileInput,
  Group,
  NumberInput,
  Text,
  TextInput,
} from "@mantine/core";
import { Loader } from "~/components/Loader";
import { CustomMultiSelect } from "~/components/Select";
import { imageLinkToFile } from "./Post.utils";
import { uploadImage } from "~/pages/api/uploadImage";

interface PostEditProps {
  id: string;
}

export const PostEdit: FC<PostEditProps> = ({ id }) => {
  const router = useRouter();
  const { classes } = usePostStyles();

  const [loading, setLoading] = useState(false);

  const { data, isLoading } = api.post.getPost.useQuery(id);

  const { mutateAsync: uploadMutation } = useMutation(uploadImage);

  const { mutateAsync } = api.post.updatePost.useMutation({
    onSuccess: async () => {
      await router.push("/");
    },
  });

  const form = useForm({
    validate: zodResolver(postSchema),
    initialValues: {
      title: "",
      content: "",
      timeReading: 5,
      category: [""],
      image: new File([], "image.png", { type: "image/png" }),
    },
  });

  const { data: signatureData } =
    api.generateSignature.getSignature.useQuery(undefined);
  const { timestamp, signature } = signatureData || {};

  const onSubmit = async (values: PostSchemaValues) => {
    const { image, category, ...rest } = values;
    setLoading(true);

    const imageUrl =
      image &&
      signature &&
      timestamp &&
      (await uploadMutation({
        image,
        signature,
        timestamp,
      }));

    console.log("imageUrl", imageUrl);

    await mutateAsync({
      id,
      data: {
        ...rest,
        category: category ? category.join(", ") : "",
        image: imageUrl || "",
      },
    });

    setLoading(false);

    form.reset();
    close();
  };

  useEffect(() => {
    const updateFormValues = async () => {
      if (data) {
        let image = null;
        if (data.image) {
            console.log("data.image", data.image);
          const file = await imageLinkToFile(data.image);
          image = new File([file], file.name, { type: file.type });
        }

        form.setValues({
          title: data?.title,
          content: data.content,
          timeReading: data.timeReading,
          category: data.category?.split(",").map((cat) => cat.trim()),
          image: image ?? undefined,
        });
      }
    };

    updateFormValues();
  }, [data, form]);

  return (
    <>
      <Text weight="bold" size={20} className={classes.container}>
        Edit Post
      </Text>
      {isLoading ? (
        <Loader />
      ) : (
        // TODO: Refacto to make a single component with PostModal form
        <form onSubmit={form.onSubmit(onSubmit)} style={{ marginTop: "3rem" }}>
          <TextInput
            withAsterisk
            label="Title"
            placeholder="Kafka with tRPC"
            {...form.getInputProps("title")}
          />
          <TextInput
            withAsterisk
            label="Content"
            placeholder="Your content..."
            {...form.getInputProps("content")}
          />
          <NumberInput
            withAsterisk
            label="Time reading"
            placeholder="Your time..."
            mt="sm"
            {...form.getInputProps("timeReading")}
          />
          <CustomMultiSelect formElement={form.getInputProps("category")} />
          <FileInput
            label="Image"
            placeholder="Image of the post"
            mt="sm"
            accept="image/*"
            {...form.getInputProps("image")}
          />
          <Group position="center" mt="xl">
            <Button type="submit" loading={loading}>
              Edit
            </Button>
          </Group>
        </form>
      )}
    </>
  );
};
