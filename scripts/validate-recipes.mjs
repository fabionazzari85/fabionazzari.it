import { publishedRecipeContents, recipeContents } from "../data/recipes.mjs";

const requiredFields = [
  "id",
  "title",
  "slug",
  "subtitle",
  "excerpt",
  "language",
  "category",
  "tags",
  "type",
  "status",
  "featuredImage",
  "imageAlt",
  "prepTime",
  "cookTime",
  "totalTime",
  "difficulty",
  "servings",
  "ingredients",
  "methodSteps",
  "technicalNotes",
  "commonMistakes",
  "conservation",
  "variations",
  "professionalTips",
  "faq",
  "sponsorDisclosure",
  "recommendedProducts",
  "seoTitle",
  "seoDescription",
  "manyChatKeyword",
  "isManyChatActiveRecipe",
  "ctaLabel",
  "ctaHref",
  "publishedAt",
  "updatedAt"
];

const errors = [];
const slugSet = new Set();
const activeManyChat = [];

for (const content of recipeContents) {
  for (const field of requiredFields) {
    if (!(field in content)) errors.push(`${content.id || "unknown"} missing ${field}`);
  }
  if (slugSet.has(content.slug)) errors.push(`Duplicate slug: ${content.slug}`);
  slugSet.add(content.slug);
  if (!["recipe", "guide", "technical_article"].includes(content.type)) errors.push(`${content.slug} has invalid type`);
  if (!["published", "hidden"].includes(content.status)) errors.push(`${content.slug} has invalid status`);
  if (content.isManyChatActiveRecipe) activeManyChat.push(content);
  if (content.type === "recipe" && (!content.ingredients.length || !content.methodSteps.length)) {
    errors.push(`${content.slug} recipe needs ingredients and methodSteps`);
  }
  if (!content.seoTitle || content.seoTitle.length > 70) errors.push(`${content.slug} seoTitle should exist and stay under 70 chars`);
  if (!content.seoDescription || content.seoDescription.length > 170) errors.push(`${content.slug} seoDescription should exist and stay under 170 chars`);
}

if (!publishedRecipeContents.length) errors.push("No published recipe contents found");
if (!activeManyChat.some((content) => content.manyChatKeyword === "RICETTA")) {
  errors.push("No active ManyChat recipe with keyword RICETTA");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${recipeContents.length} contents (${publishedRecipeContents.length} published).`);
