/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, type FC } from "react";
import { api } from "~/utils/api";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { type PostSchemaValues, postSchema } from "../../features/Post/Post.schema";
import { uploadImage } from "~/pages/api/uploadImage";
import {
  Button,
  FileInput,
  Group,
  Modal,
  NumberInput,
  TextInput,
} from "@mantine/core";
import { CustomMultiSelect } from "~/components/Select";

interface PostModalProps {
  opened: boolean;
  close: () => void;
}

export const PostModal: FC<PostModalProps> = ({ opened, close }) => {
  const utils = api.useContext();
  const [loading, setLoading] = useState(false);

  // signature and timestamp are used to upload images to cloudinary
  const { data } = api.generateSignature.getSignature.useQuery(undefined);
  const { timestamp, signature, folder } = data || {};

  const { mutateAsync: uploadMutation } = useMutation(uploadImage);

  const form = useForm({
    validate: zodResolver(postSchema),
    initialValues: {
      title: "",
      link: "",
      content: "",
      timeReading: 5,
      image: null,
      category: null,
    },
  });

  const { mutateAsync: addPostMutation } = api.post.addPost.useMutation({
    onSuccess: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      utils.post.getAllPosts.invalidate();
    },
  });

  const submitHandler = async (values: PostSchemaValues) => {
    const { image, category, ...rest } = values;

    setLoading(true);
    const uploadedImageUrl =
      image &&
      signature &&
      timestamp &&
      (await uploadMutation({
        image,
        signature,
        timestamp,
        folder,
      }));

    await addPostMutation({
      ...rest,
      category: category ? category.join(", ") : "",
      image: uploadedImageUrl || "",
    });

    setLoading(false);

    form.reset();
    close();
  };

  return (
    <Modal opened={opened} onClose={close} title="Create post" centered>
      <form onSubmit={form.onSubmit(submitHandler)}>
        <TextInput
          withAsterisk
          label="Title"
          placeholder="Kafka with tRPC"
          {...form.getInputProps("title")}
        />
        <TextInput
          withAsterisk
          label="Content"
          placeholder="Your Content."
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
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
