import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration to add default "genel" category...');

  // Create the default "genel" category if it doesn't exist
  const existingGeneralCategory = await prisma.category.findFirst({
    where: { slug: "genel" },
  });

  let generalCategory;
  if (!existingGeneralCategory) {
    console.log('Creating "genel" category...');
    generalCategory = await prisma.category.create({
      data: {
        name: "Genel",
        slug: "genel",
      },
    });
    console.log('Created "genel" category:', generalCategory);
  } else {
    console.log('"genel" category already exists:', existingGeneralCategory);
    generalCategory = existingGeneralCategory;
  }

  // Get all existing posts without a category
  console.log("Finding posts without a category...");
  const posts = await prisma.blogPost.findMany();
  console.log(`Found ${posts.length} total posts`);

  // Update each post to use the general category
  console.log('Updating posts to use the "genel" category...');
  const updatePromises = posts.map((post) =>
    prisma.blogPost.update({
      where: { id: post.id },
      data: { categoryId: generalCategory!.id },
    }),
  );

  const updatedPosts = await Promise.all(updatePromises);
  console.log(
    `Updated ${updatedPosts.length} posts to use the "genel" category`,
  );

  console.log("Migration completed successfully!");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
