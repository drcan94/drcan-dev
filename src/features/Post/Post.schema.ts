import * as zod from 'zod'

export const postSchema = zod.z.object({
  title: zod.z.string().nonempty('Title is required'),
  content: zod.z.string().nonempty('Content is required'),
  timeReading: zod.number({
    required_error: 'Time is required',
  }),
  category: zod.string().array().max(3).nullable(),
  image: zod.custom<File>().nullable(),
})

export type PostSchemaValues = zod.infer<typeof postSchema>
